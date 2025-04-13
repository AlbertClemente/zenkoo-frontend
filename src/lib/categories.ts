import api from './axios';

export interface Category {
  id: string;
  name: string;
  type: string;
  created_at: string;
  updated_at: string;
}

export async function getCategories(): Promise<Category[]> {
  const response = await api.get('/api/categories/');
  return response.data.results;
}