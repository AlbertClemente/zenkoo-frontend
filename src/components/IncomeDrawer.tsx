'use client';

import { Drawer, TextInput, Button, Stack, NumberInput,} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { createIncome, updateIncome } from '@/lib/incomes';
import type { Income } from '@/lib/incomes';

interface IncomeDrawerProps {
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
  incomeToEdit?: Income | null; //para cuando vayamos a editar un income desde el drawer
}

export default function IncomeDrawer({ opened, onClose, onSuccess, incomeToEdit }: IncomeDrawerProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      amount: 0,
      date: new Date(),
      type: '',
    },
  });

  useEffect(() => {
    if (incomeToEdit) {
      form.setValues({
        amount: parseFloat(incomeToEdit.amount.toString()),
        date: new Date(incomeToEdit.date),
        type: incomeToEdit.type,
      });
    } else {
      form.reset();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomeToEdit]);
  

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    try {
      if (incomeToEdit) {
        await updateIncome(incomeToEdit.id, {
          amount: values.amount,
          date: values.date.toISOString(),
          type: values.type,
        });
        showNotification({
          title: 'Ingreso actualizado',
          message: 'Los cambios se han guardado correctamente',
          color: 'zenkoo',
          icon: <IconCheck size={16} />,
        });
      } else {
        await createIncome({
          amount: values.amount,
          date: values.date.toISOString(),
          type: values.type,
        });
        showNotification({
          title: 'Ingreso creado',
          message: 'El ingreso se ha registrado correctamente',
          color: 'zenkoo',
          icon: <IconCheck size={16} />,
        });
      }
  
      form.reset();
      onClose();
      onSuccess();
    } catch (error) {
      showNotification({
        title: 'Error',
        message: 'No se pudo guardar el ingreso',
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
      title="Nuevo ingreso"
      padding="xl"
      size="sm"
      position="right"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <NumberInput
            label="Importe (€)"
            min={0}
            step={0.01}
            decimalSeparator=","
            decimalScale={2}
            fixedDecimalScale
            hideControls
            {...form.getInputProps('amount')}
            required
          />
          <DateInput
            label="Fecha"
            placeholder="Selecciona una fecha"
            valueFormat="DD/MM/YYYY"
            {...form.getInputProps('date')}
            required
          />
          <TextInput
            label="Categoría"
            placeholder="Ej: Sueldo, Extra, etc."
            {...form.getInputProps('type')}
            required
          />
          <Button type="submit" loading={loading} fullWidth>
            Guardar ingreso
          </Button>
        </Stack>
      </form>
    </Drawer>
  );
}
