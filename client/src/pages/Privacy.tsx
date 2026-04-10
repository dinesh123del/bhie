import { motion } from 'framer-motion';
import { Shield, Eye, Lock, Database, UserCheck, Bell } from 'lucide-react';
import MarketingLayout from '../components/marketing/MarketingLayout';

const sections = [
  {
    icon: Shield,
    title: '1. Data Collection',
    content: 'We collect only the information necessary to provide our services. This includes your name, email address, and the business records you upload. We use advanced OCR and AI technology to process your receipts, but we do not use your personal business data for any other purpose.',
  },
  {
    icon: Eye,
    title: '2. Transparency',
    content: 'We are transparent about how your data is used. Your data is your own. We do not sell or rent your personal or business information to third parties. Our business model is based on subscriptions, not data mining.',
  },
  {
    icon: Lock,
    title: '3. Data Security',
    content: 'We use industry-standard encryption (AES-256) to protect your data at rest and TLS for data in transit. Our servers are hosted in secure, ISO-certified data centers with 24/7 monitoring.',
  },
  {
    icon: Database,
    title: '4. Data Retention',
    content: 'We keep your data as long as your account is active. If you choose to delete your account, all your records and personal information are permanently wiped from our production servers within 30 days.',
  },
  {
    icon: UserCheck,
    title: '5. Your Rights',
    content: 'You have the right to access, export, or delete your data at any time. You can also request a copy of all the information we have stored about your account.',
  },
  {
    icon: Bell,
    title: '6. Privacy Updates',
    content: 'We may update this policy periodically to reflect changes in our practices. We will notify you of any significant changes via email or through a notification on our platform.',
  },
];

export default function Privacy() {
  return (
    <MarketingLayout>
      <section className="px-4 pb-16 pt-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="section-kicker">Privacy First</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05 }}
              className="max-w-3xl text-5xl font-black leading-[0.95] text-white sm:text-6xl"
            >
              Your Privacy is Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400 italic">Priority.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="max-w-xl text-lg leading-8 text-[#C0C0C0]"
            >
              Learn how we protect your business data and respect your choice in every step of the journey.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.12 }}
            className="group relative overflow-hidden rounded-[36px] border border-white/10 bg-white/5 p-2 shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="aspect-square h-full w-full rounded-[30px] bg-[#0A0A0A]/80 border border-white/5 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.1)_0%,transparent_70%)]" />
                <Shield size={120} className="text-sky-500 opacity-80" />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-2">
            {sections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="brand-panel relative flex flex-col gap-6 rounded-[32px] p-8 transition-all hover:bg-white/[0.06]"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-300 ring-1 ring-indigo-500/20">
                  <section.icon size={28} />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-white">{section.title}</h3>
                  <p className="text-sm leading-7 text-[#C0C0C0]">{section.content}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="mt-20 rounded-[40px] border border-white/10 bg-[#0A0A0A]/80 border border-white/5/40 p-8 text-center backdrop-blur-md sm:p-12"
          >
            <p className="text-sm text-slate-500">
              Last updated: April 5, 2026. Your trust is our most valuable asset.
            </p>
          </motion.div>
        </div>
      </section>
    </MarketingLayout>
  );
}
