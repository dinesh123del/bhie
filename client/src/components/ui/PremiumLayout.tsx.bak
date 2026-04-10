import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import Sidebar from '../Layout/Sidebar';
import Header from '../Layout/Header';

interface PremiumLayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
}

const PremiumLayout: React.FC<PremiumLayoutProps> = ({ children, showSidebar = true }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-900/50 dark:to-gray-900 text-gray-900 dark:text-white">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      {showSidebar && (
        <>
          <motion.aside
            initial={false}
            animate={{ x: sidebarOpen ? 0 : -280 }}
            className="fixed left-0 top-0 h-full w-80 z-50 transform lg:translate-x-0 lg:static lg:w-64 bg-gradient-to-b from-indigo-900 via-purple-900 to-slate-900 backdrop-blur-xl shadow-2xl border-r border-indigo-500/30"
          >
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </motion.aside>
          
          {/* Mobile Sidebar Toggle */}
          <button
            className="fixed top-4 left-4 z-50 p-2 rounded-xl bg-white/20 backdrop-blur-xl border border-white/30 hover:bg-white/30 lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </>
      )}

      {/* Main Content */}
      <div className={`min-h-screen ${showSidebar ? 'lg:ml-64' : ''}`}>
        <Header />
        <main className="p-6 lg:p-10 space-y-8">
          <AnimatePresence mode="wait">
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default PremiumLayout;

