import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import PremiumSidebar from './PremiumSidebar';
import PremiumTopbar from './PremiumTopbar';

interface PremiumLayoutProps {
  children: ReactNode;
}

const PremiumLayout = ({ children }: PremiumLayoutProps) => {
  const location = useLocation();

  // Netflix-style page animations
  const menuVariants = {
    initial: { opacity: 0, x: 20, filter: 'blur(10px)' },
    animate: { opacity: 1, x: 0, filter: 'blur(0px)' },
    exit: { opacity: 0, x: -20, filter: 'blur(10px)' }
  };

  const menuTransition = {
    type: 'spring',
    stiffness: 260,
    damping: 20,
    duration: 0.4
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0A0B10] text-slate-100 selection:bg-blue-500/30 selection:text-white">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px] animate-pulse" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-purple-600/5 blur-[120px] animate-pulse" />
      </div>

      {/* Main Navigation Sidebar */}
      <PremiumSidebar />

      {/* Content Container */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <PremiumTopbar />

        <main className="flex-1 overflow-auto overflow-x-hidden pt-20 px-8 pb-12 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial="initial"
              animate="animate"
              exit="exit"
              variants={menuVariants}
              transition={menuTransition}
              className="w-full h-full willow"
            >
              <div className="max-w-[1600px] mx-auto min-h-full">
                {children}
              </div>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Toast Notification Provider Mount Point */}
      <div id="toast-root" />
    </div>
  );
};

export default PremiumLayout;
