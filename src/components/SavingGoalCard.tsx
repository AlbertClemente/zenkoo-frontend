'use client';

import { Card, Text, Progress, Group, Badge, Menu, ActionIcon, Button } from '@mantine/core';
import { IconDots, IconCheck } from '@tabler/icons-react';
import { SavingGoal } from '@/lib/savinggoals';
import { Calendar, Pencil, Trash } from 'lucide-react';

interface SavingGoalCardProps {
  goal: SavingGoal;
  onEdit?: (goal: SavingGoal) => void;
  onDelete?: (id: string) => void;
  onMarkCompleted?: (id: string) => void; // Nuevo callback para marcar como completada
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

export function SavingGoalCard({ goal, onEdit, onDelete, onMarkCompleted }: SavingGoalCardProps) {
  const percent = Math.min(100, (goal.current_amount / goal.target_amount) * 100);

  function getProgressColor(percent: number) {
    if (percent < 33) return 'zenkooRed';
    if (percent < 66) return 'zenkooYellow';
    return 'zenkoo';
  }

  // Determinar si la meta está completada
  const isCompleted = goal.status === 'completed';
  const isPaused = goal.status === 'paused';

  // Solo habilitar el botón si la meta está activa y el monto actual es igual o superior al objetivo
  const canMarkCompleted = goal.status === 'active' && goal.current_amount >= goal.target_amount && !isCompleted;

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
              {/* Solo habilitar la opción de editar si no está completada */}
              {!isCompleted && onEdit && (
                <Menu.Item leftSection={<Pencil size={16} />} onClick={() => onEdit(goal)}>
                  Editar
                </Menu.Item>
              )}
              {onDelete && (
                <Menu.Item leftSection={<Trash size={16} />} color="red" onClick={() => onDelete(goal.id)}>
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
          <Calendar size={16} />
          <Text size="xs" c="dimmed">
            Hasta el {new Date(goal.deadline).toLocaleDateString()}
          </Text>
        </Group>
      )}

      {/* Mostrar botón de "Marcar como completada" solo si la meta está activa y se ha alcanzado el objetivo */}
      {canMarkCompleted && (
        <Button
          mt="md"
          onClick={() => onMarkCompleted?.(goal.id)} 
          color="zenkoo"
          leftSection={<IconCheck size={16} />}
          fullWidth
        >
          Marcar como completada
        </Button>
      )}
    </Card>
  );
}
