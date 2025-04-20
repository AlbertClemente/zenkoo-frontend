'use client';

import { useAuth } from '@/context/AuthContext';
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

  // 1. Mientras carga, mostramos el loader.
  if (loading) {
    return (
      <Center h="100vh">
        <Loader size="lg" color="zenkooBlue" />
      </Center>
    );
  }

  // 2. Si no está autenticado (por algún motivo), devolvemos null.
  // El middleware ya debería haber redirigido.
  if (!isAuthenticated) {
    return null;
  }

  // 3. Render normal
  return (
    <AppShell
      padding="md"
      header={{ height: 60 }}
    >
      <AppShell.Header>
        <Header />
      </AppShell.Header>
      <AppShell.Main pt="md" pb={{ base: 100, sm: 80 }}>
        <Container>{children}</Container>
      </AppShell.Main>
      <AppShell.Footer>
        <Footer />
      </AppShell.Footer>
    </AppShell>
  );
}
