// app/page.tsx
'use client';

import { useState } from 'react';
import { Button, Container, Title, Text, Group } from '@mantine/core';
import DrawerLogin from '@/components/DrawerLogin';
import DrawerRegister from '@/components/DrawerRegister';
import styles from "./page.module.css";

export default function Home() {
  const [loginOpened, setLoginOpened] = useState(false);
  const [registerOpened, setRegisterOpened] = useState(false);

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

        <Group justify="center">
          <Button onClick={() => setLoginOpened(true)}>Iniciar sesión</Button>
          <Button variant="outline" onClick={() => setRegisterOpened(true)}>
            Registrarse
          </Button>
        </Group>

        <DrawerLogin opened={loginOpened} onClose={() => setLoginOpened(false)} />
        <DrawerRegister opened={registerOpened} onClose={() => setRegisterOpened(false)} />
      </Container>
      </main>
      <footer className={styles.footer}>
        
      </footer>
    </div>
  );
}
