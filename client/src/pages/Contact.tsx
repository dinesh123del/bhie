import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, Send } from 'lucide-react';
import MarketingLayout from '../components/marketing/MarketingLayout';

const contactDetails = [
  { icon: Mail, title: 'Email', value: 'hello@bhie.ai' },
  { icon: Phone, title: 'Phone', value: '+91 80 4567 2200' },
  { icon: MapPin, title: 'Office', value: 'Bengaluru, India' },
];

export default function Contact() {
  return (
    <MarketingLayout>
      <section className="px-4 pb-20 pt-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <motion.span
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="section-kicker"
            >
              Contact
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.04 }}
              className="max-w-xl text-5xl font-black leading-[0.95] text-white sm:text-6xl"
            >
              Bring BHIE into your company stack.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.08 }}
              className="max-w-lg text-lg leading-8 text-slate-300"
            >
              Connect with our team for implementation planning, custom pricing, and a guided product walkthrough.
            </motion.p>

            <div className="space-y-4 pt-4">
              {contactDetails.map(({ icon: Icon, title, value }, index) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, x: -18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, delay: 0.14 + index * 0.06 }}
                  className="brand-panel flex items-center gap-4 rounded-[26px] px-5 py-4"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                    <Icon className="h-5 w-5 text-cyan-200" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">{title}</div>
                    <div className="mt-1 text-sm text-white">{value}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="brand-panel rounded-[36px] p-7 sm:p-8"
          >
            <form className="grid gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="grid gap-2 text-sm text-slate-300">
                  Name
                  <input
                    type="text"
                    placeholder="Your name"
                    className="brand-input"
                  />
                </label>
                <label className="grid gap-2 text-sm text-slate-300">
                  Company
                  <input
                    type="text"
                    placeholder="Company name"
                    className="brand-input"
                  />
                </label>
              </div>

              <label className="grid gap-2 text-sm text-slate-300">
                Work email
                <input
                  type="email"
                  placeholder="name@company.com"
                  className="brand-input"
                />
              </label>

              <label className="grid gap-2 text-sm text-slate-300">
                What are you solving?
                <textarea
                  rows={6}
                  placeholder="Tell us about your workflows, team size, and what you want BHIE to unlock."
                  className="brand-input resize-none"
                />
              </label>

              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-slate-950 transition hover:scale-[1.01]"
              >
                Send inquiry
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        </div>
      </section>
    </MarketingLayout>
  );
}
