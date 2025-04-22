'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Container, Title, } from '@mantine/core';
import SavingGoalsList from '@/components/SavingGoalsList';

export default function SavingGoalsPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <Container size="lg" py="xl">
      <Title order={2} mb="lg">Todas tus metas</Title>
      <SavingGoalsList />
    </Container>
  );
}