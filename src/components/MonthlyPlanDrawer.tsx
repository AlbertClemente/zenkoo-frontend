'use client';

import {
  Drawer,
  NumberInput,
  Textarea,
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
};

export default function MonthlyPlanDrawer({ opened, onClose, onSuccess }: Props) {
  const [reservedSavings, setReservedSavings] = useState<number | undefined>(undefined);
  const [reflection, setReflection] = useState('');

  const [initialSavings, setInitialSavings] = useState<number | undefined>(undefined);
  const [initialReflection, setInitialReflection] = useState('');

  const [loading, setLoading] = useState(false);

  const hasChanges =
    reservedSavings !== initialSavings ||
    reflection.trim() !== initialReflection.trim();

  // Cargar los datos existentes cuando se abre
  useEffect(() => {
    if (!opened) {
      setReservedSavings(undefined);
      setReflection('');
      setInitialSavings(undefined);
      setInitialReflection('');
      return;
    }

    const fetchPlan = async () => {
      try {
        const res = await api.get('/api/monthly-plan/current/');
        const saved = res.data.reserved_savings ?? '';
        const note = res.data.reflection ?? '';
        setReservedSavings(saved);
        setReflection(note);
        setInitialSavings(saved);
        setInitialReflection(note);
      } catch (err) {
        console.error('Error al cargar el plan mensual', err);
      }
    };

    fetchPlan();
  }, [opened]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.post('/api/monthly-plan/', {
        reserved_savings: reservedSavings ?? 0,
        reflection,
      });

      showNotification({
        title: 'Plan actualizado',
        message: 'Tu meta y reflexión se han guardado correctamente',
        color: 'zenkoo',
        icon: <IconCheck size={16} />,
      });

      onSuccess();
      onClose();
    } catch (err) {
      showNotification({
        title: 'Error al guardar',
        message: 'No se pudo actualizar el plan mensual',
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
    <Drawer
      opened={opened}
      onClose={handleClose}
      title="Editar plan mensual"
      position="right"
      size="md"
    >
      <Stack>
        <NumberInput
          label="Ahorro reservado (meta mensual)"
          value={reservedSavings}
          onChange={(value) =>
            setReservedSavings(typeof value === 'number' ? value : undefined)
          }
          min={0}
          step={0.01}
          decimalSeparator=","
          decimalScale={2}
          fixedDecimalScale
          hideControls
        />

        <Textarea
          label="Reflexión del mes"
          placeholder="¿Qué aprendiste o cómo podrías mejorar?"
          value={reflection}
          onChange={(e) => setReflection(e.currentTarget.value)}
          minRows={4}
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