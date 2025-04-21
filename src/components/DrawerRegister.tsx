'use client';

import { Drawer, TextInput, PasswordInput, Button, Stack, Text, Group, Progress } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useState } from 'react';
import api from '@/lib/axios';
import { Save } from 'lucide-react';

interface DrawerRegisterProps {
  opened: boolean;
  onClose: () => void;
}

export default function DrawerRegister({ opened, onClose }: DrawerRegisterProps) {
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordLabel, setPasswordLabel] = useState('');

  function getPasswordStrength(password: string) {
    let score = 0;

    if (password.length > 5) score += 1;
    if (password.length > 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    const labels = ['Muy débil', 'Débil', 'Aceptable', 'Fuerte', 'Muy fuerte', 'Excelente'];

    return {
      score,
      label: labels[score],
    };
  }

  const form = useForm<{
    first_name: string;
    last_name: string;
    email: string;
    date_of_birth: Date | null;
    password: string;
    confirm_password: string;
  }>({
    initialValues: {
      first_name: '',
      last_name: '',
      email: '',
      date_of_birth: null,
      password: '',
      confirm_password: '',
    },
    validateInputOnChange: true,
    validate: {
      first_name: (value) =>
        value.trim().length < 2 ? 'Nombre muy corto' : null,
      last_name: (value) =>
        value.trim().length < 2 ? 'Apellidos muy cortos' : null,
      email: (value) =>
        /^\S+@\S+\.\S+$/.test(value) ? null : 'Email no válido',
      date_of_birth: (value) => {
        if (!value) return 'La fecha es obligatoria';
        const now = new Date();
        const dob = new Date(value);
        const age = now.getFullYear() - dob.getFullYear();
        const m = now.getMonth() - dob.getMonth();
        const d = now.getDate() - dob.getDate();
        const is18 = age > 18 || (age === 18 && (m > 0 || (m === 0 && d >= 0)));
        if (dob > now) return 'No puedes venir del futuro 🤖';
        if (!is18) return 'Debes tener al menos 18 años';
        return null;
      },
      password: (value) => {
        if (value.length < 8) return 'Debe tener al menos 8 caracteres';
        if (!/[A-Z]/.test(value)) return 'Debe incluir al menos una mayúscula';
        if (!/[0-9]/.test(value)) return 'Debe incluir al menos un número';
        if (!/[^A-Za-z0-9]/.test(value)) return 'Debe incluir un símbolo';
        return null;
      },
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
        color: 'zenkoo',
        icon: <IconCheck size={16} />,
      });
      onClose();
    } catch (error: any) {
      if (error.response?.data?.email) {
        form.setFieldError('email', 'Ya existe una cuenta con ese correo');
      }
      showNotification({
        title: 'Error',
        message: error.response?.data?.detail || 'Error al registrar',
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
            onChange={(event) => {
              form.setFieldValue('password', event.currentTarget.value);
              const { score, label } = getPasswordStrength(event.currentTarget.value);
              setPasswordStrength(score);
              setPasswordLabel(label);
            }}
            required
          />
          <Progress
            value={(passwordStrength / 5) * 100}
            color={
              passwordStrength < 2
                ? 'zenkooRed'
                : passwordStrength < 4
                ? 'zenkooYellow'
                : 'zenkoo'
            }
          />
          <Text size="xs" c="dimmed" mt={4}>
            Fortaleza: {passwordLabel}
          </Text>
          <PasswordInput
            label="Confirmar contraseña"
            placeholder="••••••••"
            {...form.getInputProps('confirm_password')}
            required
          />
          <Group justify="flex-end" mt="md">
            <Button leftSection={<Save size={16} />} type="submit" loading={loading}>
              Registrarse
            </Button>
          </Group>
        </Stack>
      </form>
    </Drawer>
  );
}
