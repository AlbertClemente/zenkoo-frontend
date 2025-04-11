'use client';

import {
  Drawer,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { showNotification } from '@mantine/notifications';
import { IconX } from '@tabler/icons-react';

interface DrawerLoginProps {
  opened: boolean;
  onClose: () => void;
}

export default function DrawerLogin({ opened, onClose }: DrawerLoginProps) {
  const { login } = useAuth();
  const router = useRouter();

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    const result = await login(values.email, values.password);

    if (result === true) {
      onClose();
      router.push('/dashboard');
    } else {
      showNotification({
        title: 'Error',
        message: result,
        color: 'red',
        icon: <IconX size={16} />,
      });
    }
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title="Iniciar sesión"
      padding="xl"
      size="sm"
      position="right"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <TextInput
            label="Correo electrónico"
            placeholder="tu@email.com"
            {...form.getInputProps('email')}
            required
          />
          <PasswordInput
            label="Contraseña"
            placeholder="••••••••"
            {...form.getInputProps('password')}
            required
          />
          <Button type="submit" mt="md" fullWidth>
            Iniciar sesión
          </Button>
        </Stack>
      </form>
    </Drawer>
  );
}
