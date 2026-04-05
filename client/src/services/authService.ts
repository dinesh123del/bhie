import api from '../lib/axios';
import { authAPI } from './api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  plan: 'free' | 'pro' | 'premium';
  planExpiry?: string | null;
  expiryDate?: string | null;
  isActive: boolean;
  usageCount: number;
  subscriptionStatus?: string;
  hasPremiumAccess?: boolean;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

const normalizeUser = (user: any): AuthUser => ({
  id: user.id || user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  plan: user.plan || 'free',
  planExpiry: user.planExpiry ?? user.expiryDate ?? null,
  expiryDate: user.expiryDate ?? user.planExpiry ?? null,
  isActive: user.isActive ?? true,
  usageCount: user.usageCount ?? user.recordCount ?? 0,
  subscriptionStatus: user.subscriptionStatus || (user.isActive ? 'active' : 'inactive'),
  hasPremiumAccess: user.hasPremiumAccess ?? (user.plan !== 'free' && user.isActive),
});

export const authService = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const data = await authAPI.login(credentials.email, credentials.password);
    const normalizedUser = normalizeUser(data.user);
    
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(normalizedUser));
    
    return {
      token: data.token,
      user: normalizedUser,
    };
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const responseData = await authAPI.register(data.name, data.email, data.password);
    const normalizedUser = normalizeUser(responseData.user);
    
    localStorage.setItem('token', responseData.token);
    localStorage.setItem('user', JSON.stringify(normalizedUser));
    
    return {
      token: responseData.token,
      user: normalizedUser,
    };
  },

  googleLogin: async (googleToken: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/google', { token: googleToken });
    const normalizedUser = normalizeUser(response.data.user);
    
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(normalizedUser));
    
    return {
      token: response.data.token,
      user: normalizedUser,
    };
  },

  getMe: async (): Promise<AuthUser> => {
    const data = await authAPI.me();
    const normalizedUser = normalizeUser(data.user);
    localStorage.setItem('user', JSON.stringify(normalizedUser));
    return normalizedUser;
  },

  updateMe: async (updates: Partial<AuthUser>): Promise<AuthUser> => {
    const response = await api.patch('/auth/me', updates);
    const normalizedUser = normalizeUser(response.data.user);
    localStorage.setItem('user', JSON.stringify(normalizedUser));
    return normalizedUser;
  },

  logout: async () => {
    try {
      await authAPI.logout();
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
};
