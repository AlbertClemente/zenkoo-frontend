'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  AppShell,
  Box,
  Group,
  Text,
  Container,
  Menu,
  Button,
  Divider,
  Center,
  Loader,
  Transition
} from '@mantine/core';
import Link from 'next/link';
import { useEffect } from 'react';
import UserButton from '@/components/UserButton';
import { IconLogout, IconSettings } from '@tabler/icons-react';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, logout, loading } = useAuth();
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
        <Group justify="space-between" align="center" h="100%" px="md">
          <Group gap="md">
            <Text fw={700}>Zenkoo</Text>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/incomes">Ingresos</Link>
            <Link href="/expenses">Gastos</Link>
          </Group>

          <Menu withArrow>
            <Menu.Target>
              <UserButton
                image={user?.profile_picture || ''}
                name={user?.first_name || 'Usuario'}
                email={user?.email || ''}
              />
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item icon={<IconSettings size={16} />}>Configuración</Menu.Item>
              <Divider />
              <Menu.Item icon={<IconLogout size={16} />} onClick={logout} color="red">
                Cerrar sesión
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </AppShell.Header>

      <AppShell.Main>
        <Container>{children}</Container>
      </AppShell.Main>
    </AppShell>
  );
}
