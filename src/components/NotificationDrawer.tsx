'use client';

import { Drawer, Group, Text, ScrollArea, Button, Stack, Card, Indicator, ActionIcon, Tooltip, Switch } from '@mantine/core';
import { IconChecklist, IconEraser, IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import api from '@/lib/axios'; 
import Cookies from 'js-cookie';

interface Notification {
  id: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

export default function NotificationDrawer({ opened, onClose, refreshUnreadCount, }: { opened: boolean; onClose: () => void; refreshUnreadCount: () => void; }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const fetchNotifications = async () => {
    try {
      const res = await api.get('/api/notifications/');
      setNotifications(res.data);
    } catch (err) {
      console.error('Error al obtener notificaciones:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unread = notifications.filter(notification => !notification.is_read);
      
      // Actualizamos todas las notificaciones como leídas
      await Promise.all(
        unread.map(notification =>
          api.patch(`/api/notifications/${notification.id}/read/`)
        )
      );

      // Quitamos los badge de "Nueva" en el momento de actualizar a leídas
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, is_read: true }))
      );
  
      refreshUnreadCount(); // Actualiza el contador de notificaciones pendientes
    } catch (err) {
      console.error('Error al marcar las notificaciones como leídas:', err);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.patch(`/api/notifications/${id}/read/`);
      // Actualiza el estado local
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id ? { ...notification, is_read: true } : notification
        )
      );
      refreshUnreadCount(); // Actualiza el contador de notificaciones pendientes
      
    } catch (error) {
      console.error("Error al marcar notificación como leída:", error);
      
    }
  };

  const deleteAll = async () => {
    try {
      await api.delete('/api/notifications/delete/all/');
      setNotifications([]); // Limpia el estado local
      refreshUnreadCount(); // Actualiza el contador de notificaciones pendientes
    } catch (err) {
      console.error("Error al eliminar todas las notificaciones:", err);
    }
  };
  
  const handleDeleteNotification = async (id: string) => {
    try {
      await api.delete(`/api/notifications/${id}/`);
      setNotifications((prev) => prev.filter((notification) => notification.id !== id));
      refreshUnreadCount(); // Actualiza el contador de notificaciones pendientes
    } catch (error) {
      console.error("Error al eliminar la notificación:", error);
    }
  };

  useEffect(() => {
    const token = Cookies.get('accessToken');
    if (!token) return;

    if (opened) fetchNotifications();
  }, [opened]);

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title="Notificaciones"
      padding="lg"
      size="lg"
      position="right"
    >
      <ScrollArea>
        <Stack miw={0} mih={100}>
          {notifications.length === 0 ? (
            <Text c="dimmed">No hay notificaciones.</Text>
          ) : (
            notifications.map((notification) => {
              const cardContent = (
                <Card key={notification.id} shadow="sm" padding="lg" radius="md" withBorder style={{ position: "relative" }}>
                  {!notification.is_read && (
                    <Indicator
                      label="Nueva"
                      size={16}
                      color="teal"
                      processing
                      style={{ position: "absolute", top: 20, left: 42 }}
                    />
                  )}

                  <Group justify="space-between" mt="md" mb="xs" align="flex-start">
                    <div>
                      <Text size="sm">{notification.message}</Text>
                      <Text size="xs" c="dimmed">
                        {new Date(notification.created_at).toLocaleString()}
                      </Text>
                    </div>

                    {/* Marcar como leída o borrar notificación */}
                    <Group spacing="xs">
                      {!notification.is_read && (
                        <Tooltip label="Marcar como leída" refProp="rootRef">
                          <Switch
                            size="xs"
                            color="teal"
                            onChange={() => handleMarkAsRead(notification.id)}
                          />
                        </Tooltip>
                      )}
                      <Tooltip label="Eliminar">
                        <ActionIcon
                          color="red"
                          variant="subtle"
                          onClick={() => handleDeleteNotification(notification.id)}
                        >
                          <IconX size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Group>
                </Card>
              );

              return cardContent;
            })
          )}
        </Stack>
      </ScrollArea>
      <Group justify="right">
        <Button leftSection={<IconChecklist size={14} />} mt="md" onClick={markAllAsRead} disabled={notifications.every(notification => notification.is_read)}>
          Todas leídas
        </Button>
        <Button leftSection={<IconEraser size={14} />} mt="md" variant="light" color="red" onClick={deleteAll} disabled={notifications.length === 0}>
          Borrar todas 
        </Button>
      </Group>
    </Drawer>
  );
}
