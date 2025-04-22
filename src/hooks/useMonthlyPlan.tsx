import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { showNotification } from '@mantine/notifications';
import { IconX } from '@tabler/icons-react';

export type MonthlySummary = {
  month: string;
  income: number;
  expense: number;
  real_savings: number;
  reserved_savings: number;
  reflection: string;
};

export default function useMonthlyPlan() {
  const [data, setData] = useState<MonthlySummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMonthlyPlan = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/monthly-plan/current/');
      setData(res.data);
    } catch (err) {
      console.error('Error al cargar el resumen mensual', err);
      showNotification({
        title: 'Error',
        message: 'No hemos podido cargar tu plan mensual.',
        color: 'zenkooRed',
        icon: <IconX size={16} />,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthlyPlan();
  }, []);

  return {
    data,
    loading,
    refetch: fetchMonthlyPlan,
  };
}