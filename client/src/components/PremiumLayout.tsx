import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import PremiumSidebar from './PremiumSidebar';
import PremiumTopbar from './PremiumTopbar';

interface PremiumLayoutProps {
  children: ReactNode;
}

const PremiumLayout = ({ children }: PremiumLayoutProps) => {
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden text-[var(--text)] transition-colors duration-300">

      {/* Main Navigation Sidebar */}
      <PremiumSidebar />

      {/* Content Container */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10 [--sidebar-width:280px]">
        <PremiumTopbar />

        <main className="flex-1 overflow-auto overflow-x-hidden pt-20 px-8 pb-12 scrollbar-premium">
          <div className="max-w-[1600px] mx-auto min-h-full">
            {children}
          </div>
        </main>
      </div>

      {/* Toast Notification Provider Mount Point */}
      <div id="toast-root" />
    </div>
  );
};

export default PremiumLayout;
