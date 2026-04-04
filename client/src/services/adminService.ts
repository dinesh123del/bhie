import api from '../lib/axios';

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  plan: 'free' | '59' | '119';
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
    paid59: number;
    paid119: number;
  };
  revenue: {
    monthly59: number;
    monthly119: number;
    total: number;
  };
  records: {
    total: number;
    last30Days: number;
  };
}

export interface UpdateUserPlanRequest {
  plan: 'free' | '59' | '119';
  planExpiry?: string;
}

export interface UpdateUserStatusRequest {
  isActive: boolean;
}

export const adminService = {
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
  }
};