import api from './axios';

export interface SavingGoal {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  status: 'active' | 'paused' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface SavingGoalResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: SavingGoal[];
}

export interface SavingGoalCreate {
  title: string;
  target_amount: number;
  current_amount: number;
  deadline?: string | null;
  status: string;
}

export async function getSavingGoals(
  page: number = 1,
  status?: string,
  pageSize: number = 5  
): Promise<SavingGoalResponse> {
  const response = await api.get('/api/saving-goals/', {
    params: {
      page,
      page_size: pageSize,
      ...(status && status !== 'all' ? { status } : {}),
    },
  });
  return response.data;
}
export async function createSavingGoal(data: SavingGoalCreate): Promise<SavingGoal> {
  const response = await api.post('/api/saving-goals/', data);
  return response.data;
}

export async function updateSavingGoal(id: string, data: SavingGoalCreate): Promise<SavingGoal> {
  const response = await api.put(`/api/saving-goals/${id}/`, data);
  return response.data;
}

export async function deleteSavingGoal(id: string): Promise<void> {
  await api.delete(`/api/saving-goals/${id}/`);
}
