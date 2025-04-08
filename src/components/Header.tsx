'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useNotificationsWebSocket } from '@/hooks/useNotificationsWebSocket';
import { useUnreadNotificationsCount } from '@/hooks/useUnreadNotificationsCount';

import {
  Group,
  Text,
  Indicator,
  ActionIcon,
  Menu,
  Divider,
} from '@mantine/core';

import { useDisclosure } from '@mantine/hooks';

import { IconBell, IconLogout, IconSettings } from '@tabler/icons-react';

import UserButton from '@/components/UserButton';
import NotificationDrawer from '@/components/NotificationDrawer';

export default function Header() {
  const { logout, user } = useAuth();
  const userId = user?.id;
  const { unreadCount, refreshUnreadCount } = useUnreadNotificationsCount();
  const [drawerOpened, { open, close }] = useDisclosure(false);
  
  useNotificationsWebSocket(userId, refreshUnreadCount); // Escuchar y refrescar el contador

  return (
    <>
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
            label={unreadCount > 0 ? unreadCount : null}
            size={16}
            color="red"
            disabled={unreadCount === 0}
          >
            <ActionIcon
              variant="subtle"
              size="lg"
              onClick={open}
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

      <NotificationDrawer opened={drawerOpened} onClose={close} />
    </>
  );
}