import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { authService, AuthUser } from '../services/authService';
import { toast } from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';

type User = AuthUser;

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (
    token: string,
    userData: Pick<AuthUser, 'id' | 'name' | 'email' | 'role'> & Partial<AuthUser>
  ) => void;
  logout: () => void;
  refetchUser: () => Promise<void>;
  validateAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

const normalizeUser = (
  userData: Pick<AuthUser, 'id' | 'name' | 'email' | 'role'> & Partial<AuthUser>
): User => ({
  id: userData.id,
  name: userData.name,
  email: userData.email,
  role: userData.role,
  plan: userData.plan || 'free',
  isActive: userData.isActive ?? true,
  usageCount: userData.usageCount ?? 0,
  subscriptionStatus: userData.subscriptionStatus || 'inactive',
  expiryDate: userData.expiryDate ?? userData.planExpiry ?? null,
  hasPremiumAccess: userData.hasPremiumAccess ?? (userData.plan !== 'free' && userData.isActive !== false),
});

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  // Google OAuth callback handler
  useEffect(() => {
    const handleGoogleAuth = async () => {
      const urlParams = new URLSearchParams(location.search);
      const token = urlParams.get('token');
      const fromGoogle = urlParams.get('from') === 'google';

      if (token && fromGoogle) {
        try {
          localStorage.setItem('token', token);
          const userData = await authService.getMe();
          localStorage.setItem('user', JSON.stringify(userData));
          setUser(userData);
          toast.success('Google login successful');
          navigate('/dashboard', { replace: true });
        } catch (error) {
          console.error(error);
          localStorage.clear();
          toast.error('Google login failed');
        }
      }
    };

    handleGoogleAuth();
  }, [location.search, navigate]);

  // Auth validation on mount
  const validateAuth = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (!token) {
        setLoading(false);
        setUser(null);
        return;
      }

      // Initial state from cache for perceived performance
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }

      // Live verification from backend
      const userData = await authService.getMe();
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Session expired or invalid:', error);
      localStorage.clear();
      setUser(null);
      if (!['/', '/login', '/register'].includes(location.pathname)) {
        toast.error('Session expired');
        navigate('/login', { replace: true });
      }
    } finally {
      setLoading(false);
    }
  }, [navigate, location.pathname]);

  useEffect(() => {
    validateAuth();
  }, [validateAuth]);

  // Login
  const login = (
    token: string,
    userData: Pick<AuthUser, 'id' | 'name' | 'email' | 'role'> & Partial<AuthUser>
  ) => {
    const normalizedUser = normalizeUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(normalizedUser));
    setUser(normalizedUser);
    toast.success(`Welcome back, ${normalizedUser.name}`);
    navigate('/dashboard', { replace: true });
  };

  // Logout
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Remote logout failed:', error);
    }
    localStorage.clear();
    setUser(null);
    toast.success('Logged out successfully');
    navigate('/login', { replace: true });
  };

  // Refetch user data
  const refetchUser = async () => {
    try {
      const userData = await authService.getMe();
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error(error);
      logout();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        refetchUser,
        validateAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
