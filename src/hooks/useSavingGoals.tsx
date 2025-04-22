import { useEffect, useState } from 'react';
import { getSavingGoals, type SavingGoal } from '@/lib/savinggoals';

export function useSavingGoals() {
  const [savingGoals, setSavingGoals] = useState<SavingGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSavingGoals = async () => {
    try {
      setLoading(true);
      const data = await getSavingGoals();
      setSavingGoals(data.results);
    } catch (err) {
      console.error(err);
      setError('Error al cargar las metas de ahorro');
      showNotification({
        title: 'Error',
        message: 'No hemos podido cargar tus metas de ahorro.',
        color: 'zenkooRed',
        icon: <IconX size={16} />,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavingGoals();
  }, []);

  return { savingGoals, loading, error, refetch: fetchSavingGoals };
}