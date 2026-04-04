import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { authService } from '../services/authService';
import { PremiumButton, PremiumCard, PremiumInput } from '../components/ui/PremiumComponents';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';
import Logo from '../components/Logo';
import { GoogleButton } from '../components/auth/GoogleButton';
import React from 'react';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

const PremiumLogin = () => {
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
            toast.success('Premium Access Granted via Google!');
          }
        })
        .catch(err => {
          console.error('Google token validation failed:', err);
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
    } catch (error: any) {
      let message = 'Login failed';
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || 'Unable to connect to server';
      }
      if (message === 'Invalid credentials') {
        toast.success('No account found. Redirecting to signup...');
        setTimeout(() => navigate(`/register?email=${encodeURIComponent(email)}`, { replace: true }), 1000);
        setLoading(false);
        return;
      }
      setError(message);
    } finally {
      if (loading) setLoading(false);
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

  // Only render GoogleOAuthProvider if client ID is available
  const googleAuthEnabled = Boolean(clientId);

  const loginContent = (
    <div className="min-h-screen bg-[#0A0D14] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Gradient Background */}
      <motion.div
        className="absolute top-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full filter blur-3xl mix-blend-screen"
        animate={{ y: [0, 50, 0], x: [0, 30, 0] }}
        transition={{ duration: 20, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full filter blur-3xl mix-blend-screen"
        animate={{ y: [0, -50, 0], x: [0, -30, 0] }}
        transition={{ duration: 25, repeat: Infinity }}
      />

      <motion.div variants={containerVariants} initial="initial" animate="animate" className="relative z-10 w-full max-w-md">
        <motion.div variants={itemVariants} className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <Logo size="lg" to="/" subtitle="Access Your Dashboard" glow />
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <PremiumCard extreme className="p-10 backdrop-blur-3xl bg-white/[0.01] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)]">
            <div className="mb-8">
              <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Welcome Back</h2>
              <p className="text-gray-400 text-sm font-medium">Sign in to your premium account</p>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-200">{error}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <PremiumInput
                floating
                label="Email Address"
                type="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                icon={<Mail className="w-5 h-5" />}
                placeholder="admin@bhie.com"
              />

              <PremiumInput
                floating
                label="Password"
                type="password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                icon={<Lock className="w-5 h-5" />}
                placeholder="••••••••"
              />

              <motion.div variants={itemVariants} className="pt-4">
                <PremiumButton 
                  type="submit" 
                  size="lg" 
                  loading={loading} 
                  className="w-full bg-gradient-to-r from-sky-400 to-indigo-500 hover:from-sky-300 hover:to-indigo-400 text-white border-none shadow-[0_20px_40px_-10px_rgba(56,189,248,0.3)]"
                >
                  {loading ? 'Authenticating...' : 'Sign In'}
                </PremiumButton>
              </motion.div>
            </form>

            <motion.div variants={itemVariants} className="py-6 flex items-center gap-4">
              <div className="flex-1 h-px bg-white/5" />
              <span className="text-xs text-gray-500 tracking-wider font-semibold">OR</span>
              <div className="flex-1 h-px bg-white/5" />
            </motion.div>

            <motion.div variants={itemVariants} className="flex justify-center mb-4">
               <GoogleButton />
            </motion.div>

            <motion.div variants={itemVariants} className="text-center mt-6">
              <p className="text-gray-400 text-sm">
                First time?{' '}
                <motion.a href="/register" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                  Create an account
                </motion.a>
              </p>
            </motion.div>
          </PremiumCard>
        </motion.div>
      </motion.div>
    </div>
  );

  return loginContent;
};

export default PremiumLogin;
