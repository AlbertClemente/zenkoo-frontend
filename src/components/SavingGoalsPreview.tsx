'use client';

import { Stack, Text, Card } from '@mantine/core';
import { SavingGoal } from '@/lib/savinggoals';
import { SavingGoalCard } from './SavingGoalCard';

interface SavingGoalsPreviewProps {
  savingGoals: SavingGoal[];
  onEdit: (goal: SavingGoal) => void;
  onDelete: (id: string) => void;
}

export function SavingGoalsPreview({ savingGoals = [], onEdit, onDelete }: SavingGoalsPreviewProps) {
  const activeGoals = savingGoals
    .filter((goal) => goal.status === 'active')
    .slice(0, 5);

  if (activeGoals.length === 0) {
    return (
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Text size="md" c="dimmed">
          No tienes metas activas 🐷
        </Text>
      </Card>
    );
  }

  return (
    <Stack>
      {activeGoals.map((goal) => (
        <SavingGoalCard
          key={goal.id}
          goal={goal}
          onEdit={() => onEdit(goal)}
          onDelete={() => onDelete(goal.id)}
        />
      ))}
    </Stack>
  );
}