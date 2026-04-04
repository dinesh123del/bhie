import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="flex h-screen bg-slate-950 text-slate-100">
      <Sidebar />
      
      {/* Main Content */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="flex-1 overflow-auto bg-gradient-to-br from-slate-950 to-slate-900"
      >
        <div className="min-h-screen p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </motion.main>
    </div>
  );
};

export default MainLayout;
