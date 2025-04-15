import { useEffect, useState } from 'react';
import api from '@/lib/axios'; // tu cliente con token

import type { Expense } from '@/lib/expenses';
import type { Income } from '@/lib/incomes';
import type { SavingGoal } from '@/lib/savinggoals';
import type { Transaction } from '@/types/transactions';

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export default function useCalendarTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [incomeRes, expenseRes, goalRes] = await Promise.all([
          api.get<PaginatedResponse<Income>>('/api/incomes/'),
          api.get<PaginatedResponse<Expense>>('/api/expenses/'),
          api.get<PaginatedResponse<SavingGoal>>('/api/saving-goals/'),
        ]);

        const incomeTxs: Transaction[] = incomeRes.data.results.map((i) => ({
          id: i.id,
          date: i.date,
          amount: Number(i.amount),
          type: i.type,
          kind: 'income',
        }));
        
        const expenseTxs: Transaction[] = expenseRes.data.results.map((e) => ({
          id: e.id,
          date: e.date,
          amount: Number(e.amount),
          type: e.type,
          kind: 'expense',
        }));
        
        const goalTxs: Transaction[] = goalRes.data.results
        .filter((g) => g.status === 'active' && g.deadline)
        .map((g) => ({
          id: `goal-${g.id}`,
          date: g.deadline as string,
          amount: 0,
          type: 'Meta de ahorro',
          kind: 'goal', // puedes definir un tipo especial para tratarlos diferente
          isSavingGoalDay: true,
          description: g.title, // opcional si quieres mostrar el título
          category: null, // o alguna categoría si aplicara
        }));

        setTransactions([...incomeTxs, ...expenseTxs, ...goalTxs]);
      } catch (error) {
        console.error('Error cargando transacciones del calendario', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { transactions, loading };
}
