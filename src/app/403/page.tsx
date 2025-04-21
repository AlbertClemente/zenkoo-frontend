'use client';

import { Button, Center, Stack, Text, Title } from '@mantine/core';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { MoveLeft } from 'lucide-react';


export default function NotFound() {
  const router = useRouter();

  return (
    <Center h="100vh">
      <Stack align="center">
        <Title order={2}>¡Ups! 403 - Acceso denegado</Title>
        <Text c="dimmed" maw={300} ta="center">
          No tienes permiso para acceder a esta página. Si crees que es un error, contacta con el administrador.
        </Text>
        <Image src="/images/errors-min.webp" alt='Error 403' width={717} height={772} style={{ height: 'auto', maxWidth: '100%' }} priority />
        <Button leftSection={<MoveLeft size={16} />} color='zenkoo' variant="light" onClick={() => router.push('/')}>
          Volver al inicio
        </Button>
      </Stack>
    </Center>
  );
}