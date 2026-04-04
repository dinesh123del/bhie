import api from '../lib/axios';

export interface Record {
  id: string;
  title: string;
  category: string;
  type: 'income' | 'expense';
  amount: number;
  date: string;
  description?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  fileUrl?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardData {
  totalRevenue: number;
  totalExpenses: number;
  profit: number;
  growthRate: number;
  totalRecords: number;
}

export interface RecordsFilter {
  category?: string;
  status?: string;
  skip?: number;
  take?: number;
}

export const recordsService = {
  getRecords: async (filters?: RecordsFilter) => {
    const response = await api.get<Record[]>('/records', { params: filters });
    return response.data;
  },

  getRecord: async (id: string) => {
    const response = await api.get<Record>(`/records/${id}`);
    return response.data;
  },

  getDashboard: async () => {
    const response = await api.get<DashboardData>('/dashboard');
    return response.data;
  },

  createRecord: async (data: Omit<Record, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    const response = await api.post<Record>('/records', data);
    return response.data;
  },

  updateRecord: async (id: string, data: Partial<Record>) => {
    const response = await api.put<Record>(`/records/${id}`, data);
    return response.data;
  },

  deleteRecord: async (id: string) => {
    await api.delete(`/records/${id}`);
  },

  uploadFile: async (recordId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/records/${recordId}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
};
