import api from '../lib/axios';

export interface Report {
  id: string;
  _id?: string;
  userId: string;
  title: string;
  content: string;
  type: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ReportCreateRequest {
  title: string;
  content?: string;
  type?: string;
}

export const reportsService = {
  getReports: async () => {
    const response = await api.get<Report[]>('/reports');
    return response.data;
  },

  createReport: async (data: ReportCreateRequest) => {
    const response = await api.post<Report>('/reports', data);
    return response.data;
  },

  deleteReport: async (id: string) => {
    const response = await api.delete(`/reports/${id}`);
    return response.data;
  }
};
