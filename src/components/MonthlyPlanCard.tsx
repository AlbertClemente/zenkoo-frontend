'use client';

import { Card, Title, Text, Group, Badge, Stack, Loader, Box } from '@mantine/core';
import { useEffect, useState } from 'react';
import { IconArrowUpRight, IconArrowDownRight } from '@tabler/icons-react';
import api from '@/lib/axios';
import dayjs from 'dayjs';

type MonthlySummary = {
  month: string;
  income: number;
  expense: number;
  real_savings: number;
  reserved_savings: number;
  reflection: string;
};

export default function MonthlyPlanCard() {
  const [data, setData] = useState<MonthlySummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMonthlyPlan = async () => {
      try {
        const response = await api.get('/api/monthly-plan/current/');
        setData(response.data);
      } catch (error) {
        console.error('Error al cargar el resumen mensual:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMonthlyPlan();
  }, []);

  const getSavingsColor = () => {
    if (!data) return 'gray';
    if (data.real_savings >= data.reserved_savings) return 'zenkoo';
    if (data.real_savings >= 0) return 'yellow';
    return 'red';
  };

  if (loading) return <Loader color="zenkoo" />;

  if (!data) return <Text c="dimmed">No hay datos para este mes.</Text>;

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="xs">
        <Group justify="space-between">
          <Title order={3}>Resumen mensual</Title>
          <Badge color={getSavingsColor()}>
            {dayjs(data.month).format('MMMM YYYY')}
          </Badge>
        </Group>

        <Group justify="space-between">
          <Text>Ingresos</Text>
          <Text fw={600}>{data.income.toFixed(2)} €</Text>
        </Group>

        <Group justify="space-between">
          <Text>Gastos</Text>
          <Text fw={600}>{data.expense.toFixed(2)} €</Text>
        </Group>

        <Group justify="space-between">
          <Text>Ahorro real</Text>
          <Group gap={6}>
            <Text fw={600} c={getSavingsColor()}>
              {data.real_savings.toFixed(2)} €
            </Text>
            {data.real_savings >= 0 ? (
              <IconArrowUpRight size={16} />
            ) : (
              <IconArrowDownRight size={16} />
            )}
          </Group>
        </Group>

        <Group justify="space-between">
          <Text>Ahorro reservado</Text>
          <Text fw={600}>{data.reserved_savings.toFixed(2)} €</Text>
        </Group>

        <Box mt="sm">
          <Text size="sm" c="dimmed" mb={4}>
            Reflexión del mes:
          </Text>
          <Text size="sm">
            {data.reflection || 'No has escrito ninguna reflexión aún.'}
          </Text>
        </Box>
      </Stack>
    </Card>
  );
}