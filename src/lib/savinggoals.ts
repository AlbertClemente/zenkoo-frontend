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

export interface SavingGoalCreate {
  title: string;
  target_amount: number;
  current_amount: number;
  deadline?: string | null;
  status: string;
}

export async function getSavingGoals(): Promise<SavingGoal[]> {
  const response = await api.get('/api/saving-goals/');
  return response.data.results; 
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
