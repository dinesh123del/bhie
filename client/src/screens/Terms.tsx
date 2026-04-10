"use client"
import { motion } from 'framer-motion';
import { Shield, Lock, FileText, Scale } from 'lucide-react';
import MarketingLayout from '../components/marketing/MarketingLayout';

const sections = [
  {
    icon: Shield,
    title: '1. Acceptance of Terms',
    content: 'By accessing or using the BIZ PLUS platform, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, you are prohibited from using our services. We reserve the right to modify these terms at any time, and such modifications will be effective immediately upon posting on this page.',
  },
  {
    icon: Lock,
    title: '2. User Responsibilities',
    content: 'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account or any other breach of security. BIZ PLUS will not be liable for any loss or damage arising from your failure to comply with this security obligation.',
  },
  {
    icon: FileText,
    title: '3. Intellectual Property Rights',
    content: 'All content, features, and parts of the BIZ PLUS platform, including our smart design and analysis tools, are owned by us. You have the right to use the service for your own business needs.',
  },
  {
    icon: Scale,
    title: '4. Limitation of Liability',
    content: 'BIZ PLUS provides its services on an "as is" and "as available" basis. To the maximum extent permitted by law, BIZ PLUS shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses.',
  },
  {
    icon: Shield,
    title: '5. Subscription and Payments',
    content: 'Subscribers agree to pay all fees associated with their selected plan. All payments are non-refundable unless otherwise specified. We reserve the right to change our subscription fees at any time, with at least 30 days notice to current subscribers.',
  },
  {
    icon: Lock,
    title: '6. Termination',
    content: 'We may terminate or suspend your access to BIZ PLUS immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease.',
  },
];

export default function Terms() {
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
              <span className="section-kicker">Our Terms</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05 }}
              className="max-w-3xl text-5xl font-black leading-[0.95] text-white sm:text-6xl"
            >
              Simple & Clear Terms.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="max-w-xl text-lg leading-8 text-[#C0C0C0]"
            >
              We keep things simple and secure, so you can focus on growing your business.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.12 }}
            className="group relative overflow-hidden rounded-[36px] border border-white/10 bg-white/5 p-2 shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <img
              src="/terms_hero_image_1775387746650.png"
              alt="Terms hero"
              className="aspect-square h-full w-full rounded-[30px] object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 rounded-[30px] shadow-[inset_0_0_80px_rgba(0,0,0,0.5)]" />
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
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-500/20">
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
            <p className="text-sm text-[#C0C0C0]">
              Last updated: April 5, 2026. If you have any questions, please email us at
              <span className="ml-2 font-semibold text-cyan-300 hover:underline">hello@bizplus.io</span>
            </p>
          </motion.div>
        </div>
      </section>
    </MarketingLayout>
  );
}
