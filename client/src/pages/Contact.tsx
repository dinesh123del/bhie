import { motion } from 'framer-motion';
import { Mail, MessageSquare, Phone, MapPin, Send, ArrowRight } from 'lucide-react';
import MarketingLayout from '../components/marketing/MarketingLayout';
import { PremiumButton, PremiumCard, PremiumInput } from '../components/ui/PremiumComponents';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function Contact() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast.success("Message sent! We'll get back to you soon.");
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1500);
  };

  return (
    <MarketingLayout>
      <section className="px-4 pb-16 pt-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-start">
            {/* Left Side: Info */}
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <span className="section-kicker">Contact Us</span>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="text-5xl md:text-7xl font-black leading-[0.95] tracking-tight text-white"
              >
                Let's Start a <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400 italic">Conversation.</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="max-w-xl text-lg leading-relaxed text-slate-400"
              >
                Have questions about our premium features or need help with your account? Our team is here to support your business growth.
              </motion.p>

              <div className="grid gap-6 sm:grid-cols-2">
                {[
                  { icon: Mail, label: 'Email', value: 'hello@finly.ai', sub: '24/7 Support' },
                  { icon: MessageSquare, label: 'Chat', value: 'WhatsApp Ready', sub: 'Real-time help' },
                  { icon: Phone, label: 'Call', value: '+1 (555) 000-Finly', sub: 'Mon-Fri, 9am-6pm' },
                  { icon: MapPin, label: 'Office', value: 'Silicon Valley', sub: 'California, USA' }
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-start gap-4 p-6 rounded-3xl border border-white/5 bg-white/[0.02]"
                  >
                    <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-400">
                      <item.icon size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">{item.label}</p>
                      <p className="text-sm font-bold text-white">{item.value}</p>
                      <p className="text-xs text-slate-500">{item.sub}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right Side: Form */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <PremiumCard extreme className="p-8 md:p-10 backdrop-blur-3xl bg-white/[0.01] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                   <Send size={120} className="text-sky-500 rotate-12" />
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <PremiumInput
                      label="Full Name"
                      placeholder="Jane Cooper"
                      value={formData.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                    <PremiumInput
                      label="Email Address"
                      type="email"
                      placeholder="jane@company.com"
                      value={formData.email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>
                  <PremiumInput
                    label="Subject"
                    placeholder="How can we help?"
                    value={formData.subject}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, subject: e.target.value})}
                    required
                  />
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Message</label>
                    <textarea
                      className="w-full min-h-[150px] bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-white text-sm focus:outline-none focus:ring-1 focus:ring-sky-500/50 transition-all font-sans"
                      placeholder="Tell us about your needs..."
                      value={formData.message}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({...formData, message: e.target.value})}
                      required
                    />
                  </div>
                  <PremiumButton
                    type="submit"
                    size="lg"
                    loading={loading}
                    className="w-full bg-white text-black hover:bg-white/90 font-bold tracking-widest uppercase text-xs h-14 rounded-2xl"
                    icon={<ArrowRight size={18} />}
                  >
                    Send Message
                  </PremiumButton>
                </form>
              </PremiumCard>
            </motion.div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
