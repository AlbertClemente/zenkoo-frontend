// components/UserCalendar.tsx
'use client'

import { Calendar } from '@mantine/dates';
import { Badge, Box, Popover, Stack, Text } from '@mantine/core';
import { useEffect, useMemo, useState } from 'react';
import { IconCoin, IconArrowDown, IconArrowUp } from '@tabler/icons-react';
import dayjs from 'dayjs';
import 'dayjs/locale/es';

interface Transaction {
  id: string;
  date: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  isSavingGoalDay?: boolean;
}

dayjs.locale('es');

export default function UserCalendar({ data }: { data: Transaction[] }) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [opened, setOpened] = useState(false);

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

    const isStartOfMonth = dayjs(date).date() === 1;
    const isEndOfMonth = dayjs(date).endOf('month').date() === dayjs(date).date();
    const hasGoal = transactions.some((t) => t.isSavingGoalDay);

    const dot = (color: string, idx: number) => (
      <Box
        key={idx}
        w={5}
        h={5}
        bg={color}
        style={{ borderRadius: '50%' }}
      />
    );

    return (
      <Box ta="center">
        <Text fz="sm">{date.getDate()}</Text>
        <Box display="flex" justifyContent="center" gap={2} mt={2}>
          {transactions.some(t => t.type === 'income') && dot('zenkoo', 1)}
          {transactions.some(t => t.type === 'expense') && dot('zenkooRed', 2)}
          {isStartOfMonth && dot('teal', 3)}
          {isEndOfMonth && dot('black', 4)}
          {hasGoal && dot('gold', 5)}
        </Box>
      </Box>
    );
  };

  const handleDayClick = (date: Date) => {
    const key = dayjs(date).format('YYYY-MM-DD');
    if (transactionsByDate[key]?.length) {
      setSelectedDate(date);
      setOpened(true);
    } else {
      setOpened(false);
    }
  };

  return (
    <Box>
      <Popover opened={opened} onChange={setOpened} width={300} position="bottom" shadow="md">
        <Popover.Target>
          <div>
            <Calendar renderDay={renderDay} onChange={handleDayClick} fullWidth size="md" />
          </div>
        </Popover.Target>
        <Popover.Dropdown>
          <Stack gap={4}>
            <Text fw={600} size="sm">
              {selectedDate ? dayjs(selectedDate).format('D MMMM YYYY') : ''}
            </Text>
            {selectedDate && transactionsByDate[dayjs(selectedDate).format('YYYY-MM-DD')]?.map((t) => (
              <Box key={t.id}>
                <Badge
                  color={t.type === 'income' ? 'zenkoo' : 'zenkooRed'}
                  leftSection={t.type === 'income' ? <IconArrowUp size={12} /> : <IconArrowDown size={12} />}
                >
                  {t.amount.toFixed(2)} €
                </Badge>
                <Text size="xs" c="dimmed" truncate>
                  {t.description}
                </Text>
              </Box>
            ))}
          </Stack>
        </Popover.Dropdown>
      </Popover>
    </Box>
  );
}
