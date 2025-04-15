export type Transaction = {
  id: string;
  date: string;
  amount: number;
  type: string;
  kind: 'income' | 'expense' | 'goal';
  description?: string;
  category?: string | null;
  isSavingGoalDay?: boolean;
};