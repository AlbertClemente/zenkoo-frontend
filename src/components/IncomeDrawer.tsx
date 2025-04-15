'use client';

import {
  Drawer,
  TextInput,
  Button,
  Stack,
  NumberInput,
  Select,
} from '@mantine/core';
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
  incomeToEdit?: Income | null;
}

const predefinedOptions = ['Sueldo', 'Extra', 'Regalo', 'Venta', 'Otros'];

export default function IncomeDrawer({
  opened,
  onClose,
  onSuccess,
  incomeToEdit,
}: IncomeDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [customTypeVisible, setCustomTypeVisible] = useState(false);

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
      setCustomTypeVisible(!predefinedOptions.includes(incomeToEdit.type));
    } else {
      form.reset();
      setCustomTypeVisible(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomeToEdit]);

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    try {
      const typeValue = customTypeVisible
        ? form.values.type.trim()
        : form.values.type;

      if (!typeValue) throw new Error('El tipo no puede estar vacío');

      if (incomeToEdit) {
        await updateIncome(incomeToEdit.id, {
          amount: values.amount,
          date: values.date.toISOString(),
          type: typeValue,
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
          type: typeValue,
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

  const handleTypeChange = (value: string | null) => {
    if (!value) return;

    if (value === 'Otros') {
      form.setFieldValue('type', '');
      setCustomTypeVisible(true);
    } else {
      form.setFieldValue('type', value);
      setCustomTypeVisible(false);
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
          <Select
            label="Tipo de ingreso"
            placeholder="Selecciona o escribe"
            data={predefinedOptions}
            value={
              customTypeVisible
                ? 'Otros'
                : predefinedOptions.includes(form.values.type)
                ? form.values.type
                : 'Otros'
            }
            onChange={handleTypeChange}
            required
          />
          {customTypeVisible && (
            <TextInput
              label="Especificar tipo"
              placeholder="Ej: Devolución, Freelance..."
              {...form.getInputProps('type')}
              required
            />
          )}
          <Button type="submit" loading={loading} fullWidth>
            Guardar ingreso
          </Button>
        </Stack>
      </form>
    </Drawer>
  );
}
