'use client';

import { Drawer, Group, Text, ScrollArea, Button, Stack, Badge } from '@mantine/core';
import { useEffect, useState } from 'react';
import api from '@/lib/axios'; 
interface Notification {
  id: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

export default function NotificationDrawer({ opened, onClose }: { opened: boolean; onClose: () => void }) {
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
      const unread = notifications.filter(n => !n.is_read);
      await Promise.all(
        unread.map(n =>
          api.patch(`/api/notifications/${n.id}/read/`)
        )
      );
      fetchNotifications();
    } catch (err) {
      console.error('Error al marcar como leídas:', err);
    }
  };

  useEffect(() => {
    if (opened) fetchNotifications();
  }, [opened]);

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title="Notificaciones"
      padding="md"
      size="md"
      position="right"
    >
      <ScrollArea h={400}>
        <Stack>
          {notifications.length === 0 ? (
            <Text color="dimmed">No hay notificaciones.</Text>
          ) : (
            notifications.map((n) => (
              <Group key={n.id} position="apart">
                <div>
                  <Text size="sm">{n.message}</Text>
                  <Text size="xs" c="dimmed">{new Date(n.created_at).toLocaleString()}</Text>
                </div>
                {!n.is_read && <Badge color="teal">Nuevo</Badge>}
              </Group>
            ))
          )}
        </Stack>
      </ScrollArea>

      <Button fullWidth mt="md" onClick={markAllAsRead} disabled={notifications.every(n => n.is_read)}>
        Marcar todas como leídas
      </Button>
    </Drawer>
  );
}
