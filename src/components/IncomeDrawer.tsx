'use client';

import {
  Drawer,
  TextInput,
  Button,
  Stack,
  NumberInput,
  Select,
  Group,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { createIncome, updateIncome } from '@/lib/incomes';
import type { Income } from '@/lib/incomes';
import { Save } from 'lucide-react';

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
      type: 'Sueldo', // Establecer "Sueldo" como valor por defecto
    },
  });

  useEffect(() => {
    if (incomeToEdit) {
      form.setValues({
        amount: parseFloat(incomeToEdit.amount.toString()),
        date: new Date(incomeToEdit.date),
        type: incomeToEdit.type || 'Sueldo',  // Asegurarnos de que se establezca un valor válido
      });
      setCustomTypeVisible(!predefinedOptions.includes(incomeToEdit.type));
    } else {
      form.reset();
      setCustomTypeVisible(false);
    }
  }, [incomeToEdit]);
  
  const handleTypeChange = (value: string | null) => {
    if (!value) return;
  
    // Si el usuario selecciona "Otros", mostramos el campo personalizado
    if (value === 'Otros') {
      form.setFieldValue('type', ''); // Limpiamos el campo de tipo
      setCustomTypeVisible(true); // Hacemos visible el campo de tipo personalizado
    } else {
      form.setFieldValue('type', value); // Asignamos el valor del tipo seleccionado
      setCustomTypeVisible(false); // Ocultamos el campo de tipo personalizado
    }
  };
  
  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    try {
      // Asegurarse de que el valor de 'type' esté correctamente asignado
      const typeValue = customTypeVisible
        ? form.values.type.trim()  // Si 'Otros' está visible, usa el valor personalizado
        : form.values.type;  // Si no, usamos el valor predefinido
  
      console.log("Tipo seleccionado:", typeValue); // Verificar el valor de tipo
  
      // Validación de tipo
      if (!typeValue || typeValue.trim() === '') {
        throw new Error('El tipo no puede estar vacío');
      }
  
      // Creación o actualización del ingreso
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
  
      // Resetear el formulario y cerrar el drawer
      form.reset();
      onClose();
      onSuccess();
    } catch (error) {
      showNotification({
        title: 'Error',
        message: error.message || 'No se pudo guardar el ingreso',
        color: 'zenkooRed',
        icon: <IconX size={16} />,
      });
      console.log(error);
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
          <Select
            label="Tipo de ingreso"
            placeholder="Selecciona o escribe"
            data={predefinedOptions}
            value={customTypeVisible
              ? 'Otros'
              : predefinedOptions.includes(form.values.type)
              ? form.values.type
              : 'Sueldo'}
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
          <Group justify="flex-end" mt="md">
            <Button leftSection={<Save size={16} />} type="submit" loading={loading} >
              Guardar ingreso
            </Button>
          </Group>
        </Stack>
      </form>
    </Drawer>
  );
}
