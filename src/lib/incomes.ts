import api from './axios';

export interface Income {
  id: string;
  amount: number;
  date: string; // ISO string
  type: string;
  created_at: string;
  updated_at: string;
}

export interface IncomeCreate {
  amount: number;
  date: string; // ISO string
  type: string;
}

export interface IncomeResponse {
  results: Income[];
  count: number;
}

export async function getIncomes(
  page = 1,
  startDate?: string,
  endDate?: string,
  pageSize = 5
): Promise<{ results: Income[]; count: number }> {
  const params: any = { page, page_size: pageSize };

  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;

  const response = await api.get('/api/incomes/', { params });
  return response.data;
}

export async function createIncome(data: IncomeCreate): Promise<Income> {
  const response = await api.post('/api/incomes/', data);
  return response.data;
}

export async function updateIncome(id: string, data: IncomeCreate): Promise<Income> {
  const response = await api.put(`/api/incomes/${id}/`, data);
  return response.data;
}

export async function deleteIncome(id: string): Promise<void> {
  await api.delete(`/api/incomes/${id}/`);
}