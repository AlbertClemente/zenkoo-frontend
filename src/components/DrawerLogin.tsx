'use client';

import {
  Drawer,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Group,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { LoginUser } from '@/types/user';

import { showNotification } from '@mantine/notifications';
import { IconX, IconCheck } from '@tabler/icons-react';
import { LogIn } from 'lucide-react';
import { useState } from 'react';

interface DrawerLoginProps {
  opened: boolean;
  onClose: () => void;
}

export default function DrawerLogin({ opened, onClose }: DrawerLoginProps) {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
  });

  // Validación segura del objeto recibido
  function isLoginUser(obj: any): obj is LoginUser {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      typeof obj.first_name === 'string' &&
      typeof obj.email === 'string' &&
      typeof obj.is_staff === 'boolean' &&
      typeof obj.is_superuser === 'boolean'
    );
  }

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    
    try {
      const result = await login(values.email, values.password);

      if (isLoginUser(result)) {
        const user = result;

        const name =
          user.first_name?.trim() || user.email?.trim() || 'usuario';

        showNotification({
          title: 'Bienvenido',
          message: `Hola, ${name}!`,
          color: 'zenkoo',
          icon: <IconCheck size={16} />,
        });

        onClose();

        if (user.is_superuser) {
          router.push('/admin-panel');
        } else if (user.is_staff) {
          router.push('/staff-panel');
        } else {
          router.push('/dashboard');
        }

      } else {
        showNotification({
          title: 'Error',
          message: typeof result === 'string'
            ? result
            : 'Ha ocurrido un error inesperado al iniciar sesión.',
          color: 'zenkooRed',
          icon: <IconX size={16} />,
          autoClose: 5000,
        });
      }
    } catch (err) {
      console.error('Error inesperado en login:', err);
      showNotification({
        title: 'Error',
        message: 'Algo ha ido mal al iniciar sesión.',
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
      title="Iniciar sesión"
      padding="xl"
      size="sm"
      position="right"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault(); // Previene la recarga de la página
          form.onSubmit(handleSubmit)(); // Llama a la función handleSubmit
        }}
      >
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
          <Group justify="flex-end" mt="md">
            <Button leftSection={<LogIn size={16} />} type="submit" loading={loading}>
              Iniciar sesión
            </Button>
          </Group>
        </Stack>
      </form>
    </Drawer>
  );
}
