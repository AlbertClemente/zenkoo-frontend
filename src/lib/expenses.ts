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
  category?: string;
}

export interface ExpenseResponse {
  results: Expense[];
  count: number;
}

export async function getExpenses(
  page = 1,
  startDate?: string,
  endDate?: string,
  pageSize = 5,
  category?: string
): Promise<{ results: Expense[]; count: number }> {
  const params: any = { page, page_size: pageSize };

  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;
  if (category) params.category = category;

  const response = await api.get('/api/expenses/', { params });
  return response.data;
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
