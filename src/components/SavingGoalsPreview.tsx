'use client';

import { Stack, Text } from '@mantine/core';
import { SavingGoal } from '@/lib/savinggoals';
import { SavingGoalCard } from './SavingGoalCard';

interface SavingGoalsPreviewProps {
  savingGoals: SavingGoal[];
  onEdit: (goal: SavingGoal) => void;
  onDelete: (id: string) => void;
}

export function SavingGoalsPreview({ savingGoals, onEdit, onDelete }: SavingGoalsPreviewProps) {
  const activeGoals = savingGoals
    .filter((goal) => goal.status === 'active')
    .slice(0, 3);

  if (activeGoals.length === 0) {
    return <Text c="dimmed">Aún no tienes metas activas 🐷</Text>;
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