'use client';

import {
  Card,
  Title,
  Text,
  Group,
  Badge,
  Stack,
  Loader,
  Box,
  Progress,
  Divider,
  Tooltip
} from '@mantine/core';
import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import dayjs from 'dayjs';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

type Reflection = {
  id: string;
  title: string;
  content: string;
};

type MonthlySummary = {
  id: string;
  month: string;
  income: number;
  expense: number;
  real_savings: number;
  reserved_savings: number;
  reflection: Reflection | null;
};

type Props = {
  reloadKey?: number;
};

export default function MonthlyPlanCard({ reloadKey }: Props) {
  const [data, setData] = useState<MonthlySummary | null>(null);
  const [loading, setLoading] = useState(true);

  const reserved = Number(data?.reserved_savings || 0);
  const real = Number(data?.real_savings || 0);
  const diff = real - reserved;

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
  }, [reloadKey]);

  const getSavingsColor = () => {
    if (!data) return 'dark';
  
    const reserved = Number(data.reserved_savings);
    const real = Number(data.real_savings);
  
    if (reserved === 0) return 'dark';
    if (real >= reserved) return 'zenkoo';
    if (real >= 0) return 'zenkooYellow';
    return 'zenkooRed';
  };

  const getMotivationalMessage = () => {
    if (!data) return '';
  
    const reserved = Number(data.reserved_savings);
    const real = Number(data.real_savings);
    const diff = real - reserved;
  
    if (reserved === 0) {
      return '⚠️ Este mes no has fijado ninguna meta de ahorro.';
    }
  
    if (!isNaN(reserved) && real >= reserved) {
      return `🎯 ¡Objetivo superado! Has ahorrado ${diff.toFixed(2)} € más de lo planeado.`;
    } else if (real >= 0) {
      return `🟡 Estás en positivo, pero te faltaron ${Math.abs(diff).toFixed(2)} € para tu meta. ¡Ánimo!`;
    } else {
      return `🔴 Este mes has gastado más de lo que ingresaste. Intenta ajustar el próximo mes.`;
    }
  };

  const getEmoji = () => {
    if (!data) return '';

    if (real >= reserved) return '🟢';
    if (real >= 0) return '🟡';
    return '🔴';
  };

  const percentage = data && reserved > 0
  ? (real / reserved) * 100
  : 0;

  const visualPercentage = Math.min(percentage, 100);

  if (loading) return <Loader color="zenkoo" />;

  if (!data) return <Text c="dimmed">No hay datos para este mes.</Text>;

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="xs">
        <Group justify="space-between">
          <Title order={3}>Resumen mensual</Title>
          <Badge color={getSavingsColor()}>
            {getEmoji()} {dayjs(data.month).format('MMMM YYYY')}
          </Badge>
        </Group>

        <Box mt="sm">
          <Group justify="space-between">
            <Text>Ingresos</Text>
            <Text fw={600}>{Number(data.income).toFixed(2)} €</Text>
          </Group>

          <Group justify="space-between">
            <Text>Gastos</Text>
            <Text fw={600}>{Number(data.expense).toFixed(2)} €</Text>
          </Group>

          <Group justify="space-between">
            <Text>Ahorro real</Text>
            <Group gap={6}>
              <Text fw={600} c={getSavingsColor()}>
                {Number(data.real_savings).toFixed(2)} €
              </Text>
              {data.real_savings >= 0 ? (
                <ArrowUpRight size={16} />
              ) : (
                <ArrowDownRight size={16} />
              )}
            </Group>
          </Group>

          <Group justify="space-between">
            <Text>Ahorro reservado</Text>
            <Text fw={600}>{Number(data.reserved_savings).toFixed(2)} €</Text>
          </Group>
        </Box>
        
        <Divider mt="sm" />
        
        <Box mt="sm">
          <Text size="sm" fw={500}>
            Progreso hacia tu meta:
          </Text>
          <Progress.Root size="xl" radius="xl" transitionDuration={200} mt="xs">
            <Tooltip label={`${percentage.toFixed(1)}%`}>
              <Progress.Section value={visualPercentage} color={getSavingsColor()}>
                <Progress.Label>{`${percentage.toFixed(1)}%`}</Progress.Label>
              </Progress.Section>
            </Tooltip>
          </Progress.Root>
        </Box>
        
        <Divider mt="sm" />

        <Box mt="sm">
          <Text size="sm" c="dimmed">
            Reflexión del mes:
          </Text>
          {data.reflection?.title?.trim() ? (
            <Text size="md" fw={500} mt="sm">{data.reflection.title}</Text>
          ) : null}

          {data.reflection?.content?.trim() ? (
              <Text size="sm" mt="sm">{data.reflection.content}</Text>
            ) : (
              <Text size="sm" c="dimmed" mt="sm">No has escrito ninguna reflexión aún.</Text>
            )
          }
        </Box>

        <Text size="sm" c={getSavingsColor()} mt="xs">
          {getMotivationalMessage()}
        </Text>
      </Stack>
    </Card>
  );
}
