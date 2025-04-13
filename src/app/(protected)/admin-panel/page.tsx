'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Container, Text, Title } from '@mantine/core'
import { showNotification } from '@mantine/notifications';
import { IconAlertCircle } from '@tabler/icons-react'

import AdminIA from '@/components/AdminIA'

export default function AdminPanelPage() {
  const { isAdmin, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAdmin) {
      const timeout = setTimeout(() => {
        showNotification({
          color: 'zenkooYellow',
          title: 'Acceso restringido',
          message: 'No tienes permisos para acceder al panel de administración.',
          icon: <IconAlertCircle size={16} />,
        })
        router.push('/dashboard');
      }, 3000) // espera 3 segundo
  
      return () => clearTimeout(timeout) // limpia el timeout si se desmonta
    }
  }, [loading, isAdmin, router]);

  if (loading) return null;

  if (!isAdmin) {
    return (
      <Container py="xl">
        <Title order={2}>403 – Prohibido</Title>
        <Text>No tienes permiso para acceder a esta página.</Text>
      </Container>
    )
  }

  return (
    <Container py="xl">
      <AdminIA />
    </Container>
  )
}
