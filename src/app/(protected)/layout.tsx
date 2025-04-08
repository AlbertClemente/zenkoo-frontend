'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  AppShell,
  Container,
  Center,
  Loader,
  Transition
} from '@mantine/core';
import { useEffect } from 'react';
import Header from '@/components/Header';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading]);

  if (loading || (!isAuthenticated && typeof window !== 'undefined')) {
    return (
      <Transition mounted={loading} transition="fade" duration={300} timingFunction="ease">
        {(styles) => (
          <Center h="100vh" style={styles}>
            <Loader size="lg" color="teal" />
          </Center>
        )}
      </Transition>
    );
  }

  return (
    <AppShell
      padding="md"
      header={{
        height: 60,
        padding: 'md',
      }}
    >
      <AppShell.Header>
        <Header />
      </AppShell.Header>

      <AppShell.Main>
        <Container>{children}</Container>
      </AppShell.Main>
    </AppShell>
  );
}
