import { useEffect, useRef, useState } from 'react';

export function useNotificationsWebSocket(userId: string | undefined) {
  const [hasUnread, setHasUnread] = useState(false);
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
      console.log('📥 Datos Webtoken: ', data)
      if (data?.type === 'new_notification') {
        setHasUnread(true);
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
  }, [userId]);

  const markAllAsRead = () => setHasUnread(false);

  return { hasUnread, markAllAsRead };
}