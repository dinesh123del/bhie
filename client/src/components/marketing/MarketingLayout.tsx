import { ReactNode } from 'react';
import MarketingFooter from './MarketingFooter';
import MarketingNavbar from './MarketingNavbar';

interface MarketingLayoutProps {
  children: ReactNode;
}

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="brand-page relative min-h-screen overflow-hidden">
      <div className="brand-ambient brand-ambient-cyan" />
      <div className="brand-ambient brand-ambient-amber" />
      <div className="brand-grid" />
      <MarketingNavbar />
      <main>{children}</main>
      <MarketingFooter />
    </div>
  );
}
