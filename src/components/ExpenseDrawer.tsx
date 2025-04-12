'use client';

import { Drawer, TextInput, Button, Stack, NumberInput,} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

import { createExpense, updateExpense } from '@/lib/expenses';
import type { Expense } from '@/lib/expenses';

interface ExpenseDrawerProps {
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
  expenseToEdit?: Expense | null; //para cuando vayamos a editar un expense desde el drawer
}

export default function ExpenseDrawer({ opened, onClose, onSuccess, expenseToEdit }: ExpenseDrawerProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      amount: 0,
      date: new Date(),
      type: '',
      category: '',
    },
  });

  useEffect(() => {
    if (expenseToEdit) {
      form.setValues({
        amount: parseFloat(expenseToEdit.amount.toString()),
        date: new Date(expenseToEdit.date),
        type: expenseToEdit.type,
        category: expenseToEdit.category,
      });
    } else {
      form.reset();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps  
  }, [expenseToEdit]);

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    try {
      if (expenseToEdit) {
        await updateExpense(expenseToEdit.id, {
          amount: values.amount,
          date: values.date.toISOString(),
          type: values.type,
          category: values.category
        });
        showNotification({
          title: 'Gasto actualizado',
          message: 'Los cambios se han guardado correctamente',
          color: 'zenkoo',
          icon: <IconCheck size={16} />,
        });
      } else {
        await createExpense({
          amount: values.amount,
          date: values.date.toISOString(),
          type: values.type,
          category: values.category
        });
        showNotification({
          title: 'Gasto creado',
          message: 'El gasto se ha registrado correctamente',
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
        message: 'No se pudo guardar el gasto',
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
      title="Nuevo gasto"
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
            label="Tipo"
            placeholder="Ej: Sueldo, Extra, etc."
            {...form.getInputProps('type')}
            required
          />
          <TextInput
            label="Categoría"
            placeholder="Ej: Sueldo, Extra, etc."
            {...form.getInputProps('category')}
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