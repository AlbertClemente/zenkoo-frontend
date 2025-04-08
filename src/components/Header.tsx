'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useNotificationsWebSocket } from '@/hooks/useNotificationsWebSocket';


import {
  Group,
  Text,
  Indicator,
  ActionIcon,
  Menu,
  Divider,
} from '@mantine/core';
import { IconBell, IconLogout, IconSettings } from '@tabler/icons-react';

import UserButton from '@/components/UserButton';

export default function Header() {
  const { logout, user } = useAuth();
  const router = useRouter();

  /* Websockets Notifications */
  const userId = user?.id;
  console.log('User ID para WebSocket:', user?.id);
  const { hasUnread, markAllAsRead } = useNotificationsWebSocket(userId);

  return (
    <Group justify="space-between" align="center" h="100%" px="md">
      {/* Izquierda: logo y navegación */}
      <Group gap="md">
        <Text fw={700}>Zenkoo</Text>
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/incomes">Ingresos</Link>
        <Link href="/expenses">Gastos</Link>
      </Group>

      {/* Derecha: campanita + menú usuario */}
      <Group>
        <Indicator
          disabled={!hasUnread}
          color="red"
          size={10}
          processing
          offset={2}
        >
          <ActionIcon
            variant="subtle"
            size="lg"
            onClick={() => {
              markAllAsRead();
              router.push('/notifications');
            }}
            aria-label="Notificaciones"
          >
            <IconBell size={22} />
          </ActionIcon>
        </Indicator>

        <Menu withArrow>
          <Menu.Target>
            <UserButton
              image={user?.profile_picture || ''}
              name={user?.first_name || 'Usuario'}
              email={user?.email || ''}
            />
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item leftSection={<IconSettings size={16} />}>Configuración</Menu.Item>
            <Divider />
            <Menu.Item leftSection={<IconLogout size={16} />} onClick={logout} color="red">
              Cerrar sesión
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Group>
  );
}