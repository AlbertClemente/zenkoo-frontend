'use client';

import {
  Badge,
  Box,
  Card,
  Group,
  Stack,
  Text,
  Title,
  rem,
  Tooltip,
  Pagination,
  Center,
} from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { IconArrowDown, IconArrowUp } from '@tabler/icons-react';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { useMemo, useState } from 'react';
import { Transaction } from '@/types/transactions';

dayjs.locale('es');

const ITEMS_PER_PAGE = 5;

export default function UserCalendarSection({ data }: { data: Transaction[] }) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [page, setPage] = useState(1);

  //Kakeibo style!!
  const { customStartOfMonthDates, customEndOfMonthDates } = useMemo(() => {
    const startSet = new Set<string>();
    const endSet = new Set<string>();
    
    // Calcular inicios y cierres de mes personalizados (tipo Sueldo/Nómina)
    data.forEach((t) => {
      if (t.kind === 'income') {
        const normalized = t.type.toLowerCase().trim();
        const isNomina = ['sueldo', 'nómina', 'nomina'].some((kw) =>
          normalized.includes(kw)
        );
        if (isNomina) {
          const payDate = dayjs(t.date);
          const startKey = payDate.format('YYYY-MM-DD');
          const endKey = payDate.subtract(1, 'day').format('YYYY-MM-DD');

          console.log('💰 Nomina detectada:', startKey, '-> cierre:', endKey);

          startSet.add(startKey);
          endSet.add(endKey);
        }
      }
    });
  
    return {
      customStartOfMonthDates: startSet,
      customEndOfMonthDates: endSet,
    };
  }, [data]);

  const transactionsByDate = useMemo(() => {
    const map: Record<string, Transaction[]> = {};
    data.forEach((t) => {
      const key = dayjs(t.date).format('YYYY-MM-DD');
      if (!map[key]) map[key] = [];
      map[key].push(t);
    });
    return map;
  }, [data]);

  const renderDay = (date: Date) => {
    const key = dayjs(date).format('YYYY-MM-DD');
    const transactions = transactionsByDate[key] || [];
    const isToday = dayjs(date).isSame(dayjs(), 'day');
    const isSelected = selectedDate && dayjs(date).isSame(selectedDate, 'day');
    const isStartOfMonth = Array.from(customStartOfMonthDates).includes(key);
    const isEndOfMonth = Array.from(customEndOfMonthDates).includes(key);
    const hasGoal = transactions.some((t) => t.isSavingGoalDay);

    console.log({
      date: key,
      isStartOfMonth,
      isEndOfMonth
    });

    const dot = (color: string, idx: number, shape: 'round' | 'square' = 'round') => (
      <Box
        key={idx}
        w={6}
        h={6}
        bg={color}
        style={{ borderRadius: shape === 'round' ? '50%' : rem(2) }}
      />
    );

    const dots = (
      <Box
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 2,
          marginTop: 2,
        }}
      >
        {transactions.some((t) => t.kind === 'income') && dot('zenkoo', 1)}
        {transactions.some((t) => t.kind === 'expense') && dot('zenkooRed', 2)}
        {isStartOfMonth && dot('zenkooBlue', 3)}
        {isEndOfMonth && dot('zenkooViolet', 4)}
        {hasGoal && dot('gold', 5, 'square')}
      </Box>
    );

    const tooltipLabel = isStartOfMonth
      ? 'Inicio de mes'
      : isEndOfMonth
      ? 'Fin de mes'
      : null;

    const wrapWithTooltip = (node: React.ReactNode) =>
      tooltipLabel ? (
        <Tooltip label={tooltipLabel} position="top" withArrow>
          {node}
        </Tooltip>
      ) : (
        node
      );

    return wrapWithTooltip(
      <Box
        ta="center"
        style={{
          cursor: 'pointer',
          borderRadius: rem(6),
          padding: rem(6),
          width: rem(34),
          height: rem(34),
          backgroundColor: isSelected
            ? 'var(--mantine-color-zenkoo)'
            : isToday
            ? '#b2f2bb'
            : undefined,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onClick={() => {
          setSelectedDate(date);
          setPage(1); // reset page when changing date
        }}
      >
        <Text fz="sm">{date.getDate()}</Text>
        {dots}
      </Box>
    );
  };

  const selectedKey = selectedDate
    ? dayjs(selectedDate).format('YYYY-MM-DD')
    : null;
  const selectedTransactions = selectedKey ? transactionsByDate[selectedKey] || [] : [];

  const totalPages = Math.ceil(selectedTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = selectedTransactions.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <Box display="flex" gap="xl" mt="md" style={{ flexWrap: 'wrap' }}>
      {/* Calendario */}
      <Box w={{ base: '100%', md: '40%' }}>
        <DatePicker
          value={selectedDate}
          onChange={setSelectedDate}
          renderDay={renderDay}
          size="md"
        />
        <Stack gap={6} mt="md">
          <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Box w={10} h={10} bg="zenkoo" style={{ borderRadius: '50%' }} />
            <Text size="xs">Ingreso</Text>
          </Box>
          <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Box w={10} h={10} bg="zenkooRed" style={{ borderRadius: '50%' }} />
            <Text size="xs">Gasto</Text>
          </Box>
          <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Box w={10} h={10} bg="gold" style={{ borderRadius: rem(2) }} />
            <Text size="xs">Meta activa</Text>
          </Box>
          <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Box w={10} h={10} bg="zenkooBlue" style={{ borderRadius: '50%' }} />
            <Text size="xs">Inicio de mes</Text>
          </Box>
          <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Box w={10} h={10} bg="zenkooViolet" style={{ borderRadius: '50%' }} />
            <Text size="xs">Fin de mes</Text>
          </Box>
        </Stack>
      </Box>

      {/* Transacciones del día */}
      <Box w={{ base: '100%', md: '60%' }}>
        <Title order={4} mb="sm">
          {selectedDate
            ? `Movimientos del ${dayjs(selectedDate).format('D MMMM YYYY')}`
            : 'Selecciona un día'}
        </Title>

        {paginatedTransactions.length === 0 ? (
          <Text size="sm" c="dimmed">
            No hay movimientos para este día.
          </Text>
        ) : (
          <Stack>
            {paginatedTransactions.map((t) => (
              <Card key={t.id} shadow="xs" padding="sm" radius="md" withBorder>
                <Group justify="space-between">
                  <Text fw={500}>{t.type}</Text>
                  <Badge
                    color={
                      t.isSavingGoalDay
                        ? 'gold'
                        : t.kind === 'income'
                        ? 'zenkoo'
                        : 'zenkooRed'
                    }
                    styles={t.isSavingGoalDay ? { root: { color: 'black' } } : {}}
                    leftSection={
                      t.kind === 'income' ? (
                        <IconArrowUp size={12} />
                      ) : t.kind === 'expense' ? (
                        <IconArrowDown size={12} />
                      ) : null
                    }
                  >
                    {t.isSavingGoalDay ? 'Meta activa' : `${t.amount.toFixed(2)} €`}
                  </Badge>
                </Group>
                {t.description && (
                  <Text size="xs" c="dimmed" mt={4}>
                    {t.description}
                  </Text>
                )}
              </Card>
            ))}
          </Stack>
        )}

        {totalPages > 1 && (
          <Center mt="md">
            <Pagination
              value={page}
              onChange={setPage}
              total={totalPages}
              color="zenkoo"
            />
          </Center>
        )}
      </Box>
    </Box>
  );
}
