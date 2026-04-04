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
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

const PremiumLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setLoading(true);
      setError('');
      // Use the authService which uses the properly configured axios instance
      const result = await authService.googleLogin(credentialResponse.credential);
      login(result.token, result.user);
    } catch (err: any) {
      setError('Google authentication failed');
      toast.error('Google login failed');
    } finally {
      setLoading(false);
    }
  };

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
            <Logo size="lg" to="/" />
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <PremiumCard gradient className="p-8 backdrop-blur-xl bg-white/[0.02] border border-white/5 shadow-2xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2 tracking-wide">Welcome Back</h2>
              <p className="text-gray-400 text-sm">Sign in to access your intelligence core</p>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-200">{error}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <motion.div variants={itemVariants}>
                <label className="block text-xs font-semibold tracking-wider text-gray-400 mb-2 uppercase">Email Address</label>
                <div className="relative group">
                  <motion.div className="absolute left-4 top-3 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors">
                    <Mail className="w-5 h-5" />
                  </motion.div>
                  <motion.input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@bhie.com"
                    whileFocus={{ scale: 1.01 }}
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all duration-200"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <label className="block text-xs font-semibold tracking-wider text-gray-400 mb-2 uppercase">Password</label>
                <div className="relative group">
                  <motion.div className="absolute left-4 top-3 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors">
                    <Lock className="w-5 h-5" />
                  </motion.div>
                  <motion.input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    whileFocus={{ scale: 1.01 }}
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all duration-200"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="pt-2">
                <PremiumButton type="submit" size="lg" loading={loading} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 border-none shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                  {loading ? 'Authenticating...' : 'Sign In'}
                </PremiumButton>
              </motion.div>
            </form>

            {googleAuthEnabled && (
              <>
                <motion.div variants={itemVariants} className="py-6 flex items-center gap-4">
                  <div className="flex-1 h-px bg-white/5" />
                  <span className="text-xs text-gray-500 tracking-wider font-semibold">OR</span>
                  <div className="flex-1 h-px bg-white/5" />
                </motion.div>

                <motion.div variants={itemVariants} className="flex justify-center mb-4">
                   <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => setError('Google authentication failed')}
                      theme="filled_black"
                      shape="pill"
                      text="continue_with"
                   />
                </motion.div>
              </>
            )}

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

  // Only wrap in GoogleOAuthProvider if client ID is set
  if (googleAuthEnabled) {
    return (
      <GoogleOAuthProvider clientId={clientId}>
        {loginContent}
      </GoogleOAuthProvider>
    );
  }

  return loginContent;
};

export default PremiumLogin;
