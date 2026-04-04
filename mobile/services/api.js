import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { API_URL } from '../src/config/api';

const API_BASE_URL = API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add and update the auth token from storage
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const authService = {
  login: (data) => api.post('/api/auth/login', data),
  register: (data) => api.post('/api/auth/register', data),
  logout: async () => {
    await AsyncStorage.removeItem('token');
  },
};

export const transactionService = {
  getTransactions: () => api.get('/api/transactions'),
  addTransaction: (data) => api.post('/api/transactions', data),
  getOverview: () => api.get('/api/transactions/overview'),
};

export default api;
