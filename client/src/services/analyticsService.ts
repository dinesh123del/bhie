import api from '../lib/axios';

export interface AnalyticsSummary {
  kpis: {
    totalRecords: number;
    activeRecords: number;
    inactiveRatio: number;
    growthRate: number;
    revenue: number;
    expenses: number;
    profit: number;
    profitMargin: number;
    categories: string[];
  };
  monthlyData: Array<{ month: string; revenue: number; expenses: number; target: number }>;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  monthlyRevenue: number;
  conversionRate: number;
  planDistribution?: {
    free?: number;
    pro?: number;
    enterprise?: number;
  };
}

export const analyticsService = {
  getAnalytics: async () => {
    const response = await api.get<AnalyticsSummary>('/analytics/summary');
    return response.data;
  },

  getSummary: async () => {
    const response = await api.get<AnalyticsSummary>('/analytics/summary');
    return response.data;
  },

  getScore: async () => {
    const response = await api.get('/analytics/score');
    return response.data;
  },

  getTrends: async () => {
    const response = await api.get('/analytics/trends');
    return response.data;
  },

  getMetrics: async () => {
    const response = await api.get('/analytics/metrics');
    return response.data;
  },

  addMetric: async (metric: string, value: number) => {
    const response = await api.post('/analytics/metrics', { metric, value });
    return response.data;
  },

  getCategoryBreakdown: async () => {
    const summary = await analyticsService.getSummary();
    return summary.kpis.categories;
  },

  getMonthlyTrend: async () => {
    const summary = await analyticsService.getSummary();
    return summary.monthlyData;
  }
};

export const adminService = {
  getStats: async () => {
    const response = await api.get<AdminStats>('/admin/saas-metrics');
    return response.data;
  },

  getRevenueGrowth: async () => {
    const response = await api.get('/admin/charts/revenue-growth');
    return response.data;
  },

  getPlanDistribution: async () => {
    const response = await api.get('/admin/charts/plan-distribution');
    return response.data;
  },

  getUsers: async (skip?: number, take?: number) => {
    const response = await api.get('/admin/users', { params: { skip, take } });
    return response.data;
  },

  updateUserRole: async (userId: string, role: string) => {
    const response = await api.patch(`/admin/users/${userId}/role`, { role });
    return response.data;
  },

  deleteUser: async (userId: string) => {
    await api.delete(`/admin/users/${userId}`);
  }
};
