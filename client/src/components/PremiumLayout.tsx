import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import PremiumSidebar from './PremiumSidebar';
import PremiumTopbar from './PremiumTopbar';
import BottomNav from './BottomNav';

interface PremiumLayoutProps {
  children: ReactNode;
}

const PremiumLayout = ({ children }: PremiumLayoutProps) => {
  const location = useLocation();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#050505] text-[#F8FAFC]">
      
      {/* Main Navigation Sidebar: Anchored relative to screen (Hidden on Desktop-first, but we'll manage hidden-sm in CSS/Framermotion) */}
      <div className="hidden md:flex">
        <PremiumSidebar />
      </div>

      {/* Content Engine: Takes remaining space and defines the scroll context */}
      <div className="flex-1 flex flex-col min-w-0 relative h-full">
        <PremiumTopbar />

        <main id="main-scroll-container" className="flex-1 overflow-auto overflow-x-hidden pt-12 md:pt-20 px-4 md:px-8 pb-32 md:pb-12 scrollbar-premium relative z-0">
          <div className="max-w-[1600px] mx-auto w-full min-h-full py-4">
            {children}
          </div>
        </main>
        
        {/* Mobile Navigation */}
        <BottomNav />
      </div>

      {/* Toast Notification Provider Mount Point */}
      <div id="toast-root" />
    </div>
  );
};

export default PremiumLayout;
