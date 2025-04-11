'use client';

import {TextInput, PasswordInput, Paper, Title, Container, Button, Stack,} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { showNotification } from '@mantine/notifications';
import { IconX } from '@tabler/icons-react';

export default function LoginPage() {
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
    <Container size={420} my={40}>
      <Title align="center" order={2} mb="md">
        Bienvenido a Zenkoo
      </Title>

      <Paper withBorder shadow="md" p={30} radius="md">
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
          </Stack>

          <Button fullWidth mt="xl" type="submit">
            Iniciar sesión
          </Button>
        </form>
      </Paper>
    </Container>
  );
}