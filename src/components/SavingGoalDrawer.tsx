'use client';

import { Drawer, TextInput, Button, Stack, NumberInput, Group, Select } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useState, useEffect } from 'react';
import { showNotification } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';
import { createSavingGoal, updateSavingGoal } from '@/lib/savinggoals';
import type { SavingGoal } from '@/lib/savinggoals';
import { Save } from 'lucide-react';

interface SavingGoalDrawerProps {
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
  savingGoalToEdit?: SavingGoal | null; //para cuando vayamos a editar un income desde el drawer
}

export default function SavingGoalDrawer({ opened, onClose, onSuccess, savingGoalToEdit  }: SavingGoalDrawerProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      title: '',
      target_amount: 0,
      current_amount: 0,
      deadline: undefined as Date | undefined,
      status: 'active',
    },
    validate: {
      title: (value) => (value.trim().length < 3 ? 'Título demasiado corto' : null),
      target_amount: (value) => (value <= 0 ? 'Debe ser mayor que cero' : null),
      current_amount: (value) => (value < 0 ? 'Debe ser mayor o igual que cero' : null),
      status: (value) => (!value ? 'Selecciona un estado' : null),
    },
  });

  useEffect(() => {
    if (savingGoalToEdit) {
      form.setValues({
        title: savingGoalToEdit.title,
        target_amount: parseFloat(savingGoalToEdit.target_amount.toString()),
        current_amount: parseFloat(savingGoalToEdit.current_amount.toString()),
        deadline: savingGoalToEdit.deadline ? new Date(savingGoalToEdit.deadline) : undefined,
        status: savingGoalToEdit.status,
      });
    } else {
      form.reset();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savingGoalToEdit]);

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    try {
      if (savingGoalToEdit) {
        await updateSavingGoal(savingGoalToEdit.id, {
          title: values.title,
          target_amount: values.target_amount,
          current_amount: values.current_amount,
          deadline: values.deadline ? values.deadline.toISOString() : null,
          status: values.status,
        });
        showNotification({
          title: 'Ingreso actualizado',
          message: 'Los cambios se han guardado correctamente',
          color: 'zenkoo',
          icon: <IconCheck size={16} />,
        });
      } else {
        await createSavingGoal({
          title: values.title,
          target_amount: values.target_amount,
          current_amount: values.current_amount,
          deadline: values.deadline ? values.deadline.toISOString() : null,
          status: values.status,
        });
        showNotification({
          title: 'Meta creada',
          message: 'Tu objetivo de ahorro ha sido guardado 🐷',
          color: 'zenkoo',
          icon: <IconCheck size={16} />,
        });
      }
  
      form.reset();
      onClose();
      onSuccess();
    } catch (err) {
      console.error(err);
      showNotification({
        title: 'Error',
        message: 'No se pudo crear la meta',
        color: 'zenkooRed',
        icon: <IconX size={16} />,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title="Nueva meta de ahorro"
      position="right"
      size="md"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <TextInput
            label="Título"
            placeholder="Ej: Viaje a Japón"
            {...form.getInputProps('title')}
          />

          <NumberInput
            label="Cantidad objetivo (€)"
            min={0}
            step={0.01}
            decimalSeparator=","
            decimalScale={2}
            fixedDecimalScale
            hideControls
            {...form.getInputProps('target_amount')}
          />

          <NumberInput
            label="Cantidad actual (€)"
            min={0}
            step={0.01}
            decimalSeparator=","
            decimalScale={2}
            fixedDecimalScale
            hideControls
            {...form.getInputProps('current_amount')}
          />

          <DateInput
            label="Fecha límite (opcional)"
            valueFormat="DD/MM/YYYY"
            clearable
            {...form.getInputProps('deadline')}
          />

          <Select
            label="Estado"
            data={[
              { value: 'active', label: 'Activa' },
              { value: 'paused', label: 'Pausada' },
              { value: 'completed', label: 'Completada' },
            ]}
            {...form.getInputProps('status')}
            defaultValue={'active'}
          />

          <Group justify="flex-end" mt="md">
            <Button type="submit" loading={loading} leftSection={<Save size={16} />}>
              Guardar meta
            </Button>
          </Group>
        </Stack>
      </form>
    </Drawer>
  );
}