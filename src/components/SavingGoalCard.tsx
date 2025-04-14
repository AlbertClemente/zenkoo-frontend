'use client';

import { Card, Text, Progress, Group, Badge, Menu, ActionIcon } from '@mantine/core';
import { IconCalendar, IconDots, IconPencil, IconTrash } from '@tabler/icons-react';
import { SavingGoal } from '@/lib/savinggoals';

interface SavingGoalCardProps {
  goal: SavingGoal;
  onEdit?: (goal: SavingGoal) => void;
  onDelete?: (id: string) => void;
}

const statusColors = {
  active: 'zenkoo',
  paused: 'zenkooYellow',
  completed: 'zenkooBlue',
} as const;

const statusLabels = {
  active: 'Activa',
  paused: 'Pausada',
  completed: 'Completada',
} as const;

export function SavingGoalCard({ goal, onEdit, onDelete }: SavingGoalCardProps) {
  const percent = Math.min(100, (goal.current_amount / goal.target_amount) * 100);

  function getProgressColor(percent: number) {
    if (percent < 33) return 'zenkooRed';
    if (percent < 66) return 'zenkooYellow';
    return 'zenkoo';
  }

  return (
    <Card withBorder radius="md" shadow="sm">
      <Group justify="space-between" mb="xs">
        <div>
          <Text fw={600}>{goal.title}</Text>
          <Badge color={statusColors[goal.status]}>{statusLabels[goal.status]}</Badge>
        </div>

        {(onEdit || onDelete) && (
          <Menu withinPortal position="bottom-end" shadow="md">
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray">
                <IconDots size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              {onEdit && (
                <Menu.Item leftSection={<IconPencil size={14} />} onClick={() => onEdit(goal)}>
                  Editar
                </Menu.Item>
              )}
              {onDelete && (
                <Menu.Item leftSection={<IconTrash size={14} />} color="red" onClick={() => onDelete(goal.id)}>
                  Eliminar
                </Menu.Item>
              )}
            </Menu.Dropdown>
          </Menu>
        )}
      </Group>

      <Text size="sm" c="dimmed" mb={5}>
        {parseFloat(goal.current_amount.toString()).toFixed(2)} € de {parseFloat(goal.target_amount.toString()).toFixed(2)} €
      </Text>

      <Progress value={percent} radius="xl" color={getProgressColor(percent)} />

      {goal.deadline && (
        <Group gap={4} mt="xs">
          <IconCalendar size={16} />
          <Text size="xs" c="dimmed">
            Hasta el {new Date(goal.deadline).toLocaleDateString()}
          </Text>
        </Group>
      )}
    </Card>
  );
}