'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  AppShell,
  Container,
  Center,
  Loader,
} from '@mantine/core';

import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ProtectedShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const hasRedirected = useRef(false);

  // Redirige si no estás autenticado
  useEffect(() => {
    if (!loading && !isAuthenticated && !hasRedirected.current) {
      hasRedirected.current = true;
      router.push('/');
    }
  }, [loading, isAuthenticated, router]);

  // Mientras carga el contexto o se redirige, muestra un loader
  if (loading || !isAuthenticated) {
    return (
      <Center h="100vh">
        <Loader size="lg" color="zenkoo" />
      </Center>
    );
  }

  // Render normal si todo va bien
  return (
    <AppShell
      padding="md"
      header={{ height: 60 }}
    >
      <AppShell.Header>
        <Header />
      </AppShell.Header>
      <AppShell.Main mt="xl" pt="xl" pb={{ base: 120, sm: 100 }}>
        <Container>{children}</Container>
      </AppShell.Main>
      <AppShell.Footer>
        <Footer />
      </AppShell.Footer>
    </AppShell>
  );
}
