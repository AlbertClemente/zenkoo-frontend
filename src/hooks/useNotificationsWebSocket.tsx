import { useEffect, useRef } from 'react';
import { showNotification } from '@mantine/notifications';
import { IconBell } from '@tabler/icons-react';

export function useNotificationsWebSocket(userId: string | undefined, onNewNotification?: () => void) {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!userId) return;

    const ws = new WebSocket(`ws://localhost:8000/ws/notifications/${userId}/`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('🔌 WebSocket conectado');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data?.message) {
        showNotification({
          title: 'Notificación',
          message: data.message,
          color: 'teal',
          icon: <IconBell size={16} />,
        });

        if (onNewNotification) onNewNotification(); // Por ejemplo: refreshUnreadCount()
      }
    };

    ws.onclose = () => {
      console.log('❌ WebSocket desconectado');
    };

    ws.onerror = (error) => {
      console.error('⚠️ WebSocket error:', error);
    };

    return () => {
      ws.close();
    };
  }, [userId, onNewNotification]);
}