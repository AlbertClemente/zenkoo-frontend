import { useEffect, useState } from 'react';
import api from '@/lib/axios';

export function useUnreadNotificationsCount() {
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/api/notifications/unread/count/');
      setUnreadCount(response.data.unread_count);
    } catch (err) {
      console.error('Error al obtener el contador de notificaciones:', err);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  return {
    unreadCount,
    refreshUnreadCount: fetchUnreadCount,
  };
}