'use client';

import {
  Drawer,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Title,
  Group,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useState } from 'react';
import api from '@/lib/axios';

interface DrawerRegisterProps {
  opened: boolean;
  onClose: () => void;
}

export default function DrawerRegister({ opened, onClose }: DrawerRegisterProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      first_name: '',
      last_name: '',
      email: '',
      date_of_birth: null,
      password: '',
      confirm_password: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Email no válido'),
      confirm_password: (value, values) =>
        value !== values.password ? 'Las contraseñas no coinciden' : null,
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    try {
      await api.post('/api/users/register/', {
        ...values,
        date_of_birth: values.date_of_birth?.toISOString(),
      });
      showNotification({
        title: 'Registro exitoso',
        message: 'Ya puedes iniciar sesión',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
      onClose();
    } catch (error: any) {
      showNotification({
        title: 'Error',
        message: error.response?.data?.detail || 'Error al registrar',
        color: 'red',
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
      title="Registrarse"
      padding="xl"
      size="sm"
      position="right"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <TextInput
            label="Nombre"
            placeholder="Tu nombre"
            {...form.getInputProps('first_name')}
            required
          />
          <TextInput
            label="Apellidos"
            placeholder="Tus apellidos"
            {...form.getInputProps('last_name')}
            required
          />
          <TextInput
            label="Correo electrónico"
            placeholder="tu@email.com"
            {...form.getInputProps('email')}
            required
          />
          <DateInput
            label="Fecha de nacimiento"
            placeholder="Selecciona tu fecha"
            {...form.getInputProps('date_of_birth')}
            required
          />
          <PasswordInput
            label="Contraseña"
            placeholder="••••••••"
            {...form.getInputProps('password')}
            required
          />
          <PasswordInput
            label="Confirmar contraseña"
            placeholder="••••••••"
            {...form.getInputProps('confirm_password')}
            required
          />
          <Group position="right" mt="md">
            <Button type="submit" loading={loading}>
              Registrarse
            </Button>
          </Group>
        </Stack>
      </form>
    </Drawer>
  );
}
