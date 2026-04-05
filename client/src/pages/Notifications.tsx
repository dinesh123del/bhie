import React from 'react';
import { motion } from 'framer-motion';
import AlertsPanel from '../components/AlertsPanel';
import { Bell } from 'lucide-react';

const Notifications: React.FC = () => {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-8"
      >
        <div className="p-3 bg-brand-500/10 rounded-2xl ring-1 ring-brand-500/20">
          <Bell className="w-6 h-6 text-brand-500" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-black dark:text-white">
            Notifications Center
          </h1>
          <p className="text-sm font-medium text-black/50 dark:text-white/50">
            Keep track of your system alerts and updates
          </p>
        </div>
      </motion.div>

      <div className="bg-white/5 dark:bg-black/20 rounded-3xl p-6 ring-1 ring-black/5 dark:ring-white/10 backdrop-blur-xl">
        <AlertsPanel />
      </div>
    </div>
  );
};

export default Notifications;
