import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { authService } from '../services/authService';
import { PremiumButton, PremiumCard } from '../components/ui/PremiumComponents';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';
import Logo from '../components/Logo';

const PremiumLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      login(response.token, response.user);
    } catch (error: any) {
      let message = 'Login failed';
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || 'Unable to connect to server';
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
      if (loading) setLoading(false);  // Ensure loading reset
    }
  };

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Gradient Background */}
      <motion.div
        className="absolute top-0 left-0 w-96 h-96 bg-indigo-600/20 rounded-full filter blur-3xl"
        animate={{ y: [0, 50, 0], x: [0, 30, 0] }}
        transition={{ duration: 20, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full filter blur-3xl"
        animate={{ y: [0, -50, 0], x: [0, -30, 0] }}
        transition={{ duration: 25, repeat: Infinity }}
      />

      {/* Content */}
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo & Header */}
        <motion.div variants={itemVariants} className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <Logo size="lg" to="/" subtitle="Business Health Intelligence Engine" />
          </div>
        </motion.div>

        {/* Card */}
        <motion.div variants={itemVariants}>
          <PremiumCard gradient className="p-8">
            {/* Heading */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
              <p className="text-gray-400">Sign in to access your dashboard</p>
            </div>

            {/* Error Alert */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-200">{error}</p>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative group">
                  <motion.div
                    className="absolute left-4 top-3.5 w-5 h-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors"
                    whileHover={{ scale: 1.1 }}
                  >
                    <Mail className="w-5 h-5" />
                  </motion.div>
                  <motion.input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@bhie.com"
                    whileFocus={{ scale: 1.01, boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.1)' }}
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all duration-200"
                  />
                </div>
              </motion.div>

              {/* Password */}
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative group">
                  <motion.div
                    className="absolute left-4 top-3.5 w-5 h-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors"
                    whileHover={{ scale: 1.1 }}
                  >
                    <Lock className="w-5 h-5" />
                  </motion.div>
                  <motion.input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    whileFocus={{ scale: 1.01, boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.1)' }}
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all duration-200"
                  />
                </div>
              </motion.div>

              {/* Remember Me */}
              <motion.div variants={itemVariants} className="flex items-center justify-between">
                <motion.label
                  whileHover={{ x: 2 }}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <motion.input
                    type="checkbox"
                    whileTap={{ scale: 0.9 }}
                    className="w-4 h-4 bg-white/10 border border-white/20 rounded accent-indigo-500 cursor-pointer"
                  />
                  <span className="text-sm text-gray-400">Remember me</span>
                </motion.label>
                <motion.a
                  whileHover={{ x: 2, color: '#a5f3fc' }}
                  whileTap={{ scale: 0.98 }}
                  href="/forgot-password"
                  className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Forgot password?
                </motion.a>
              </motion.div>

              {/* Submit Button */}
              <motion.div variants={itemVariants} className="pt-4">
                <PremiumButton
                  type="submit"
                  size="lg"
                  loading={loading}
                  className="w-full"
                  icon={<ArrowRight className="w-5 h-5" />}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </PremiumButton>
              </motion.div>
            </form>

            {/* Divider */}
            <motion.div variants={itemVariants} className="py-6 flex items-center gap-4">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-gray-500 px-2">OR</span>
              <div className="flex-1 h-px bg-white/10" />
            </motion.div>

            {/* Register Link */}
            <motion.div variants={itemVariants} className="text-center">
              <p className="text-gray-400 text-sm">
                Don't have an account?{' '}
                <motion.a
                  whileHover={{ x: 2 }}
                  href="/register"
                  className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                >
                  Sign up
                </motion.a>
              </p>
            </motion.div>
          </PremiumCard>
        </motion.div>

        {/* Demo Credentials */}
        <motion.div variants={itemVariants} className="mt-8 p-4 bg-white/5 border border-white/10 rounded-xl">
          <p className="text-xs font-medium text-gray-400 mb-2">Demo Credentials:</p>
          <p className="text-xs text-gray-500">Email: admin@bhie.com</p>
          <p className="text-xs text-gray-500">Password: admin123</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PremiumLogin;
