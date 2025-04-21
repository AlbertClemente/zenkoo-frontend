'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Container, Title, Text, Group } from '@mantine/core';
import DrawerLogin from '@/components/DrawerLogin';
import DrawerRegister from '@/components/DrawerRegister';
import styles from "./page.module.css";
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import { LogIn, UserPen } from 'lucide-react';

export default function Home() {
  const [loginOpened, setLoginOpened] = useState(false);
  const [registerOpened, setRegisterOpened] = useState(false);
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [loading, isAuthenticated, router]);

  if (loading || isAuthenticated) return null;

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Container size="sm" py="xl" style={{ textAlign: 'center' }}>
          <Title order={1} mb="sm">
            Bienvenido a Zenkoo
          </Title>
          <Text c="dimmed" size="lg" mb="xl">
            Tu app de ahorro personal con método Kakeibo y criptomonedas
          </Text>
          <Image src="/images/home-min.webp" alt='Bienvenido a Zenkoo' width={636} height={608} style={{ height: 'auto', maxWidth: '100%' }} priority />
          <Group justify="center" mt="xl">
            <Button leftSection={<LogIn size={16} />} onClick={() => setLoginOpened(true)}>Iniciar sesión</Button>
            <Button leftSection={<UserPen size={16} />} variant="outline" onClick={() => setRegisterOpened(true)}>
              Registrarse
            </Button>
          </Group>

          <DrawerLogin opened={loginOpened} onClose={() => setLoginOpened(false)} />
          <DrawerRegister opened={registerOpened} onClose={() => setRegisterOpened(false)} />
        </Container>
      </main>
    </div>
  );
}
