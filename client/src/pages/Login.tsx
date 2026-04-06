import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { authService } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';
import { GoogleButton } from '../components/auth/GoogleButton';
import { premiumFeedback } from '../utils/premiumFeedback';
import { Logo } from '../components/Logo';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
            toast.success('Logged in with Google successfully!');
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
      premiumFeedback.error();
      return;
    }

    setLoading(true);
    setError('');
    premiumFeedback.click();

    try {
      const response = await authService.login({ email, password });

      if (!response?.token || !response?.user) {
        setError('Invalid server response');
        return;
      }

      login(response.token, response.user);
      premiumFeedback.success();
    } catch (error: any) {
      premiumFeedback.error();
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

  const springTransition = { duration: 0.6, ease: [0.2, 0.8, 0.2, 1] };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#000000] relative overflow-hidden font-sans text-white">
      {/* Background Intelligence Glow */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full filter blur-[150px] opacity-20 pointer-events-none"
        style={{
          background: 'conic-gradient(from 180deg at 50% 50%, #007AFF 0deg, #AF52DE 180deg, #FF2D55 360deg)'
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      />

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={springTransition}
        className="relative z-10 w-full max-w-[420px] p-8 md:p-10"
      >
        <div className="absolute inset-0 bg-[#1C1C1E]/60 backdrop-blur-3xl border border-white/10 rounded-[32px] shadow-2xl" />

        <div className="relative z-10 flex flex-col items-center">
          {/* Logo */}
          <div className="mb-8">
            <Logo size="md" showSubtitle={false} />
          </div>

          <div className="w-full text-center mb-8">
            <h2 className="text-[28px] font-bold tracking-tight text-white mb-2">Sign in to Finly.</h2>
            <p className="text-[15px] font-medium text-[#A1A1A6]">Intelligent accounting awaits.</p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full mb-6 p-4 bg-[#FF3B30]/10 border border-[#FF3B30]/20 text-[#FF3B30] rounded-xl text-center text-sm font-medium"
            >
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form className="space-y-5 w-full" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 bg-black/50 border border-white/10 rounded-xl text-[15px] text-white placeholder:text-[#636366] focus:outline-none focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] transition-all"
                placeholder="Email Address"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 pr-12 bg-black/50 border border-white/10 rounded-xl text-[15px] text-white placeholder-[#636366] focus:outline-none focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] transition-all"
                placeholder="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#636366] hover:text-white transition-colors"
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

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-white text-black hover:bg-white/90 font-semibold rounded-xl text-[15px] shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="inline-block"
                >
                  ⟳
                </motion.span>
              ) : (
                'Sign In'
              )}
            </motion.button>
          </form>

          {/* Forgot Password Link */}
          <div className="mt-6 w-full text-center">
            <button
              type="button"
              onClick={() => {
                navigate('/forgot-password');
                premiumFeedback.click();
              }}
              className="text-[13px] text-[#007AFF] hover:text-white font-medium transition-colors"
            >
              Forgotten your password?
            </button>
          </div>

          {/* Divider */}
          <div className="my-8 flex items-center gap-3 w-full">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[11px] text-[#636366] font-bold uppercase tracking-widest">Or login with</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* External Logins */}
          <div className="w-full space-y-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                navigate('/otp-login');
                premiumFeedback.click();
              }}
              className="w-full py-3 px-4 bg-black/50 border border-white/10 hover:border-white/30 text-white font-semibold text-[15px] rounded-xl transition-all duration-300"
            >
              Use Phone OTP
            </motion.button>

            <div className="w-full flex justify-center">
              <GoogleButton />
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-[13px] text-[#A1A1A6]">
            Don't have an account?{' '}
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => {
                navigate('/register');
                premiumFeedback.click();
              }}
              className="text-[#007AFF] hover:text-white font-semibold transition-colors"
            >
              Create one now
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
