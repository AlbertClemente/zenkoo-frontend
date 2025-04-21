'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { showNotification } from '@mantine/notifications';
import { IconAlertCircle } from '@tabler/icons-react';

import AdminIA from '@/components/AdminIA';

export default function AdminPanelPage() {
  const { isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAdmin) {
      showNotification({
        color: 'zenkooYellow',
        title: 'Acceso restringido',
        message: 'No tienes permisos para acceder al panel de administración.',
        icon: <IconAlertCircle size={16} />,
      });
      router.push('/403');
    }
  }, [loading, isAdmin, router]);

  if (loading || !isAdmin) return null;

  return <AdminIA />;
}