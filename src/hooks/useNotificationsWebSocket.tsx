import { useEffect, useRef } from 'react';
import { showNotification } from '@mantine/notifications';
import { IconBell, IconCurrencyBitcoin } from '@tabler/icons-react';
import type { Notification } from '@/types/notification';

export function useNotificationsWebSocket(
  userId: string | undefined,
  onNewNotification?: () => void,
  onNewNotificationPush?: (notification: Notification) => void
) {


  const wsRef = useRef<WebSocket | null>(null);
  const manuallyClosed = useRef(false);
  const retryTimeout = useRef<NodeJS.Timeout | null>(null);
  const hasConnectedOnce = useRef(false); // 🆕 evita reconectar por doble render

  useEffect(() => {
    if (!userId) {
      console.log('⛔ WebSocket no iniciado: userId undefined');
      return;
    }
    
    if (wsRef.current || hasConnectedOnce.current) return;

    hasConnectedOnce.current = true; // evita que vuelva a entrar

    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const host = process.env.NEXT_PUBLIC_WS_HOST ?? 'localhost:8000';
    const url = `${protocol}://${host}/ws/notifications/${userId}/`;

    console.log('🔌 Conectando a', url);
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('✅ WebSocket conectado');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('📥 Mensaje WebSocket parseado:', data);

      if (data?.message) {
        showNotification({
          title: 'Notificación',
          message: data.message,
          color: data.type?.toLowerCase() === 'cripto' ? 'zenkooViolet' : 'zenkoo',
          icon: data.type?.toLowerCase() === 'cripto'
            ? <IconCurrencyBitcoin size={16} />
            : <IconBell size={16} />,
        });

        onNewNotification?.();
        onNewNotificationPush?.(data as Notification);

        // Evento global
        if (typeof window !== 'undefined') {
          const customEvent = new CustomEvent('newNotificationFromWS', { detail: data });
          window.dispatchEvent(customEvent);
        }
      }
    };

    ws.onclose = (event) => {
      console.warn('❌ WebSocket desconectado', event);

      const shouldRetry =
        !manuallyClosed.current &&
        event.code !== 1000 &&
        ws.readyState !== WebSocket.CONNECTING;

      if (shouldRetry) {
        retryTimeout.current = setTimeout(() => {
          console.log('🔄 Reintentando conexión WebSocket...');
          wsRef.current = null;
          hasConnectedOnce.current = false; // permite reconectar
        }, 2000);
      }
    };

    ws.onerror = (error) => {
      console.warn('⚠️ WebSocket error:', error);
    };

    return () => {
      manuallyClosed.current = true;
      hasConnectedOnce.current = false;

      if (
        wsRef.current &&
        (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)
      ) {
        wsRef.current.close();
        wsRef.current = null;
      }

      if (retryTimeout.current) {
        clearTimeout(retryTimeout.current);
      }
    };
  }, [userId, onNewNotification, onNewNotificationPush]);
}