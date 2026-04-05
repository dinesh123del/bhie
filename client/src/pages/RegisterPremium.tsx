import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { registerUser } from '../api';
import { PremiumButton, PremiumCard, PremiumInput } from '../components/ui/PremiumComponents';
import { useAuth } from '../hooks/useAuth';
import Logo from '../components/Logo';
import { GoogleButton } from '../components/auth/GoogleButton';
import { toast } from 'react-hot-toast';
import { authService } from '../services/authService';

const PremiumRegister = () => {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setFormData(prev => ({ ...prev, email: decodeURIComponent(emailParam) }));
    }
  }, [searchParams]);
  const [showPassword, setShowPassword] = useState(false);
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
            toast.success('Welcome to BHIE Premium via Google!');
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

    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await registerUser(formData);
      setSuccess(true);
      // Assuming registerUser returns { token, user } as per original logic
      if (response.token && response.user) {
        setTimeout(() => login(response.token, response.user), 1200);
      }
    } catch (err: any) {
      console.error('Registration Technical Error:', err);
      setError(err.message || 'We encountered an issue creating your account. Please try again or contact support.');
    } finally {
      setLoading(false);
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
    <div className="min-h-screen bg-transparent flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
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
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start gap-3"
          >
            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-emerald-200">Welcome to BHIE!</p>
              <p className="text-xs text-emerald-300">Redirecting to dashboard...</p>
            </div>
          </motion.div>
        )}

        {/* Logo & Header */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="lg" to="/" subtitle="Forge Your Advantage" glow />
          </div>
        </motion.div>

        {/* Card */}
        <motion.div variants={itemVariants}>
          <PremiumCard extreme className="p-6 md:p-8 backdrop-blur-3xl bg-white/[0.01] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)]">
            {/* Heading */}
            <div className="mb-6">
              <h2 className="text-2xl md:text-3xl font-black text-white mb-1 tracking-tight">Join BHIE</h2>
              <p className="text-gray-400 text-xs md:text-sm font-medium">Start managing your business records today</p>
            </div>

            {/* Error Alert */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-200">{error}</p>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
              <PremiumInput
                floating
                label="Your Name"
                type="text"
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                icon={<User className="w-5 h-5" />}
                placeholder="John Doe"
              />

              <PremiumInput
                floating
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
                icon={<Mail className="w-5 h-5" />}
                placeholder="you@example.com"
              />

              <PremiumInput
                floating
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, password: e.target.value })}
                icon={<Lock className="w-5 h-5" />}
                placeholder="••••••••"
              />

              {/* Terms */}
              <motion.div variants={itemVariants} className="flex items-start gap-3 pt-2">
                <input
                  type="checkbox"
                  id="terms"
                  className="w-4 h-4 bg-white/10 border border-white/10 rounded accent-sky-500 mt-1 cursor-pointer transition-all focus:ring-sky-500/50"
                  required
                />
                <label htmlFor="terms" className="text-[10px] uppercase font-black tracking-widest text-white/40 leading-relaxed cursor-pointer select-none">
                  Agree to <Link to="/terms" className="text-sky-400 hover:text-sky-300 transition-colors">Terms</Link> &{' '}
                  <Link to="/about" className="text-sky-400 hover:text-sky-300 transition-colors">Privacy Policy</Link>
                </label>
              </motion.div>

              {/* Submit Button */}
              <motion.div variants={itemVariants} className="pt-6">
                <PremiumButton
                  type="submit"
                  size="lg"
                  loading={loading}
                  className="w-full bg-gradient-to-r from-sky-400 to-indigo-500 hover:from-sky-300 hover:to-indigo-400 text-white border-none shadow-[0_20px_40px_-10px_rgba(56,189,248,0.3)]"
                  icon={<ArrowRight className="w-5 h-5" />}
                >
                  {loading ? 'Creating Account...' : 'Create My Account'}
                </PremiumButton>
              </motion.div>
            </form>

            {/* Divider */}
            <motion.div variants={itemVariants} className="py-6 flex items-center gap-4">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-gray-500 px-2">OR CONTINUE WITH</span>
              <div className="flex-1 h-px bg-white/10" />
            </motion.div>

            <motion.div variants={itemVariants} className="flex justify-center mb-6">
              <GoogleButton />
            </motion.div>

            {/* Login Link */}
            <motion.div variants={itemVariants} className="text-center">
              <p className="text-gray-400 text-sm">
                Already have an account?{' '}
                <motion.a
                  whileHover={{ x: 2 }}
                  href="/login"
                  className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                >
                  Sign in
                </motion.a>
              </p>
            </motion.div>
          </PremiumCard>
        </motion.div>

        {/* Benefits */}
        <motion.div
          variants={itemVariants}
          className="mt-8 grid grid-cols-3 gap-4 text-center"
        >
          {[
            { icon: '✨', text: 'Free Trial' },
            { icon: '🔒', text: 'Secure' },
            { icon: '⚡', text: 'Instant' },
          ].map((benefit, idx) => (
            <div key={idx} className="text-xs">
              <p className="text-lg mb-2">{benefit.icon}</p>
              <p className="text-gray-400">{benefit.text}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PremiumRegister;
