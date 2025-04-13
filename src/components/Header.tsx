'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRef, useCallback } from 'react';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useNotificationsWebSocket } from '@/hooks/useNotificationsWebSocket';
import { useUnreadNotificationsCount } from '@/hooks/useUnreadNotificationsCount';

import { Group, Text, Indicator, ActionIcon, Menu, Divider, Tooltip, useMantineColorScheme, Switch } from '@mantine/core';

import { useDisclosure } from '@mantine/hooks';

import { IconBell, IconLogout, IconSettings } from '@tabler/icons-react';

import UserButton from '@/components/UserButton';

import NotificationDrawer from './NotificationDrawer';
import ThemeToggle from './ThemeToggle';

import type { Notification } from '@/types/notification';


export default function Header() {
  const { logout, user, isAdmin } = useAuth();
  const userId = user?.id;
  const [drawerOpened, { open, close }] = useDisclosure(false); // Drawer lateral
  const { unreadCount, refreshUnreadCount } = useUnreadNotificationsCount(); //Contador de notificaciones
  const listenersRef = useRef<((notification: Notification) => void)[]>([]);


  const handleNewNotificationPush = useCallback((notification: Notification) => {
    console.log('🧠 handleNewNotificationPush ejecutado con:', notification);
    const event = new CustomEvent('newNotificationFromWS', { detail: notification }); 
    window.dispatchEvent(event);
    listenersRef.current.forEach((callback) => callback(notification));
  }, []);

  const registerPushCallback = useCallback((cb: (notification: Notification) => void) => {
    listenersRef.current.push(cb);
    return () => {
      listenersRef.current = listenersRef.current.filter((fn) => fn !== cb);
    };
  }, []);

  useNotificationsWebSocket(userId, refreshUnreadCount, handleNewNotificationPush); // Escuchar y refrescar el contador


 
  return (
    <>
      <Group justify="space-between" align="center" h="100%" px="md">
        {/* Izquierda: logo y navegación */}
        {!isAdmin && (
          <Group gap="md">
            <Text fw={700}>Zenkoo</Text>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/incomes">Ingresos</Link>
            <Link href="/expenses">Gastos</Link>
          </Group>
        )}
        {isAdmin && (
          <Group gap="md">
            <Text fw={700}>Zenkoo</Text>
            <Link href="/admin-panel">
              Panel Admin
            </Link>
          </Group>
        )}

        {/* Derecha: switch + campanita + menú usuario */}
        <Group>
          {/* Campanita notificaciones */}
          <Indicator
            label={unreadCount > 0 ? unreadCount : null}
            size={16}
            color="zenkooRed"
            disabled={unreadCount === 0}
            inline 
            processing
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
          
          {/* Menú desplegable usuario */}
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
              <Menu.Item leftSection={<IconLogout size={16} />} onClick={logout} color="zenkooRed">
                Cerrar sesión
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>

          {/* Switch tema */}
          <ThemeToggle />
        </Group>
      </Group>

      <NotificationDrawer 
        opened={drawerOpened} 
        onClose={close} 
        refreshUnreadCount={refreshUnreadCount} 
        onNewNotificationPush={registerPushCallback}
      />
    </>
  );
}