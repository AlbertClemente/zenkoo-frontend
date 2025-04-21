'use client';

import Link from 'next/link';
import { useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNotificationsWebSocket } from '@/hooks/useNotificationsWebSocket';
import { useUnreadNotificationsCount } from '@/hooks/useUnreadNotificationsCount';
import { Group, Text, Indicator, ActionIcon, Menu, Divider, Drawer, Stack, Avatar, NavLink, } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import UserButton from '@/components/UserButton';
import NotificationDrawer from './NotificationDrawer';
import ThemeToggle from './ThemeToggle';
import type { Notification } from '@/types/notification';
import { Bell, LogOut, MenuIcon, Settings } from 'lucide-react';
import DrawerUserSettings from '@/components/DrawerUserSettings';
import { useMantineColorScheme } from '@mantine/core';
import Image from 'next/image';
import { useMediaQuery } from '@mantine/hooks';


export default function Header() {
  const { logout, user, isAdmin } = useAuth();
  const userId = user?.id;
  const [drawerOpened, { open, close }] = useDisclosure(false); // Drawer lateral
  const { unreadCount, refreshUnreadCount } = useUnreadNotificationsCount(); //Contador de notificaciones
  const listenersRef = useRef<((notification: Notification) => void)[]>([]);
  const [settingsOpened, { open: openSettings, close: closeSettings }] = useDisclosure(false);
  const { colorScheme } = useMantineColorScheme();
  const isMobile = useMediaQuery('(max-width: 820px)');
  const [mobileMenuOpened, { open: openMobileMenu, close: closeMobileMenu }] = useDisclosure(false);


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

  // Logo tema Dark/Light
  const isDark = colorScheme === 'dark';
  const logoSrc = isDark ? '/logo-dark.png' : '/logo-light.png';

  return (
    <>
      <Group justify="space-between" align="center" h="100%" px="md" maw={1200} mx="auto" gap="lg" wrap="nowrap">
        {isMobile && (
          <Group justify="space-between" align="center" w="100%" px="md">
            <ActionIcon variant="subtle" size="lg" onClick={openMobileMenu} aria-label="Abrir menú">
              <MenuIcon size={22} />
            </ActionIcon>
        
            <Image
              src={logoSrc}
              alt="Zenkoo logo"
              width={100}
              height={Math.round(100 / 4.094)}
            />
        
            <Group gap="xs">
              <Indicator
                label={unreadCount > 0 ? unreadCount : null}
                size={16}
                color="zenkooRed"
                disabled={unreadCount === 0}
                inline
                processing
              >
                <ActionIcon variant="subtle" size="lg" onClick={open} aria-label="Notificaciones">
                  <Bell size={22} />
                </ActionIcon>
              </Indicator>
        
              <ThemeToggle />
            </Group>
          </Group>
        )}

        {/* Izquierda: logo y navegación */}
        {!isMobile && !isAdmin && (
          <Group gap="md">
            <Link href="/">
              <Image
                src={logoSrc}
                alt="Zenkoo logo"
                width={120}
                height={Math.round(120 / 4.094)} // mantiene proporción
                priority
              />
            </Link>
            <Link href="/dashboard" className="nav-link">Dashboard</Link>
            <Link href="/incomes" className="nav-link">Ingresos</Link>
            <Link href="/expenses" className="nav-link">Gastos</Link>
            <Link href="/saving-goals" className="nav-link">Metas</Link>
          </Group>
        )}
        {!isMobile && isAdmin && (
          <Group gap="md">
            <Link href="/">
              <Image
                src={logoSrc}
                alt="Zenkoo logo"
                width={120}
                height={Math.round(120 / 4.094)} // mantiene proporción
                priority
              />
            </Link>
            <Link href="/admin-panel" className="nav-link">
              Panel Admin
            </Link>
          </Group>
        )}
        
        {/* Derecha: switch + campanita + menú usuario */}
        {!isMobile && (
          <Group gap="xs" align="center">
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
                <Bell size={22} />
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
              <Menu.Dropdown p="sm">
              <Menu.Item leftSection={<Settings size={16} />} onClick={openSettings}>
                Configuración
              </Menu.Item>
                <Divider mt="sm" mb="sm" />
                <Menu.Item leftSection={<LogOut size={16} />} onClick={logout} color="zenkooRed">
                  Cerrar sesión
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>

            {/* Switch tema */}
            <ThemeToggle />
          </Group>
        )}
      </Group>
      
      {/* Drawer Solo Mobile */}
      {isMobile && (
        <Drawer 
          opened={mobileMenuOpened} 
          onClose={closeMobileMenu} 
          title="" 
          size="xs" 
          position="left"
          transitionProps={{ transition: 'slide-right', duration: 250 }}
        >
          <Stack h="100%" justify="space-between">
      
            {/* Parte superior: avatar y links */}
            <Stack>
              <Group justify="space-between" align="center" wrap="nowrap">
                <Avatar src={user?.profile_picture || ''} radius="xl" />

                <div style={{ flex: 1, marginLeft: 8 }}>
                  <Text size="sm" fw={500} lineClamp={1}>
                    {user?.first_name || 'Usuario'}
                  </Text>
                  <Text c="dimmed" size="xs" lineClamp={1}>
                    {user?.email || ''}
                  </Text>
                </div>

                <ActionIcon
                  onClick={() => {
                    closeMobileMenu();
                    openSettings();
                  }}
                  variant="subtle"
                  size="lg"
                  aria-label="Configuración"
                >
                  <Settings size={20} />
                </ActionIcon>

                <ActionIcon
                  onClick={() => {
                    closeMobileMenu();
                    logout();
                  }}
                  variant="light"
                  size="lg"
                  color="zenkooRed"
                  aria-label="Cerrar sesión"
                >
                  <LogOut size={20} />
                </ActionIcon>
              </Group>

              <Divider my="xs" />

              {!isAdmin && (
                <>
                  <Link href="/dashboard" onClick={closeMobileMenu}>Dashboard</Link>
                  <Link href="/incomes" onClick={closeMobileMenu}>Ingresos</Link>
                  <Link href="/expenses" onClick={closeMobileMenu}>Gastos</Link>
                  <Link href="/saving-goals" onClick={closeMobileMenu}>Metas</Link>
                </>
              )}

              {isAdmin && (
                <>
                  <Link href="/admin-panel" className="nav-link">
                    Panel Admin
                  </Link>
                </>
              )}
            </Stack>
            
          </Stack>
        </Drawer>
      )}
      

      <NotificationDrawer 
        opened={drawerOpened} 
        onClose={close} 
        refreshUnreadCount={refreshUnreadCount} 
        onNewNotificationPush={registerPushCallback}
      />
      <DrawerUserSettings opened={settingsOpened} onClose={closeSettings} />
    </>
  );
}