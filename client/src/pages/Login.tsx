import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { authService } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

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

      if (!response?.token || !response?.user) {
        setError('Invalid server response');
        return;
      }

      login(response.token, response.user);
    } catch (error: any) {
      let message = 'Login failed';
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || error.message || 'Unable to connect to server';
      } else if (error instanceof Error) {
        message = error.message;
      }
      if (message === 'Invalid credentials') {
        toast.success('No account found. Redirecting to signup...');
        setTimeout(() => {
          navigate(`/register?email=${encodeURIComponent(email)}`, { replace: true });
        }, 1000);
        setLoading(false);
        return;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-900/20 to-slate-950 relative overflow-hidden">
      {/* Background Orbs */}
      <motion.div
        className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full filter blur-3xl"
        animate={{ y: [0, 50, 0], x: [0, 30, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full filter blur-3xl"
        animate={{ y: [0, -50, 0], x: [0, -30, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-md w-full p-8 rounded-2xl"
      >
        {/* Glassmorphism Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/12 via-white/6 to-transparent backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl" />

        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-white mb-2">Sign In</h2>
            <p className="text-gray-300">Welcome back to BHIE</p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-500/25 border border-red-400/50 text-red-150 rounded-lg font-medium"
            >
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-200 mb-3">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/8 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                placeholder="you@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-200 mb-3">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-white/8 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 0c0 1.657-.672 3.157-1.757 4.243A6 6 0 0121 12a6 6 0 00-6-6 6 6 0 00-4.243 1.757M9 1l-3 3m0 0l-3-3m3 3h12" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  ⟳
                </motion.span>
              ) : (
                'Sign In'
              )}
            </motion.button>

            {/* Forgot Password Link */}
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
              >
                Forgot your password?
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-gray-400 font-medium">OR</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* OTP Login */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/otp-login')}
            className="w-full py-3 px-4 bg-white/8 border border-white/20 hover:border-indigo-400/50 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 mb-6"
          >
            Login with OTP
          </motion.button>

          {/* Footer */}
          <div className="text-center">
            <p className="text-gray-300">
              Don't have an account?{' '}
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => navigate('/register')}
                className="text-indigo-300 hover:text-indigo-200 font-bold transition-colors"
              >
                Sign up
              </motion.button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

