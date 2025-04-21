import { useEffect, useRef } from 'react';
import { showNotification } from '@mantine/notifications';
import type { Notification } from '@/types/notification';
import { Bell, Bitcoin } from 'lucide-react';

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
  
    // Evita reconectar por render doble
    if (wsRef.current || hasConnectedOnce.current) {
      console.log('🛑 WebSocket ya iniciado. Ignorando.');
      return;
    }
  
    hasConnectedOnce.current = true;
  
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const hostname = window.location.hostname; // 🔐 dinámico, mejor que hardcoded
    const port = '8000';
    const url = `${protocol}://${hostname}:${port}/ws/notifications/${userId}/`;
  
    console.log('🔌 Conectando a', url);
    const ws = new WebSocket(url);
    wsRef.current = ws;
  
    ws.onopen = () => {
      console.log('✅ WebSocket conectado');
    };
  
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📥 Mensaje WebSocket parseado:', data);
  
        if (data?.message) {
          showNotification({
            title: 'Notificación',
            message: data.message,
            color: data.type?.toLowerCase() === 'cripto' ? 'zenkooViolet' : 'zenkoo',
            icon: data.type?.toLowerCase() === 'cripto'
              ? <Bitcoin size={16} />
              : <Bell size={16} />,
          });
  
          onNewNotification?.();
          onNewNotificationPush?.(data as Notification);
  
          // Evento global
          if (typeof window !== 'undefined') {
            const customEvent = new CustomEvent('newNotificationFromWS', { detail: data });
            window.dispatchEvent(customEvent);
          }
        }
      } catch (err) {
        console.error('❌ Error parseando mensaje WebSocket:', err);
      }
    };
  
    ws.onerror = (error) => {
      console.warn('⚠️ WebSocket error:', error);
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
          hasConnectedOnce.current = false;
        }, 2000);
      }
    };
  
    return () => {
      console.log('🧹 Limpiando WebSocket');
      manuallyClosed.current = true;
      hasConnectedOnce.current = false;
  
      if (
        wsRef.current &&
        wsRef.current.readyState === WebSocket.OPEN
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