import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight, TrendingUp, Building2, User } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  quote: string;
  metric: {
    value: string;
    label: string;
  };
  rating: number;
  industry: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Rahul Mehta',
    role: 'Founder',
    company: 'TechStart India',
    avatar: '👨‍💼',
    quote: 'BIZ PLUS transformed how we track expenses. What used to take 3 hours now takes 10 minutes. The receipt scanning is magic.',
    metric: { value: '15hrs', label: 'Saved weekly' },
    rating: 5,
    industry: 'Technology',
  },
  {
    id: '2',
    name: 'Priya Kumar',
    role: 'CEO',
    company: 'Design Studio',
    avatar: '👩‍💼',
    quote: 'Finally found a finance tool that understands small business needs. The visual reports helped me identify cost savings immediately.',
    metric: { value: '₹2.4L', label: 'Costs cut' },
    rating: 5,
    industry: 'Design',
  },
  {
    id: '3',
    name: 'Amit Shah',
    role: 'Owner',
    company: 'Mumbai Retail',
    avatar: '👨‍💻',
    quote: 'We process 200+ receipts daily. BIZ PLUS handles them all automatically. My accountant loves the export feature.',
    metric: { value: '200+', label: 'Receipts/day' },
    rating: 5,
    industry: 'Retail',
  },
  {
    id: '4',
    name: 'Sneha Patel',
    role: 'Director',
    company: 'Green Foods',
    avatar: '👩‍🍳',
    quote: 'The WhatsApp daily summary is brilliant. I get my business numbers every morning without opening an app.',
    metric: { value: '98%', label: 'Accuracy' },
    rating: 5,
    industry: 'Food',
  },
  {
    id: '5',
    name: 'Vikram Rao',
    role: 'Partner',
    company: 'Consulting Co',
    avatar: '👨‍💼',
    quote: 'Best investment for my freelance business. Tax season used to stress me out. Now I have everything organized year-round.',
    metric: { value: '3x', label: 'ROI in 6 months' },
    rating: 5,
    industry: 'Consulting',
  },
  {
    id: '6',
    name: 'Anita Desai',
    role: 'Manager',
    company: 'Wellness Center',
    avatar: '💆‍♀️',
    quote: 'BIZ PLUS gamification keeps my team engaged. Everyone competes to maintain daily streaks. Expense tracking became fun!',
    metric: { value: '45', label: 'Day streak' },
    rating: 5,
    industry: 'Wellness',
  },
];

const INDUSTRIES = ['All', 'Technology', 'Retail', 'Food', 'Design', 'Consulting', 'Wellness'];

export default function TestimonialsWall() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedIndustry, setSelectedIndustry] = useState('All');

  const filtered = selectedIndustry === 'All' 
    ? TESTIMONIALS 
    : TESTIMONIALS.filter(t => t.industry === selectedIndustry);

  const next = () => setActiveIndex((prev) => (prev + 1) % filtered.length);
  const prev = () => setActiveIndex((prev) => (prev - 1 + filtered.length) % filtered.length);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="section-kicker mb-4 inline-block">Success Stories</span>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            Loved by 10,000+ Businesses
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            See how entrepreneurs across India are transforming their finances with BIZ PLUS
          </p>
        </motion.div>
      </div>

      {/* Industry Filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {INDUSTRIES.map((industry) => (
          <button
            key={industry}
            onClick={() => {
              setSelectedIndustry(industry);
              setActiveIndex(0);
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedIndustry === industry
                ? 'bg-white text-black'
                : 'bg-white/5 text-white/50 hover:bg-white/10'
            }`}
          >
            {industry}
          </button>
        ))}
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-4xl mx-auto">
        {[
          { value: '10,000+', label: 'Active Users' },
          { value: '2M+', label: 'Receipts Scanned' },
          { value: '₹500Cr+', label: 'Tracked Value' },
          { value: '4.9/5', label: 'App Store Rating' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="text-center p-4 bg-white/5 rounded-2xl border border-white/10"
          >
            <p className="text-2xl md:text-3xl font-black text-white">{stat.value}</p>
            <p className="text-xs text-white/50">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Testimonial Carousel */}
      <div className="relative max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={filtered[activeIndex]?.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="bg-gradient-to-br from-white/10 to-white/5 rounded-3xl p-8 md:p-12 border border-white/10"
          >
            {/* Quote Icon */}
            <Quote className="w-12 h-12 text-blue-500/30 mb-6" />

            {/* Stars */}
            <div className="flex gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < filtered[activeIndex].rating
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-white/20'
                  }`}
                />
              ))}
            </div>

            {/* Quote */}
            <p className="text-xl md:text-2xl text-white leading-relaxed mb-8">
              "{filtered[activeIndex].quote}"
            </p>

            {/* Author */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-4xl">{filtered[activeIndex].avatar}</span>
                <div>
                  <p className="text-white font-bold">{filtered[activeIndex].name}</p>
                  <p className="text-white/50 text-sm">
                    {filtered[activeIndex].role}, {filtered[activeIndex].company}
                  </p>
                </div>
              </div>

              {/* Metric Badge */}
              <div className="text-right">
                <p className="text-2xl font-black text-green-400">
                  {filtered[activeIndex].metric.value}
                </p>
                <p className="text-xs text-white/50">{filtered[activeIndex].metric.label}</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={prev}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          
          <div className="flex gap-2">
            {filtered.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === activeIndex ? 'bg-white w-6' : 'bg-white/30'
                }`}
              />
            ))}
          </div>

          <button
            onClick={next}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* Grid of Mini Testimonials */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-12 max-w-5xl mx-auto">
        {TESTIMONIALS.slice(0, 6).map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{t.avatar}</span>
              <div>
                <p className="text-white font-bold text-sm">{t.name}</p>
                <p className="text-white/50 text-xs">{t.company}</p>
              </div>
            </div>
            <p className="text-white/70 text-sm line-clamp-3">"{t.quote}"</p>
            <div className="flex items-center gap-2 mt-4">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-sm font-bold">{t.metric.value}</span>
              <span className="text-white/40 text-xs">{t.metric.label}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Trust Logos */}
      <div className="mt-16 text-center">
        <p className="text-white/30 text-sm mb-6">Trusted by businesses across India</p>
        <div className="flex flex-wrap justify-center items-center gap-8 opacity-50">
          {['🏢', '🏪', '🍽️', '🏭', '📱', '🎨'].map((emoji, i) => (
            <span key={i} className="text-3xl grayscale hover:grayscale-0 transition-all cursor-pointer">
              {emoji}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
