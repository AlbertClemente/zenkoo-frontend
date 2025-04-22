import { useState } from 'react';
import api from '@/lib/axios';
import { IconX } from '@tabler/icons-react';
import { showNotification } from '@mantine/notifications';

export function usePredictCategory() {
  const [suggestedCategory, setSuggestedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const predict = async (text: string) => {
    if (!text || text.length < 3) return;

    setLoading(true);
    try {
      const res = await api.post('/api/predict-category/', { text });
      setSuggestedCategory(res.data.category);
    } catch (err) {
      console.error('Error al predecir la categoría:', err);
      showNotification({
        title: 'Error',
        message: 'Lo sentimos. No hemos podido predecir la categoría del gasto.',
        color: 'zenkooRed',
        icon: <IconX size={16} />,
      });
      setSuggestedCategory(null);
    } finally {
      setLoading(false);
    }
  };

  const resetSuggestion = () => setSuggestedCategory(null);

  return { suggestedCategory, loading, predict, resetSuggestion };
}