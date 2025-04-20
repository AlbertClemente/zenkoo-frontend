'use client';

import {
  Drawer,
  NumberInput,
  Textarea,
  TextInput,
  Button,
  Stack,
} from '@mantine/core';
import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { showNotification } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';
import { modals } from '@mantine/modals';

type Props = {
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
  monthlyPlanToEdit?: any;
};

export default function MonthlyPlanDrawer({ opened, onClose, onSuccess, monthlyPlanToEdit }: Props) {
  const [reservedSavings, setReservedSavings] = useState<number | undefined>(undefined);
  const [form, setForm] = useState({
    reflectionTitle: '',
    reflection: '',
  });

  const [monthlyPlanId, setMonthlyPlanId] = useState<string | null>(null);
  const [initial, setInitial] = useState({
    reservedSavings: undefined,
    reflectionTitle: '',
    reflection: '',
  });

  const [loading, setLoading] = useState(false);

  const hasChanges =
    reservedSavings !== initial.reservedSavings ||
    form.reflectionTitle.trim() !== initial.reflectionTitle.trim() ||
    form.reflection.trim() !== initial.reflection.trim();

  useEffect(() => {
    if (!opened) {
      setReservedSavings(undefined);
      setForm({ reflectionTitle: '', reflection: '' });
      setInitial({ reservedSavings: undefined, reflectionTitle: '', reflection: '' });
      setMonthlyPlanId(null);
      return;
    }

    const fetchPlan = async () => {
      try {
        if (monthlyPlanToEdit) {
          setMonthlyPlanId(monthlyPlanToEdit.id);
          setReservedSavings(monthlyPlanToEdit.reserved_savings);
          setForm({
            reflection: monthlyPlanToEdit.reflection?.content || '',
            reflectionTitle: monthlyPlanToEdit.reflection?.title || '',
          });
          setInitial({
            reservedSavings: monthlyPlanToEdit.reserved_savings,
            reflection: monthlyPlanToEdit.reflection?.content || '',
            reflectionTitle: monthlyPlanToEdit.reflection?.title || '',
          });
        } else {
          const res = await api.get('/api/monthly-plan/current/');
          const saved = res.data.reserved_savings ?? '';
          const note = res.data.reflection ?? '';
          setReservedSavings(saved);
          setForm({ reflection: note.content || '', reflectionTitle: note.title || '' });
          setInitial({ reservedSavings: saved, reflection: note.content || '', reflectionTitle: note.title || '' });
          setMonthlyPlanId(res.data.id); // para actualizar si ya existe
        }
      } catch (err) {
        console.error('Error al cargar el plan mensual', err);
      }
    };

    fetchPlan();
  }, [opened, monthlyPlanToEdit]);

  const handleSave = async () => {
    setLoading(true);
  
    try {
      if (form.reflectionTitle.trim() && !form.reflection.trim()) {
        showNotification({
          title: 'Reflexión incompleta',
          message: 'Has escrito un título pero no el contenido de la reflexión.',
          color: 'yellow',
        });
        setLoading(false);
        return;
      }
  
      let reflectionResponse;
  
      // Crear o actualizar el plan mensual
      await api.post('/api/monthly-plan/', {
        reserved_savings: reservedSavings,
      });
  
      // Refrescar el plan actualizado desde el backend
      const refreshed = await api.get('/api/monthly-plan/current/');
      const planId = refreshed.data.id;
  
      // Crear reflexión si corresponde
      if (form.reflection.trim()) {
        const reflectionPayload = {
          monthly_plan_id: planId,
          title: form.reflectionTitle,
          content: form.reflection,
        };
      
        const reflectionId = refreshed.data.reflection?.id;
      
        if (reflectionId) {
          // Actualizar reflexión existente
          reflectionResponse = await api.put(`/api/reflections/${reflectionId}/`, reflectionPayload);
        } else {
          // Crear nueva reflexión
          reflectionResponse = await api.post('/api/reflections/', reflectionPayload);
          
          // Asociar reflexión al plan
          await api.post('/api/monthly-plan/', {
            reserved_savings: reservedSavings,
            reflection_pk: reflectionResponse.data.id,
          });
        }
      }
  
      showNotification({
        title: 'Plan actualizado',
        message: 'Tu meta y reflexión se han guardado correctamente',
        color: 'zenkoo',
        icon: <IconCheck size={16} />,
      });
  
      onSuccess();
      onClose();
      setTimeout(() => setLoading(false), 1000); // Desactiva el loading 1 segundo después
    } catch (err: any) {
      showNotification({
        title: 'Error al guardar',
        message: err.message || 'No se pudo actualizar el plan mensual',
        color: 'zenkooRed',
        icon: <IconX size={16} />,
      });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!hasChanges) {
      onClose();
      return;
    }

    modals.openConfirmModal({
      title: 'Cambios sin guardar',
      centered: true,
      children: 'Tienes cambios sin guardar. ¿Seguro que quieres cerrar sin guardar?',
      labels: {
        confirm: 'Cerrar sin guardar',
        cancel: 'Seguir editando',
      },
      confirmProps: { color: 'zenkooRed' },
      onConfirm: () => {
        onClose();
      },
    });
  };

  return (
    <Drawer opened={opened} onClose={handleClose} title="Editar plan mensual" position="right" size="md">
      <Stack>
        <NumberInput
          label="Ahorro reservado (meta mensual)"
          value={reservedSavings}
          onChange={(value) =>
            setReservedSavings(typeof value === 'number' ? value : undefined)
          }
          min={0}
          step={0.01}
          thousandSeparator="."
          decimalSeparator=","
          decimalScale={2}
          fixedDecimalScale
          hideControls
        />

        <TextInput
          label="Título de la reflexión"
          placeholder="Ej. Mis aprendizajes de abril"
          value={form.reflectionTitle}
          onChange={(e) => setForm((prev) => ({ ...prev, reflectionTitle: e.target.value }))}
          withAsterisk={form.reflection.trim().length > 0}
        />

        <Textarea
          label="Reflexión del mes"
          placeholder="¿Qué aprendiste o cómo podrías mejorar?"
          value={form.reflection}
          onChange={(e) => setForm((prev) => ({ ...prev, reflection: e.target.value }))}
          minRows={4}
          maxRows={20}
          resize="vertical"
        />

        <Button
          onClick={handleSave}
          loading={loading}
          disabled={!hasChanges}
          color="zenkoo"
        >
          Guardar
        </Button>
      </Stack>
    </Drawer>
  );
}
