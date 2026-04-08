import api from '../lib/axios';

export { api };

/**
 * Standard utility to extract data from axios response safely
 */
const extractData = async <T>(promise: Promise<{ data: T }>): Promise<T> => {
  const response = await promise;
  return response.data;
};

// ================= AUTH =================
export const authAPI = {
  login: (email: string, password: string) =>
    extractData<any>(api.post('/auth/login', { email, password })),

  register: (name: string, email: string, password: string) =>
    extractData<any>(api.post('/auth/register', { name, email, password })),

  me: () => extractData<any>(api.get('/auth/me')),

  logout: () => extractData<any>(api.post('/auth/logout')),
};

// ================= RECORDS =================
export const recordsAPI = {
  getAll: () => extractData<any[]>(api.get('/records')),

  getById: (id: string) => extractData<any>(api.get(`/records/${id}`)),

  create: <T>(data: T) => extractData<any>(api.post('/records', data)),

  update: <T>(id: string, data: T) => extractData<any>(api.put(`/records/${id}`, data)),

  delete: (id: string) => extractData<any>(api.delete(`/records/${id}`)),
};

// ================= ANALYTICS =================
export const analyticsAPI = {
  getSummary: () => extractData<any>(api.get('/analytics/summary')),
  getTrends: () => extractData<any>(api.get('/analytics/trends')),
  getScore: () => extractData<any>(api.get('/analytics/score')),
  getMetrics: () => extractData<any>(api.get('/analytics/metrics')),

  addMetric: (metric: string, value: number) =>
    extractData<any>(api.post('/analytics/metrics', { metric, value })),
};

// ================= REPORTS =================
export const reportsAPI = {
  getAll: () => extractData<any[]>(api.get('/reports')),

  create: <T>(data: T) => extractData<any>(api.post('/reports', data)),

  delete: (id: string) => extractData<any>(api.delete(`/reports/${id}`)),
};

// ================= PAYMENTS =================
export const paymentsAPI = {
  getAll: () => extractData<any[]>(api.get('/payments')),
  getSubscription: () => extractData<any>(api.get('/payments/subscription')),
  createOrder: (plan: 'pro' | 'premium') => extractData<any>(api.post('/payments/create-order', { plan })),
  verify: <T>(payload: T) => extractData<any>(api.post('/payments/verify', payload)),
};

// ================= AI =================
export const aiAPI = {
  analyze: <T>(businessData: T) => extractData<any>(api.post('/ai/analyze', businessData)),
  health: () => extractData<any>(api.get('/ai/health')),
};

// ================= COMPANY =================
export const companyAPI = {
  setup: <T>(data: T) => extractData<any>(api.post('/company/setup', data)),
  get: () => extractData<any>(api.get('/company')),
};

// ================= DASHBOARD =================
export const dashboardAPI = {
  get: () => extractData<any>(api.get('/dashboard')),
};

// ================= AERA (Billion Dollar Vision) =================
export const aeraAPI = {
  getSentinel: (data: { 
    industry: string; 
    region: string; 
    current_cash_reserve: number; 
    monthly_burn_rate: number; 
    is_global_exposure?: boolean 
  }) => extractData<any>(api.post('/ai/sentinel', data)),
};

// ================= SYSTEM =================
export const systemAPI = {
  getHealthReport: () => extractData<any>(api.get('/system/report')),
};

export default api;



