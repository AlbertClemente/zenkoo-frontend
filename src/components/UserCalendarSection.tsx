'use client';

import { Badge, Box, Card, Group, Stack, Text, Title, rem, Tooltip, Pagination, Center,} from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { IconArrowDown, IconArrowUp, IconTarget } from '@tabler/icons-react';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { useMemo, useState } from 'react';
import { Transaction } from '@/types/transactions';
import CalendarCaption from './CalendarCaption';

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

          //console.log('💰 Nomina detectada:', startKey, '-> cierre:', endKey);

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

    /*
    console.log({
      date: key,
      isStartOfMonth,
      isEndOfMonth
    });
    */

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
          width: rem(42),
          height: rem(42),
          backgroundColor: isSelected
            ? 'var(--mantine-color-zenkoo)'
            : isToday
            ? '#b2f2bb'
            : undefined,
          display: 'flex',
          color: isSelected
            ? 'var(--mantine-primary-color-contrast)'
            : isToday 
            ? '#121212' 
            : 'var(--text-color)',
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

  const categoryColors: Record<string, string> = {
    'Supervivencia': 'zenkoo',
    'Ocio y vicio': 'zenkooYellow',
    'Cultura': 'zenkooViolet',
    'Extras': 'zenkooBlue',
    'Desconocido': 'gray',
  };

  return (
    <Box display="flex" mt="md" style={{ flexWrap: 'wrap', gap: 'xl', }} pos="relative">
      {/* Calendario */}
      <Box w={{ base: '100%', md: '40%', sm: '50%' }}>
        <Box pos="relative" style={{ zIndex: 0 }}>
          <DatePicker
            value={selectedDate}
            onChange={setSelectedDate}
            renderDay={renderDay}
            size="md"
          />
        </Box>
        <Group justify="flex-start" mt="xs" mb="md">
          <CalendarCaption />
        </Group>
      </Box>

      {/* Transacciones del día */}
      <Box w={{ base: '100%', md: '60%', sm: '50%' }}>
        <Title order={4} mb="sm">
          {selectedDate
            ? `Movimientos del ${dayjs(selectedDate).format('D MMMM YYYY')}`
            : 'Selecciona un día'}
        </Title>

        {paginatedTransactions.length === 0 ? (
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Text size="md" c="dimmed">
              No hay movimientos para este día aun 🐷
            </Text>
          </Card>
        ) : (
          <Stack>
            {paginatedTransactions.map((t) => {
            
            const categoryName = t.category ?? 'Desconocido';
            const badgeColor = categoryColors[categoryName] || 'grape';

            return (
              <Card key={t.id} shadow="xs" padding="sm" radius="md" withBorder>
                <Group justify="space-between">
                  {(t.kind === 'income' || t.kind === 'expense') && (
                    <Text fw={500}>{t.type}</Text>
                  )}
                  {t.kind === 'goal' && (
                    <Text fw={500}>{t.description}</Text>
                  )}
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
                      ) : t.kind === 'goal' ? (
                        <IconTarget size={12} />
                      ) : null
                    }
                  >
                    {t.isSavingGoalDay ? 'Meta activa' : `${t.amount.toFixed(2)} €`}
                  </Badge>
                </Group>
                {t.kind === 'goal' && (
                  <Text size="xs" c="dimmed" mt={4}>
                    {t.type}
                  </Text>
                )}
                {t.category && (
                  <Badge color={badgeColor} variant="light" mt={4}>
                    {t.category}
                  </Badge>
                )}
              </Card>
            )})}
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
