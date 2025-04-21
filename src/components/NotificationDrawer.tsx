'use client';

import { Drawer, Group, Text, ScrollArea, Button, Stack, Card, Indicator, ActionIcon, Tooltip, Switch, Pagination, Transition } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import api from '@/lib/axios'; 
import Cookies from 'js-cookie';
import type { Notification } from '@/types/notification';
import { CheckCheck, Eraser } from 'lucide-react';

export default function NotificationDrawer({ opened, onClose, refreshUnreadCount, onNewNotificationPush}: { opened: boolean; onClose: () => void; refreshUnreadCount: () => void; onNewNotificationPush?: (callback: (notification: Notification) => void) => void; }) {
  const [notificationData, setNotificationData] = useState<{
    count: number;
    results: Notification[];
  }>({ count: 0, results: [] });

  useEffect(() => {
    if (!onNewNotificationPush) return;
  
    console.log('🧠 Registrando callback de notificación desde NotificationDrawer');
  
    const handleNewNotification = (newNotification: Notification) => {
      console.log('📩 Notificación recibida desde WebSocket:', newNotification);
  
      if (!newNotification?.id) {
        console.warn('❌ Notificación sin ID. Se ignora:', newNotification);
        return;
      }

      setNotificationData((prev) => {
        const alreadyExists = prev.results.some((n) => n.id === newNotification.id);
        if (alreadyExists) {
          console.log('🔁 Notificación ya existe. Se ignora:', newNotification.id);
          return prev;
        }
  
        const updated = {
          ...prev,
          count: prev.count + 1,
          results: [newNotification, ...prev.results],
        };
  
        console.log('✅ Estado actualizado con nueva notificación:', updated);
        return updated;
      });
    };
  
    const unregister = onNewNotificationPush(handleNewNotification);
  
    return () => {
      console.log('🧹 Limpiando callback de notificación del NotificationDrawer');
      if (typeof unregister === 'function') {
        unregister();
      }
    };
  }, []);

  //Paginación
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; // Coincide con el número de páginas definido en pagination.py

  //Control eliminación notificaciones
  const [deletingIds, setDeletingIds] = useState<string[]>([]);
  
  const fetchNotifications = async (page = 1) => {
    try {
      const res = await api.get(`/api/notifications/?page=${page}`);
      setNotificationData(res.data);
      setTotalPages(Math.ceil(res.data.count / pageSize));
      setCurrentPage(page);
    } catch (err) {
      console.error('Error al obtener notificaciones:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unread = notificationData?.results.filter((notification) => !notification.is_read) || [];
  
      await Promise.all(
        unread.map((notification) =>
          api.patch(`/api/notifications/${notification.id}/read/`)
        )
      );
  
      // Actualiza el estado local (todos a leídos)
      setNotificationData((prev) =>
        prev
          ? {
              ...prev,
              results: prev.results.map((notification) => ({ ...notification, is_read: true })),
            }
          : prev
      );
  
      refreshUnreadCount();
    } catch (err) {
      console.error('Error al marcar las notificaciones como leídas:', err);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.patch(`/api/notifications/${id}/read/`);
  
      setNotificationData((prev) =>
        prev
          ? {
              ...prev,
              results: prev.results.map((notification) =>
                notification.id === id ? { ...notification, is_read: true } : notification
              ),
            }
          : prev
      );
  
      refreshUnreadCount();
    } catch (error) {
      console.error("Error al marcar notificación como leída:", error);
    }
  };

  const updatePageAfterDeletion = (newTotalCount: number) => {
    const totalPages = Math.ceil(newTotalCount / pageSize);
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
      fetchNotifications(totalPages || 1); // redirige a la última existente
    } else {
      fetchNotifications(currentPage);
    }
  };

  const deleteAll = async () => {
    try {
      await api.delete('/api/notifications/delete/all/');
      setNotificationData({ count: 0, results: [] });
      setCurrentPage(1); // Vuelve a la primera por si acaso
      fetchNotifications(1);
      refreshUnreadCount();
    } catch (err) {
      console.error("Error al eliminar todas las notificaciones:", err);
    }
  };
  
  const handleDeleteNotification = async (id: string) => {
    try {
      // Añade el ID a los que están desvaneciéndose
      setDeletingIds((prev) => [...prev, id]);
  
      // Espera a que se vea el fade-out (200ms)
      setTimeout(async () => {
        await api.delete(`/api/notifications/${id}/`);
        const updatedResults = notificationData.results.filter((notification) => notification.id !== id);
        const newTotal = notificationData.count - 1;
  
        setNotificationData({
          count: newTotal,
          results: updatedResults,
        });
  
        setDeletingIds((prev) => prev.filter((d) => d !== id)); // Limpia el ID de transición
        refreshUnreadCount();
        updatePageAfterDeletion(newTotal);
      }, 200); // Debe coincidir con el `duration` de `Transition`
    } catch (error) {
      console.error("Error al eliminar la notificación:", error);
      setDeletingIds((prev) => prev.filter((d) => d !== id)); // En caso de error, limpiarlo
    }
  };

  useEffect(() => {
    // Nos aseguramos que se listan las notificaciones siempre que estemos autenticados
    const token = Cookies.get('accessToken');
    if (!token) return;

    if (opened) fetchNotifications(1);
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
      {/* Listado de notificaciones */}
      <ScrollArea>
        <Stack miw={0}>
          {notificationData?.results.length === 0 ? (
            <Text c="dimmed">No hay notificaciones.</Text>
          ) : (
            notificationData.results.map((notification) => {
              console.log('🔔 Notificación renderizada:', notification);
              return (
                <Transition
                  mounted={!deletingIds.includes(notification.id)}
                  transition="fade"
                  duration={200}
                  timingFunction="ease"
                  key={notification.id}
                >
                  {(styles) => (
                    <div key={notification.id} style={styles}>
                      <Card shadow="sm" padding="lg" radius="md" withBorder style={{ position: "relative" }}>
                        {!notification.is_read && (
                          <Indicator
                            label="Nueva"
                            size={16}
                            color="zenkooBlue"
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
            
                          <Group gap="xs">
                            {!notification.is_read && (
                              <Tooltip label="Marcar como leída" refProp="rootRef">
                                <Switch
                                  size="xs"
                                  color="zenkooBlue"
                                  onChange={() => handleMarkAsRead(notification.id)}
                                />
                              </Tooltip>
                            )}
                            <Tooltip label="Eliminar">
                              <ActionIcon
                                color="zenkooRed"
                                variant="subtle"
                                onClick={() => handleDeleteNotification(notification.id)}
                              >
                                <IconX size={16} />
                              </ActionIcon>
                            </Tooltip>
                          </Group>
                        </Group>
                      </Card>
                    </div>
                  )}
                </Transition>
              );
            })
          )}
        </Stack>
      </ScrollArea>
      
      {/* Paginación */}
      {totalPages > 1 && (
        <Pagination
          value={currentPage}
          onChange={(page) => fetchNotifications(page)}
          total={totalPages}
          mt="md"
          size="sm"
          radius="xl"
          withControls
        />
      )}

      {/* Acciones */}
      <Group justify="right">
        <Button leftSection={<CheckCheck size={16} />} mt="md" onClick={markAllAsRead} disabled={!notificationData || notificationData.results.every(notification => notification.is_read)}>
          Todas leídas
        </Button>
        <Button leftSection={<Eraser size={16} />} mt="md" variant="light" color="zenkooRed" onClick={deleteAll} disabled={!notificationData || notificationData.results.length === 0}>
          Borrar todas 
        </Button>
      </Group>
    </Drawer>
  );
}
