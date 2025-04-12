import api from './axios';

export interface Expense {
  id: string;
  amount: number;
  date: string; // ISO string
  type: string;
  created_at: string;
  updated_at: string;
  category: string;
}

export interface ExpenseCreate {
  amount: number;
  date: string; // ISO string
  type: string;
  category: string;
}

export async function getExpenses(): Promise<Expense[]> {
  const response = await api.get('/api/expenses/');
  return response.data.results; 
}

export async function createExpense(data: ExpenseCreate): Promise<Expense> {
  const response = await api.post('/api/expenses/', data);
  return response.data;
}

export async function updateExpense(id: string, data: ExpenseCreate): Promise<Expense> {
  const response = await api.put(`/api/expenses/${id}/`, data);
  return response.data;
}

export async function deleteExpense(id: string): Promise<void> {
  await api.delete(`/api/expenses/${id}/`);
}
