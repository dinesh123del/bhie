import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

export const API = import.meta.env.VITE_API_URL || "";

type RetryableConfig = InternalAxiosRequestConfig & {
  __retryCount?: number;
};

const RETRYABLE_METHODS = new Set(['get', 'head', 'options']);
const MAX_RETRIES = 2;
const BASE_RETRY_DELAY_MS = 1000;

const api: AxiosInstance = axios.create({
  baseURL: `${API}/api`,
  withCredentials: true,
  timeout: 15000,
});

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

const shouldRetryRequest = (error: AxiosError): boolean => {
  const config = error.config as RetryableConfig | undefined;
  if (!config?.method) return false;

  const method = config.method.toLowerCase();
  if (!RETRYABLE_METHODS.has(method)) return false;

  const retryCount = config.__retryCount ?? 0;
  if (retryCount >= MAX_RETRIES) return false;

  const status = error.response?.status;
  return !status || status === 429 || status >= 500;
};

// --- Helper: Get cookie by name ---
const getCookie = (name: string): string | undefined => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
};

// --- Request Interceptor ---
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 1. BANK-GRADE SECURITY: Anti-CSRF
    const csrfToken = getCookie('XSRF-TOKEN');
    if (csrfToken && config.headers) {
      config.headers['X-XSRF-TOKEN'] = csrfToken;
    }

    // 2. Auth Token (Header fallback for mobile/legacy)
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Response Interceptor ---
api.interceptors.response.use(
  (response) => {
    // Return only the data portion to simplify calling code
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableConfig;
    const { response } = error;

    // 1. Handle Unauthenticated (401)
    if (response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Prevent infinite redirect loops
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = `/login?from=${encodeURIComponent(window.location.pathname)}`;
      }
    }

    // 2. Extract standardized error message
    let errorMessage = 'An unexpected error occurred';
    
    if (response) {
      if (response.data && typeof response.data === 'object') {
        const data = response.data as any;
        errorMessage = data.message || data.error || errorMessage;
        
        if (data.details) {
          (error as any).details = data.details;
          if (response.status === 403 && data.details.limitReached && typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('limitReached'));
          }
        }
      } else if (typeof response.data === 'string') {
        if (response.data.includes('<html') || response.data.includes('<!DOCTYPE')) {
          errorMessage = `Server processing error (${response.status}). Please try again later.`;
        } else {
          errorMessage = response.data;
        }
      } else if (response.status >= 500) {
        errorMessage = 'Our server encountered an issue. Please try again soon.';
      }
    } else if (error.request) {
      errorMessage = 'Unable to connect to BHIE servers. Please check your internet connection.';
    }

    // Attach human-readable message for easy UI consumption
    (error as any).displayMessage = errorMessage;

    // 3. Automated Retry Logic
    if (shouldRetryRequest(error) && originalRequest) {
      originalRequest.__retryCount = (originalRequest.__retryCount ?? 0) + 1;
      await wait(BASE_RETRY_DELAY_MS * originalRequest.__retryCount);
      return api(originalRequest);
    }

    return Promise.reject(error);
  }
);

export default api;

