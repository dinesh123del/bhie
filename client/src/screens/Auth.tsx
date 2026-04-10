"use client"
import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, AlertCircle, CheckCircle, User } from 'lucide-react';
import { authService } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/BizUI';
import SEO from '../components/SEO';

interface AuthInputProps {
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  error?: string;
}

const AuthInput: React.FC<AuthInputProps> = ({ label, type, value, onChange, placeholder, icon, error }) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-text-secondary">{label}</label>
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
          {icon}
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`
          w-full h-12 px-4 ${icon ? 'pl-11' : ''} 
          bg-bg-secondary border rounded-lg
          text-text-primary placeholder-text-muted
          focus:outline-none focus:ring-1 focus:ring-accent-blue
          transition-colors duration-300
          ${error ? 'border-accent-rose' : 'border-border-default'}
        `}
      />
    </div>
    {error && <p className="text-xs text-accent-rose">{error}</p>}
  </div>
);

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const from = params.get('from');

    if (token && from === 'google') {
      setLoading(true);
      localStorage.setItem('token', token);
      authService.getMe()
        .then(user => {
          if (user) {
            login(token, user);
            toast.success('Signed in with Google.');
          }
        })
        .catch(() => {
          localStorage.removeItem('token');
          toast.error('Failed to complete Google login');
        })
        .finally(() => setLoading(false));
    }
  }, [location, login]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const response = await authService.login({ email, password });
      login(response.token, response.user);
      toast.success(`Welcome back, ${response.user.name}`);

      const params = new URLSearchParams(location.search);
      const from = params.get('from');

      if (from) {
        navigate(from, { replace: true });
      } else if (response.user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Login failed';
      if (message === 'Invalid credentials') {
        toast.error('Incorrect email or password');
        setTimeout(() => navigate(`/register?email=${encodeURIComponent(email)}`, { replace: true }), 1000);
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-bg-primary">
      <SEO title="Sign In | Biz Plus" description="Sign in to your Biz Plus account" />

      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-primary" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent-blue/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-accent-purple/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center">
              <span className="text-lg font-bold text-white">B</span>
            </div>
            <span className="text-2xl font-bold text-text-primary">BIZ PLUS</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-bg-secondary border border-border-default rounded-2xl p-6 md:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-text-primary">Welcome back</h2>
            <p className="text-text-tertiary mt-1">Sign in to continue</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-accent-rose/10 border border-accent-rose/20 rounded-lg flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-accent-rose flex-shrink-0" />
              <p className="text-sm text-accent-rose">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <AuthInput
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              icon={<Mail className="w-5 h-5" />}
            />

            <AuthInput
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              icon={<Lock className="w-5 h-5" />}
            />

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-text-tertiary hover:text-accent-blue transition-colors">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full h-12 bg-white text-black font-semibold hover:bg-gray-100 transition-colors"
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-border-default" />
            <span className="text-xs text-text-muted uppercase tracking-wider">Or</span>
            <div className="flex-1 h-px bg-border-default" />
          </div>

          <div className="mt-6 text-center">
            <p className="text-text-tertiary text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-accent-blue hover:text-accent-blue/80 font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-text-muted">
            By signing in, you agree to our{' '}
            <Link to="/terms" className="text-text-tertiary hover:text-text-secondary">Terms</Link>
            {' '}and{' '}
            <Link to="/privacy" className="text-text-tertiary hover:text-text-secondary">Privacy</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const from = params.get('from');

    if (token && from === 'google') {
      setLoading(true);
      localStorage.setItem('token', token);
      authService.getMe()
        .then(user => {
          if (user) {
            login(token, user);
            toast.success('Welcome to BIZ PLUS!');
          }
        })
        .catch(() => {
          localStorage.removeItem('token');
          toast.error('Failed to complete Google login');
        })
        .finally(() => setLoading(false));
    }
  }, [location, login]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authService.register({ name, email, password });
      setSuccess(true);
      toast.success('Account created!');

      setTimeout(() => {
        login(response.token, response.user);
        navigate('/dashboard', { replace: true });
      }, 1500);
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-bg-primary">
      <SEO title="Create Account | Biz Plus" description="Create your Biz Plus account" />

      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-primary" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-purple/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-blue/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Success Message */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-accent-emerald/10 border border-accent-emerald/20 rounded-lg flex items-center gap-3"
          >
            <CheckCircle className="w-5 h-5 text-accent-emerald flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-accent-emerald">Welcome to BIZ PLUS!</p>
              <p className="text-xs text-accent-emerald/80">Redirecting to dashboard...</p>
            </div>
          </motion.div>
        )}

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center">
              <span className="text-lg font-bold text-white">B</span>
            </div>
            <span className="text-2xl font-bold text-text-primary">BIZ PLUS</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-bg-secondary border border-border-default rounded-2xl p-6 md:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-text-primary">Create account</h2>
            <p className="text-text-tertiary mt-1">Start your business journey</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-accent-rose/10 border border-accent-rose/20 rounded-lg flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-accent-rose flex-shrink-0" />
              <p className="text-sm text-accent-rose">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <AuthInput
              label="Full Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              icon={<User className="w-5 h-5" />}
            />

            <AuthInput
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              icon={<Mail className="w-5 h-5" />}
            />

            <AuthInput
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              icon={<Lock className="w-5 h-5" />}
            />

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                required
                className="mt-1 w-4 h-4 bg-bg-tertiary border border-border-default rounded accent-accent-blue"
              />
              <label htmlFor="terms" className="text-xs text-text-tertiary">
                I agree to the{' '}
                <Link to="/terms" className="text-accent-blue hover:underline">Terms</Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-accent-blue hover:underline">Privacy Policy</Link>
              </label>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full h-12 bg-gradient-to-r from-accent-blue to-accent-purple text-white font-semibold"
            >
              Create Account
            </Button>
          </form>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-border-default" />
            <span className="text-xs text-text-muted uppercase tracking-wider">Or</span>
            <div className="flex-1 h-px bg-border-default" />
          </div>

          <div className="mt-6 text-center">
            <p className="text-text-tertiary text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-accent-blue hover:text-accent-blue/80 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Default export for Next.js compatibility
export default LoginPage;