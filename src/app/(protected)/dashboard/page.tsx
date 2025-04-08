'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Container, Title, Text } from '@mantine/core';

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <Container>
      <Title order={2}>Hola, {user.first_name || user.email} 👋</Title>
      <Text mt="md">Bienvenido a tu panel de control Zenkoo.</Text>

    </Container>
  );
}