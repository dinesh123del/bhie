import { motion } from 'framer-motion';
import { ArrowRight, Shield, Zap, Brain, BarChart3, DollarSign, CheckCircle, Play, Sparkles } from 'lucide-react';

const Landing = () => {
  const features = [
    {
      icon: Shield,
      title: 'Business Intelligence Hub',
      description: 'Centralize all your business data in one secure dashboard with enterprise-grade protection.',
    },
    {
      icon: Zap,
      title: 'AI-Powered Insights',
      description: 'Get instant recommendations and predictions using cutting-edge AI analysis.',
    },
    {
      icon: BarChart3,
      title: 'Real-time Analytics',
      description: 'Interactive charts and reports that update as your data flows in.',
    },
    {
      icon: DollarSign,
      title: 'Revenue Optimization',
      description: 'Identify profitable patterns and growth opportunities instantly.',
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Connect Data Sources',
      description: 'Link your CRM, accounting, and analytics platforms seamlessly.',
      icon: Play,
    },
    {
      number: '02',
      title: 'AI Analyzes & Predicts',
      description: 'Our AI engines process your data and generate actionable insights.',
      icon: Brain,
    },
    {
      number: '03',
      title: 'Grow Your Business',
      description: 'Implement recommendations and watch your key metrics improve.',
      icon: Sparkles,
    },
  ];

  const pricing = [
    {
      name: 'Starter',
      price: 0,
      period: '/month',
      features: ['5 Records', 'Basic Reports', 'Email Support'],
      mostPopular: false,
    },
    {
      name: 'Pro',
      price: 499,
      period: '/month',
      features: ['Unlimited Records', 'Advanced AI Reports', 'Priority Support', 'Custom Dashboards'],
      mostPopular: true,
    },
    {
      name: 'Enterprise',
      price: '1999+',
      period: '/month',
      features: ['Everything in Pro', 'Dedicated Server', '24/7 Support', 'Custom AI Models'],
      mostPopular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900/20 to-slate-900 text-white overflow-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/8 backdrop-blur-xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Finly
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors font-semibold">Features</a>
            <a href="#pricing" className="text-gray-300 hover:text-white transition-colors font-semibold">Pricing</a>
            <a href="/register" className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 no-underline">
              Get Started Free
            </a>

          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-white leading-tight mb-6">
              Understand Your <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Business.</span>
            </h1>
            <p className="text-2xl text-gray-300 mb-12 max-w-lg leading-relaxed font-medium">
              Improve it with AI-powered insights. From data chaos to business clarity in seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="/register" className="group px-10 py-5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xl rounded-3xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300 flex items-center no-underline">
                Start Free Trial
                <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform" />
              </a>

              <a href="/login" className="px-10 py-5 border-2 border-white/40 bg-white/12 backdrop-blur-xl rounded-3xl font-bold text-xl hover:bg-white/20 transition-all duration-300 no-underline text-white">
                Login
              </a>

            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative">
              <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-white/20">
                <div className="grid grid-cols-2 gap-4">
                  {Array.from({ length: 12 }, (_, i) => (
                    <div key={i} className="h-24 bg-white/10 rounded-2xl border border-white/20 animate-pulse" />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        <div className="absolute -bottom-40 right-0 w-96 h-96 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
      </section>

      {/* Features */}
      <section id="features" className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-24"
          >
            <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto font-medium">
              Built for modern businesses that demand speed, accuracy, and intelligence
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div 
                  key={feature.title}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group p-8 bg-white/8 backdrop-blur-xl rounded-3xl border border-white/20 hover:bg-white/15 transition-all duration-500 hover:-translate-y-4 hover:shadow-2xl"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white">{feature.title}</h3>
                  <p className="text-gray-300 leading-relaxed font-medium">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-32 bg-white/8 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-24"
          >
            <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
              Simple as 1-2-3
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto font-medium">
              No technical setup. No data scientists. Just results.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div 
                  key={step.title}
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center group"
                >
                  <div className="w-24 h-24 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl group-hover:scale-110 transition-all duration-500">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-bold text-indigo-600 text-lg">
                      {step.number}
                    </div>
                  </div>
                  <Icon className="w-16 h-16 mx-auto mb-6 text-indigo-300 group-hover:text-indigo-200 transition-colors" />
                  <h3 className="text-2xl font-bold mb-4 text-white">{step.title}</h3>
                  <p className="text-gray-300 leading-relaxed max-w-md mx-auto font-medium">{step.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-24"
          >
            <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
              Simple Transparent Pricing
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto font-medium">
              No hidden fees. Upgrade anytime. Cancel anytime.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricing.map((plan, index) => (
              <motion.div 
                key={plan.name}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`relative bg-white/8 backdrop-blur-xl rounded-3xl p-10 border-4 border-white/20 shadow-2xl hover:shadow-3xl hover:-translate-y-4 transition-all duration-500 group ${
                  plan.mostPopular ? 'border-indigo-400 bg-gradient-to-b from-indigo-500/15' : ''
                }`}
              >
                {plan.mostPopular && (
                  <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-2 rounded-2xl font-bold text-white shadow-xl">
                    Most Popular
                  </div>
                )}
                <h3 className="text-3xl font-bold mb-6 text-white">{plan.name}</h3>
                <div className="text-5xl font-black mb-2 text-white">
                  ₹{plan.price}
                </div>
                <div className="text-xl text-gray-300 mb-12 font-medium">{plan.period}</div>
                <ul className="space-y-4 mb-12">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center text-gray-200 font-medium">
                      <CheckCircle className="w-6 h-6 text-emerald-400 mr-4 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-6 px-8 font-bold text-xl rounded-2xl shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
                  plan.mostPopular 
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-2xl hover:shadow-3xl' 
                    : 'bg-white/20 border-2 border-white/40 text-white hover:bg-white/30'
                }`}>
                  {plan.mostPopular ? 'Get Started - Most Popular' : 'Get Started'}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 bg-gradient-to-r from-indigo-900/40 to-purple-900/40 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
          >
            <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto font-medium">
              Join 10,000+ businesses already using Finly to unlock hidden growth opportunities.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button className="px-12 py-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-2xl rounded-3xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 transition-all duration-300 w-full sm:w-auto">
                Start Free Trial
                <ArrowRight className="w-6 h-6 ml-3 inline animate-pulse" />
              </button>
              <button className="px-12 py-6 border-2 border-white/50 bg-white/10 text-white font-bold text-2xl rounded-3xl hover:bg-white/20 transition-all duration-300 w-full sm:w-auto">
                Book Demo
              </button>
            </div>
            <div className="mt-16 grid grid-cols-4 gap-8 text-sm text-gray-300 font-medium">
              <div>14 day free trial</div>
              <div>Cancel anytime</div>
              <div>No credit card</div>
              <div>24/7 support</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-16 bg-white/6 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <div className="text-3xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-6">
                Finly
              </div>
              <p className="text-gray-300 mb-8 font-medium">
                AI-powered business intelligence platform for modern companies.
              </p>
            </div>
            <div>
              <h5 className="font-bold text-white mb-6">Product</h5>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#features" className="hover:text-white transition-colors font-medium">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors font-medium">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors font-medium">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors font-medium">Changelog</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-white mb-6">Company</h5>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors font-medium">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors font-medium">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors font-medium">Press</a></li>
                <li><a href="#" className="hover:text-white transition-colors font-medium">Contact</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-white mb-6">Legal</h5>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors font-medium">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors font-medium">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors font-medium">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-16 pt-12 text-center text-gray-300 font-medium">
            <p>&copy; 2024 Finly. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

