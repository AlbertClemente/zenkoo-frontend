'use client';

import { useEffect, useState } from 'react';
import { Grid, Paper, Text, Title, Center, Loader, Card } from '@mantine/core';
import api from '@/lib/axios'

import {
  IconUsers,
  IconPigMoney,
  IconTrendingUp,
  IconTrendingDown,
  IconCoin,
  IconX
} from '@tabler/icons-react';
import { showNotification } from '@mantine/notifications';

type Stats = {
  total_users: number;
  total_incomes: number;
  total_expenses: number;
  total_goals: number;
  total_saved: number;
  dataset_samples?: number;
  model_accuracy?: number;
  model_last_trained?: string;
};

export default function AdminStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const fetchStats = async () => {
    setLoading(true)
    try {
      const res = await api.get('api/admin/stats/');
      setStats(res.data);
    } catch (err) {
      setError('No se pudo obtener la información de las estadísticas.');
      
      showNotification({
        title: 'Error',
        message: error,
        color: 'zenkooRed',
        icon: <IconX size={16} />,
      });
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder mt="xl">
      <Title order={3} mb="sm">Estadísticas de la plataforma</Title>

      {loading ? (
        <Loader />
      ) : stats ? (
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <Paper shadow="sm" p="md" radius="md" withBorder>
              <IconUsers size={32} />
              <Title order={5}>Usuarios registrados</Title>
              <Text size="lg">{stats?.total_users}</Text>
            </Paper>
          </Grid.Col>
    
          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <Paper shadow="sm" p="md" radius="md" withBorder>
              <IconTrendingUp size={32} />
              <Title order={5}>Total de ingresos registrados</Title>
              <Text size="lg">{stats?.total_incomes}</Text>
            </Paper>
          </Grid.Col>
    
          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <Paper shadow="sm" p="md" radius="md" withBorder>
              <IconTrendingDown size={32} />
              <Title order={5}>Total de gastos registrados</Title>
              <Text size="lg">{stats?.total_expenses}</Text>
            </Paper>
          </Grid.Col>
    
          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <Paper shadow="sm" p="md" radius="md" withBorder>
              <IconPigMoney size={32} />
              <Title order={5}>Total de metas creadas</Title>
              <Text size="lg">{stats?.total_goals}</Text>
            </Paper>
          </Grid.Col>
    
          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <Paper shadow="sm" p="md" radius="md" withBorder>
              <IconCoin size={32} />
              <Title order={5}>Total ahorrado por usuarios</Title>
              <Text size="lg">{stats?.total_saved.toFixed(2)} €</Text>
            </Paper>
          </Grid.Col>
        </Grid>
      ) : (
        <Text>No hay información disponible.</Text>
      )}
    </Card>
  );
}