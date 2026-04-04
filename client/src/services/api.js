import api from '../lib/axios';

export { api };

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password) => api.post('/auth/register', { name, email, password }),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

export const recordsAPI = {
  getAll: () => api.get('/records'),
  getById: (id) => api.get(`/records/${id}`),
  create: (data) => api.post('/records', data),
  update: (id, data) => api.put(`/records/${id}`, data),
  delete: (id) => api.delete(`/records/${id}`),
};

export const analyticsAPI = {
  getSummary: () => api.get('/analytics/summary'),
  getTrends: () => api.get('/analytics/trends'),
  getScore: () => api.get('/analytics/score'),
  getMetrics: () => api.get('/analytics/metrics'),
  addMetric: (metric, value) => api.post('/analytics/metrics', { metric, value }),
};

export const reportsAPI = {
  getAll: () => api.get('/reports'),
  create: (data) => api.post('/reports', data),
  delete: (id) => api.delete(`/reports/${id}`),
};

export const paymentsAPI = {
  getAll: () => api.get('/payment'),
  getSubscription: () => api.get('/payment/subscription'),
  createOrder: (plan) => api.post('/payment/create-order', { plan }),
  verify: (payload) => api.post('/payment/verify', payload),
};

export const aiAPI = {
  analyze: (businessData) => api.post('/ai/analyze', businessData),
  health: () => api.get('/ai/health'),
};

export const companyAPI = {
  setup: (data) => api.post('/company/setup', data),
  get: () => api.get('/company'),
};

export const dashboardAPI = {
  get: () => api.get('/dashboard'),
};

export default api;
