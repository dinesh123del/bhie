import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  Zap,
  Shield,
  TrendingUp,
  Users,
  CheckCircle,
  Star,
  Play,
} from 'lucide-react';
import { PremiumButton } from '../components/ui/PremiumComponents';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const heroVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
}> = ({ icon, title, description }) => {
  const { ref, controls } = useScrollAnimation();

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={itemVariants}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all duration-300 will-change-transform"
    >
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 will-change-transform"
      >
        {icon}
      </motion.div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-400">{description}</p>
    </motion.div>
  );
};

const PricingCard: React.FC<{
  plan: string;
  price: string;
  description: string;
  features: string[];
  highlighted?: boolean;
}> = ({ plan, price, description, features, highlighted = false }) => {
  const { ref, controls } = useScrollAnimation();

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={itemVariants}
      whileHover={highlighted ? { scale: 1.05 } : { y: -4 }}
      className={`relative rounded-2xl p-8 backdrop-blur-xl transition-all duration-300 will-change-transform ${
        highlighted
          ? 'bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/50 shadow-xl shadow-indigo-500/20'
          : 'bg-white/5 border border-white/10 hover:border-white/20'
      }`}
    >
      {highlighted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-0 left-0 right-0 flex justify-center"
        >
          <span className="px-4 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold rounded-full transform -translate-y-1/2">
            POPULAR
          </span>
        </motion.div>
      )}

      <h3 className="text-2xl font-bold text-white mb-2">{plan}</h3>
      <p className="text-gray-400 text-sm mb-6">{description}</p>

      <div className="mb-8">
        <span className="text-4xl font-bold text-white">${price}</span>
        <span className="text-gray-400 text-sm">/month</span>
      </div>

      <PremiumButton
        variant={highlighted ? 'primary' : 'secondary'}
        size="lg"
        className="w-full mb-8"
      >
        Get Started
        <ArrowRight className="w-4 h-4" />
      </PremiumButton>

      <div className="space-y-4">
        {features.map((feature, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + idx * 0.05 }}
            className="flex items-center gap-3"
          >
            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span className="text-sm text-gray-300">{feature}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

const TestimonialCard: React.FC<{
  name: string;
  role: string;
  text: string;
  avatar: string;
}> = ({ name, role, text, avatar }) => {
  const { ref, controls } = useScrollAnimation();

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={itemVariants}
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 will-change-transform"
    >
      <div className="flex items-center gap-1 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
        ))}
      </div>

      <p className="text-gray-300 mb-6 text-sm">{text}</p>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
          {avatar[0]}
        </div>
        <div>
          <p className="font-semibold text-white text-sm">{name}</p>
          <p className="text-xs text-gray-400">{role}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default function LandingPagePremium() {
  const [_isVideoOpen, setIsVideoOpen] = useState(false);


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-900 overflow-hidden">
      {/* Animated Background */}
      <motion.div
        className="fixed inset-0 z-0 pointer-events-none"
        animate={{
          background: [
            'radial-gradient(600px 200px at 50% 50%, rgba(99, 102, 241, 0.1), transparent)',
            'radial-gradient(600px 200px at 50% 0%, rgba(99, 102, 241, 0.1), transparent)',
          ],
        }}
        transition={{ duration: 20, repeat: Infinity }}
      />

      {/* Hero Section */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-5xl mx-auto text-center">
          {/* Logo */}
          <motion.div
            variants={heroVariants}
            className="mb-8 flex justify-center"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <span className="text-2xl font-bold text-white">B</span>
            </div>
          </motion.div>

          {/* Heading */}
          <motion.h1 variants={heroVariants} className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Transform Your Business with{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              BHIE
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            variants={heroVariants}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto"
          >
            Business Health Intelligence Engine - Real-time analytics, predictions, and insights to drive growth and maximize performance.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={heroVariants}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <PremiumButton
              size="lg"
              icon={<ArrowRight className="w-5 h-5" />}
              onClick={() => window.location.href = '/register'}
            >
              Get Started Free
            </PremiumButton>
            <PremiumButton
              variant="secondary"
              size="lg"
              icon={<Play className="w-5 h-5" />}
              onClick={() => setIsVideoOpen(true)}
            >
              Watch Demo
            </PremiumButton>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={heroVariants}
            transition={{ delay: 0.4 }}
            className="mt-16 grid grid-cols-3 gap-4 sm:gap-8"
          >
            {[
              { label: '5000+', value: 'Active Users' },
              { label: '1M+', value: 'Insights Generated' },
              { label: '99.9%', value: 'Uptime' },
            ].map((stat, idx) => (
              <motion.div key={idx} whileHover={{ y: -4 }}>
                <p className="text-3xl font-bold text-white">{stat.label}</p>
                <p className="text-sm text-gray-400">{stat.value}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, margin: '-100px' }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Powerful Features
            </h2>
            <p className="text-gray-400 text-lg">
              Everything you need to understand and grow your business
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={containerVariants}
            viewport={{ once: true, margin: '-100px' }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <FeatureCard
              icon={<BarChart3 className="w-6 h-6 text-white" />}
              title="Real-time Analytics"
              description="Live dashboards with instant insights into key metrics and performance indicators."
            />
            <FeatureCard
              icon={<TrendingUp className="w-6 h-6 text-white" />}
              title="Predictive Intelligence"
              description="ML-powered predictions to forecast trends and anticipate market changes."
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6 text-white" />}
              title="Lightning Fast"
              description="Optimized performance with sub-second response times for all queries."
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6 text-white" />}
              title="Enterprise Security"
              description="Bank-level encryption and compliance with ISO 27001 and SOC 2 standards."
            />
            <FeatureCard
              icon={<Users className="w-6 h-6 text-white" />}
              title="Team Collaboration"
              description="Work together seamlessly with real-time collaboration and shared insights."
            />
            <FeatureCard
              icon={<ArrowRight className="w-6 h-6 text-white" />}
              title="API Integration"
              description="Comprehensive REST API for seamless integration with your existing tools."
            />
          </motion.div>
        </div>
      </motion.section>

      {/* Product Showcase */}
      <motion.section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, margin: '-100px' }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Beautiful Dashboard
            </h2>
            <p className="text-gray-400 text-lg">
              Intuitive interface designed for productivity and clarity
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: '-100px' }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-1 will-change-transform"
          >
            <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl aspect-video flex items-center justify-center">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsVideoOpen(true)}
                className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/60 transition-all"
              >
                <Play className="w-6 h-6 text-white fill-white" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Pricing Section */}
      <motion.section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, margin: '-100px' }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-gray-400 text-lg">
              Choose the perfect plan for your business
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={containerVariants}
            viewport={{ once: true, margin: '-100px' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
          >
            <PricingCard
              plan="Starter"
              price="29"
              description="Perfect for small teams"
              features={[
                'Up to 10,000 records',
                'Basic analytics',
                'Email support',
                '1 GB storage',
                'API access',
              ]}
            />
            <PricingCard
              plan="Professional"
              price="99"
              description="For growing businesses"
              features={[
                'Unlimited records',
                'Advanced analytics',
                'Predictive Logic',
                'Priority support',
                '100 GB storage',
                'Advanced API',
                'Custom integrations',
              ]}
              highlighted
            />
            <PricingCard
              plan="Enterprise"
              price="Custom"
              description="For large organizations"
              features={[
                'Everything in Pro',
                'Dedicated support',
                'On-premise options',
                'SLA guarantee',
                'Custom features',
                'Team management',
              ]}
            />
          </motion.div>
        </div>
      </motion.section>

      {/* Testimonials */}
      <motion.section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, margin: '-100px' }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Trusted by Industry Leaders
            </h2>
            <p className="text-gray-400 text-lg">
              See what our customers have to say
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={containerVariants}
            viewport={{ once: true, margin: '-100px' }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <TestimonialCard
              name="Sarah Chen"
              role="CEO, TechCorp"
              text="BHIE transformed how we make decisions. The predictive analytics have saved us thousands in costs."
              avatar="S"
            />
            <TestimonialCard
              name="Michael Rodriguez"
              role="CFO, Growth Inc"
              text="Finally, a tool that actually makes sense. The UI is beautiful and the insights are actionable."
              avatar="M"
            />
            <TestimonialCard
              name="Emily Watson"
              role="Founder, Analytics Pro"
              text="Integrated BHIE in hours. The support team is responsive, and the AI predictions are spot-on."
              avatar="E"
            />
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, margin: '-100px' }}
          className="max-w-3xl mx-auto text-center bg-gradient-to-r from-indigo-500/10 to-purple-600/10 border border-indigo-500/20 rounded-3xl p-12"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Ready to Transform Your Business?
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Join thousands of companies using BHIE to make smarter decisions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <PremiumButton
              size="lg"
              icon={<ArrowRight className="w-5 h-5" />}
              onClick={() => window.location.href = '/register'}
            >
              Start Free Trial
            </PremiumButton>
            <PremiumButton
              variant="secondary"
              size="lg"
              onClick={() => window.location.href = '/login'}
            >
              Sign In
            </PremiumButton>
          </div>
        </motion.div>
      </motion.section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="relative z-10 border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Social</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Twitter</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">LinkedIn</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">GitHub</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between items-center text-gray-400 text-sm">
            <p>&copy; 2026 BHIE. All rights reserved.</p>
            <p>Made with ❤️ by the BHIE team</p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
