"use client"
import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, AlertCircle, ShieldCheck, Activity } from 'lucide-react';
import { authService } from '../services/authService';
import { PremiumButton, PremiumCard, PremiumInput } from '../components/ui/PremiumComponents';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';
import Logo from '../components/Logo';
import { GoogleButton } from '../components/auth/GoogleButton';
import { premiumFeedback } from '../utils/premiumFeedback';
import SEO from '../components/SEO';


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
            toast.success('Signed in with Google.');
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
      premiumFeedback.success();

      // Check for redirect path
      const params = new URLSearchParams(location.search);
      const from = params.get('from');

      if (from) {
        toast.success(`Welcome back, ${response.user.name}`);
        navigate(from, { replace: true });
      } else if (response.user.role === 'admin') {
        toast.success('Welcome back, admin.');
        navigate('/admin', { replace: true });
      } else {
        toast.success('Signed in successfully.');
        navigate('/dashboard', { replace: true });
      }
    } catch (error: any) {
      let message = 'Login failed';
      if (error && error.response) {
        message = error.response?.data?.message || 'Unable to connect to server';
      }
      if (message === 'Invalid credentials') {
        toast.error('Incorrect email or password. Try again or create an account.');
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
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: "easeOut", staggerChildren: 0.12 } },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-black selection:bg-indigo-500/30">
      <SEO
        title="Sign In | Biz Plus Intelligence"
        description="Access your Biz Plus dashboard to manage your business health, scan bills, and view real-time intelligence reports."
      />
      {/* Ambient Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-slate-950 to-indigo-950/30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(79,70,229,0.12),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(79,70,229,0.05),transparent_40%)]" />
      </div>

      <motion.div variants={containerVariants} initial="initial" animate="animate" className="relative z-10 w-full max-w-lg">

        {/* Header Section */}
        <motion.div variants={itemVariants} className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <Logo size="lg" to="/" subtitle="Intelligence" glow />
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <PremiumCard
            extreme
            className="p-8 md:p-12 backdrop-blur-[60px] bg-white/[0.02] border border-white/5 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden"
          >
            {/* Glossy Reflection Effect */}
            <div className="absolute -top-1/2 left-0 w-full h-full bg-gradient-to-b from-white/[0.03] to-transparent skew-y-[-15deg] pointer-events-none" />

            <div className="relative z-10">
              <div className="mb-10 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full border border-indigo-500/20 bg-indigo-500/10">
                  <ShieldCheck className="w-3 h-3 text-indigo-400" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Secure Login</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tight">Welcome <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#007AFF] to-[#AF52DE] italic">back.</span></h2>
                <p className="text-white/40 text-sm font-medium tracking-wide">Sign in to your BIZ PLUS account.</p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-8 p-4 bg-rose-500/5 border border-rose-500/20 rounded-2xl flex items-start gap-4"
                >
                  <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                  <p className="text-[13px] font-semibold text-rose-200">{error}</p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                <div className="space-y-4">
                  <PremiumInput
                    floating
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    icon={<Mail className="w-5 h-5 text-sky-400" />}
                    placeholder="admin@bizplus.io"
                    className="bg-white/[0.01] border-white/10 focus:border-sky-500/40"
                  />

                  <PremiumInput
                    floating
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    icon={<Lock className="w-5 h-5 text-indigo-400" />}
                    placeholder="••••••••"
                    className="bg-white/[0.01] border-white/10 focus:border-indigo-500/40"
                  />
                </div>

                <motion.div variants={itemVariants} className="pt-2">
                  <PremiumButton
                    type="submit"
                    size="lg"
                    loading={loading}
                    className="w-full h-14 bg-white text-black font-black uppercase tracking-widest text-[11px] hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] transition-all relative overflow-hidden group shadow-[0_20px_50px_-10px_rgba(255,255,255,0.3)]"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {loading ? 'Signing in...' : 'Sign In Now'}
                      {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </PremiumButton>
                </motion.div>
              </form>

              <div className="py-10 flex items-center gap-4">
                <div className="flex-1 h-px bg-white/5" />
                <span className="text-[10px] text-white/20 tracking-[0.3em] font-black uppercase">Or continue with</span>
                <div className="flex-1 h-px bg-white/5" />
              </div>

              <div className="flex justify-center mb-8">
                <GoogleButton />
              </div>

              <div className="text-center pt-4">
                <p className="text-white/30 text-xs font-bold tracking-wider">
                  NEW HERE?{' '}
                  <Link
                    to="/register"
                    className="text-white hover:text-sky-400 transition-colors font-black border-b border-white/10 pb-0.5"
                  >
                    CREATE AN ACCOUNT
                  </Link>
                </p>
              </div>
            </div>
          </PremiumCard>
        </motion.div>

        {/* Footer Metrics - Apple-style detail */}
        <motion.div variants={itemVariants} className="mt-12 flex justify-center items-center gap-6 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Smart Analytics</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-white/20" />
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">256-bit Encrypted</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PremiumLogin;
