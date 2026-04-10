import api from '../lib/axios';

export interface ClientAlert {
  _id: string;
  type: 'warning' | 'success' | 'info' | 'danger';
  message: string;
  isRead: boolean;
  data: Record<string, any>;
  createdAt: string;
  readAt?: string;
}

export interface AlertsResponse {
  alerts: ClientAlert[];
  unreadCount: number;
  refreshedAt: string;
}

export const alertsAPI = {
  getAlerts: () => api.get('/alerts'),

  markRead: (id: string) => api.post(`/alerts/mark-read/${id}`),

  markAllRead: () => api.post('/alerts/mark-all-read'),
};

export default alertsAPI;

