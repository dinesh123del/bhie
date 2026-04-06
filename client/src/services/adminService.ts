import api from '../lib/axios';

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  plan: 'free' | 'pro' | 'premium';
  planExpiry?: string;
  isActive: boolean;
  recordCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminStats {
  users: {
    total: number;
    active: number;
    free: number;
    paidPro: number;
    paidPremium: number;
  };
  revenue: {
    monthlyPro: number;
    monthlyPremium: number;
    total: number;
  };
  records: {
    total: number;
    last30Days: number;
  };
}

export interface AdminSettings {
  proPrice: number;
  premiumPrice: number;
  currency: string;
  isFreeMode: boolean;
  adminAccessCode?: string;
  adminInstructions?: string;
  splashAds?: string[];
  aiAutonomousLevel?: number;
  globalBenchmarkingEnabled?: boolean;
  resilienceModeEnabled?: boolean;
}

export interface UpdateUserPlanRequest {
  plan: 'free' | 'pro' | 'premium';
  planExpiry?: string;
}

export interface UpdateUserStatusRequest {
  isActive: boolean;
}

export const adminService = {
  // Admin Authentication
  adminLogin: async (credentials: { email: string; password: string }): Promise<any> => {
    const response = await api.post('/admin/login', credentials);
    return response.data;
  },

  checkIsAdmin: async (credentials: { email: string; password: string }): Promise<{ isAdmin: boolean }> => {
    const response = await api.post('/admin/check-admin', credentials);
    return response.data;
  },

  verifyAccessCode: async (code: string): Promise<{ success: boolean; verified: boolean }> => {
    const response = await api.post('/admin/verify-code', { code });
    return response.data;
  },

  changeAccessCode: async (currentCode: string, newCode: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.patch('/admin/access-code', { currentCode, newCode });
    return response.data;
  },

  // Admin Management
  getAdmins: async (): Promise<{ success: boolean; data: any[] }> => {
    const response = await api.get('/admin/admins');
    return response.data;
  },

  addAdmin: async (data: { email: string; password?: string; name?: string }): Promise<any> => {
    const response = await api.post('/admin/add-admin', data);
    return response.data;
  },

  removeAdmin: async (email: string): Promise<any> => {
    const response = await api.post('/admin/remove-admin', { email });
    return response.data;
  },

  // Get all users with pagination and filters
  getUsers: async (params?: {
    page?: number;
    limit?: number;
    plan?: string;
    isActive?: boolean;
    role?: string;
    search?: string;
  }): Promise<{
    users: AdminUser[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> => {
    const response = await api.get('/admin/users', { params });
    return response.data.data;
  },

  // Update user plan
  updateUserPlan: async (userId: string, data: UpdateUserPlanRequest): Promise<{
    user: AdminUser;
  }> => {
    const response = await api.patch(`/admin/user/${userId}/plan`, data);
    return response.data.data;
  },

  // Update user status
  updateUserStatus: async (userId: string, data: UpdateUserStatusRequest): Promise<{
    user: Pick<AdminUser, '_id' | 'name' | 'email' | 'isActive'>;
  }> => {
    const response = await api.patch(`/admin/user/${userId}/status`, data);
    return response.data.data;
  },

  // Reset user password
  resetUserPassword: async (userId: string, newPassword: string): Promise<{
    message: string;
  }> => {
    const response = await api.post(`/admin/user/${userId}/reset-password`, { newPassword });
    return response.data;
  },

  // Get admin statistics
  getStats: async (): Promise<AdminStats> => {
    const response = await api.get('/admin/stats');
    return response.data.data;
  },

  // Get site settings
  getSettings: async (): Promise<AdminSettings> => {
    const response = await api.get('/admin/settings');
    return response.data.data;
  },

  // Update site settings
  updateSettings: async (data: Partial<AdminSettings>): Promise<AdminSettings> => {
    const response = await api.patch('/admin/settings', data);
    return response.data.data;
  }
};