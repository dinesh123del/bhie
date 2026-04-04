import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authService } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError('All fields are required');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authService.register(formData);

      if (!response?.token || !response?.user) {
        setError('Invalid server response');
        return;
      }

      login(response.token, response.user);
    } catch (err: any) {
      let message = 'Registration failed';
      if (axios.isAxiosError(err)) {
        message = err.response?.data?.message || err.message || 'Unable to connect to server';
      } else if (err instanceof Error) {
        message = err.message;
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
            <h2 className="text-4xl font-bold text-white mb-2">Create Account</h2>
            <p className="text-gray-300">Join BHIE and start optimizing your business</p>
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
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-200 mb-3">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 bg-white/8 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                placeholder="John Doe"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-200 mb-3">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
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
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
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
              <p className="text-xs text-gray-400 mt-2 font-medium">Minimum 6 characters</p>
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
                'Create Account'
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-gray-400 font-medium">OR</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-gray-300">
              Already have an account?{' '}
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => navigate('/login')}
                className="text-indigo-300 hover:text-indigo-200 font-bold transition-colors"
              >
                Sign in
              </motion.button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
