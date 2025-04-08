'use client';

import {
  Button,
  Container,
  Paper,
  Stack,
  TextInput,
  Title,
  NumberInput,
} from '@mantine/core';

import { DateInput } from '@mantine/dates';

import { useEffect, useState } from 'react';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

export default function NewIncomePage() {
  const router = useRouter();

  const [defaultDate, setDefaultDate] = useState<Date | null>(null);

  useEffect(() => {
    setDefaultDate(new Date());
  }, []);

  const form = useForm({
    initialValues: {
      description: '',
      amount: 0,
      date: defaultDate,
    },
    validate: {
      description: (value) => (value.trim().length > 0 ? null : 'Descripción requerida'),
      amount: (value) => (value > 0 ? null : 'La cantidad debe ser mayor que 0'),
      date: (value) => (value ? null : 'Selecciona una fecha'),
    },
  });

  if (!defaultDate) {
    return null; // o un <Loader /> mientras inicializa la fecha
  }

  const handleSubmit = async (values: typeof form.values) => {
    try {
      await api.post('/api/incomes/', values);

      showNotification({
        title: 'Ingreso registrado',
        message: 'Tu ingreso se ha guardado correctamente',
        color: 'teal',
        icon: <IconCheck size={16} />,
      });

      router.push('/incomes');
    } catch (error) {
      console.error('Error al crear ingreso:', error);

      showNotification({
        title: 'Error',
        message: 'No se pudo guardar el ingreso',
        color: 'red',
        icon: <IconX size={16} />,
      });
    }
  };

  return (
    <Container size="sm" my="lg">
      <Title order={2} align="center" mb="lg">
        Añadir ingreso
      </Title>

      <Paper withBorder shadow="md" p="lg" radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="Descripción"
              placeholder="Ej: Nómina de abril"
              {...form.getInputProps('description')}
              required
            />

            <NumberInput
              label="Cantidad (€)"
              placeholder="0.00"
              min={0}
              step={5}
              decimalScale={2}
              thousandSeparator="."
              decimalSeparator=","
              hideControls
              {...form.getInputProps('amount')}
            />

            <DateInput
              label="Fecha"
              valueFormat="DD/MM/YYYY"
              {...form.getInputProps('date')}
              required
            />

            <Button type="submit" fullWidth mt="md">
              Guardar ingreso
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
