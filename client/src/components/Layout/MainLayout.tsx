import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  LogOut,
  Menu,
  Moon,
  Search,
  Sun,
  TrendingUp,
} from 'lucide-react';
import { HiChevronDoubleLeft, HiChevronDoubleRight, HiSparkles } from 'react-icons/hi';
import { useTheme } from '../../contexts/ThemeContext';
import Logo from '../Logo';
import { premiumFeedback } from '../../utils/premiumFeedback';
import {
  RealityEngine,
  ThermalEngine,
  SecurityEngine,
  MagneticWrapper,
  Scanlines,
  MouseGlow
} from '../ui/MicroEngines';
import AdminAnnouncement from '../ui/AdminAnnouncement';

interface SidebarItem {
  icon: React.ReactNode;
  label: string;
  href: string;
}

interface NavbarProps {
  collapsed: boolean;
  onCollapseToggle: () => void;
  onMobileToggle: () => void;
  onLogout: () => void;
  userName?: string;
}

interface SidebarProps {
  items: SidebarItem[];
  active: string;
  collapsed: boolean;
  mobileOpen: boolean;
  onNavigate: (href: string) => void;
  onCollapseToggle: () => void;
  onMobileClose: () => void;
}

const ThemeToggleButton = () => {
  const { toggleTheme, resolvedTheme } = useTheme();

  return (
    <MagneticWrapper strength={0.4}>
      <motion.button
        aria-label="Toggle theme"
        onClick={() => {
          toggleTheme();
          premiumFeedback.click();
        }}
        whileHover={{ scale: 1.01, rotate: 2 }}
        whileTap={{ scale: 0.96 }}
        onMouseEnter={() => premiumFeedback.haptic(5)}
        className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-ink-100 transition-all duration-300 ease-premium hover:bg-white/[0.08]"
      >
        {resolvedTheme === 'dark' ? <Sun className="h-5 w-5 text-amber-300" /> : <Moon className="h-5 w-5 text-ink-200" />}
      </motion.button>
    </MagneticWrapper>
  );
};

export const Navbar: React.FC<NavbarProps> = ({
  collapsed,
  onCollapseToggle,
  onMobileToggle,
  onLogout,
  userName = 'Admin',
}) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const profileInitials = userName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <motion.header
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed right-0 top-0 z-40 h-20 border-b border-white/5 bg-white/[0.02] backdrop-blur-2xl ${collapsed ? 'lg:left-[6.5rem]' : 'lg:left-[18rem]'} left-0`}
    >
      <div className="flex h-full items-center justify-between gap-4 px-4 md:px-6">
        <div className="flex items-center gap-3">
          <motion.button
            aria-label="Open sidebar"
            onClick={() => {
              onMobileToggle();
              premiumFeedback.click();
            }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.96 }}
            onMouseEnter={() => premiumFeedback.haptic(5)}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-white transition-all duration-300 ease-premium hover:bg-white/[0.08] lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </motion.button>

          <motion.button
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={() => {
              onCollapseToggle();
              premiumFeedback.click();
            }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.96 }}
            onMouseEnter={() => premiumFeedback.haptic(5)}
            className="hidden h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-white transition-all duration-300 ease-premium hover:bg-white/[0.08] lg:flex"
          >
            {collapsed ? <HiChevronDoubleRight className="text-lg" /> : <HiChevronDoubleLeft className="text-lg" />}
          </motion.button>

          <div className="hidden lg:flex items-center gap-6">
            <Logo size="sm" to="/dashboard" showSubtitle={false} className="bg-transparent px-0 py-0 shadow-none border-transparent" />
            <RealityEngine />
            <SecurityEngine />
          </div>
        </div>

        <div className="hidden min-w-[320px] max-w-xl flex-1 items-center lg:flex">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                premiumFeedback.click();
                // Simple search redirect to records
                window.location.href = `/records?q=${encodeURIComponent(searchQuery)}`;
              }
            }}
            className="glass-panel flex h-12 w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-0 shadow-none"
          >
            <Search className="h-4 w-4 text-ink-300" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search data, scans, analytics..."
              className="w-full bg-transparent text-sm text-white placeholder:text-ink-400 focus:outline-none"
            />
            <span className="rounded-xl border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-300">
              Enter
            </span>
          </form>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <div className="hidden items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-2 md:flex">
            <HiSparkles className="text-sky-300" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] secondary-text">
              Business tools
            </span>
          </div>

          <ThemeToggleButton />

          <div className="relative">
            <MagneticWrapper strength={0.3}>
              <motion.button
                onClick={() => {
                  setNotificationsOpen((current) => !current);
                  setProfileOpen(false);
                  premiumFeedback.click();
                }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.96 }}
                onMouseEnter={() => premiumFeedback.haptic(5)}
                className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-white transition-all duration-300 ease-premium hover:bg-white/[0.08]"
                aria-label="Show notifications"
              >
                <Bell className="h-5 w-5 text-ink-100" />
                <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-sky-300 shadow-brand-glow" />
              </motion.button>
            </MagneticWrapper>

            <AnimatePresence>
              {notificationsOpen ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-14 z-50 w-80 rounded-3xl border border-white/10 bg-[#111]/90 p-4 shadow-2xl backdrop-blur-3xl"
                  onMouseLeave={() => setNotificationsOpen(false)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-white">Notifications</p>
                    <span className="text-xs text-sky-400 bg-sky-400/10 px-2 py-1 rounded-md font-black uppercase tracking-widest">2 New</span>
                  </div>
                  <div className="space-y-2 mt-4">
                    <div className="flex gap-3 items-center p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all cursor-pointer">
                      <TrendingUp className="w-5 h-5 text-emerald-400" />
                      <div>
                        <p className="text-sm font-semibold text-white">Profit increased</p>
                        <p className="text-xs text-emerald-100/60 mt-0.5">You're up 8% this week! 🔥</p>
                      </div>
                    </div>
                    <div className="flex gap-3 items-center p-3 rounded-2xl bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/20 transition-all cursor-pointer">
                      <span role="img" aria-label="warning" className="text-lg">📉</span>
                      <div>
                        <p className="text-sm font-semibold text-white">Expense warning</p>
                        <p className="text-xs text-orange-200/60 mt-0.5">Software costs rose by 12%.</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <div className="relative">
            <MagneticWrapper strength={0.3}>
              <motion.button
                onClick={() => {
                  setProfileOpen((current) => !current);
                  setNotificationsOpen(false);
                }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.96 }}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-white transition-all duration-300 ease-premium hover:bg-white/[0.08]"
                aria-label="Open profile menu"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-300 to-indigo-500 text-sm font-semibold text-slate-950">
                  {profileInitials}
                </span>
              </motion.button>
            </MagneticWrapper>

            <AnimatePresence>
              {profileOpen ? (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-14 z-50 w-56 rounded-3xl border border-white/10 bg-white/[0.03] p-4 shadow-2xl backdrop-blur-3xl"
                  onMouseLeave={() => setProfileOpen(false)}
                >
                  <p className="text-sm font-semibold text-white">{userName}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.22em] text-ink-400">Account</p>
                  <div className="mt-4 space-y-2">
                    <button
                      onClick={onLogout}
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-left text-sm text-ink-100 transition-all duration-200 hover:bg-white/[0.08]"
                    >
                      Log out
                    </button>
                    <button
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-left text-sm text-ink-100 transition-all duration-200 hover:bg-white/[0.08]"
                    >
                      Account settings
                    </button>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({
  items,
  active,
  collapsed,
  mobileOpen,
  onNavigate,
  onCollapseToggle,
  onMobileClose,
}) => {
  const widthClass = collapsed ? 'w-[6.5rem]' : 'w-[18rem]';

  return (
    <>
      <AnimatePresence>
        {mobileOpen ? (
          <motion.button
            type="button"
            aria-label="Close sidebar overlay"
            onClick={onMobileClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          />
        ) : null}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{
          x: mobileOpen ? 0 : -340,
          width: collapsed ? 104 : 288,
        }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed left-0 top-0 z-50 flex h-screen flex-col ${widthClass} border-r border-white/5 bg-white/[0.02] backdrop-blur-3xl shadow-[0_0_100px_rgba(0,0,0,0.5)] lg:translate-x-0 ${mobileOpen ? 'rounded-r-[3rem]' : ''}`}
        style={{ transformOrigin: 'left center' }}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
          <Logo
            size={collapsed ? 'sm' : 'md'}
            to="/dashboard"
            showSubtitle={!collapsed}
            subtitle="Business Intelligence"
            className={collapsed ? 'bg-transparent px-0 py-0 shadow-none border-transparent' : 'bg-transparent px-0 py-0 shadow-none border-transparent'}
          />

          <motion.button
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={onCollapseToggle}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.96 }}
            className="hidden h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white transition-all duration-300 ease-premium hover:bg-white/[0.08] lg:flex"
          >
            {collapsed ? <HiChevronDoubleRight className="text-lg" /> : <HiChevronDoubleLeft className="text-lg" />}
          </motion.button>
        </div>

        <div className="px-4 pb-2 pt-4">
          <div className={`glass-panel relative overflow-hidden flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 shadow-none ${collapsed ? 'justify-center' : ''}`}>
            <Scanlines />
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-gradient text-slate-950 shadow-brand-glow">
              <HiSparkles />
            </span>
            {!collapsed ? (
              <div>
                <p className="text-sm font-semibold text-white">Focused workspace</p>
                <p className="text-xs uppercase tracking-[0.18em] text-ink-400">Main menu</p>
              </div>
            ) : null}
          </div>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
          {items.map((item, index) => {
            const selected = active === item.href;

            return (
              <motion.button
                key={item.href}
                initial={{ opacity: 0, x: -18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.06 + index * 0.04, duration: 0.4 }}
                onClick={() => {
                  onNavigate(item.href);
                  onMobileClose();
                  premiumFeedback.click();
                }}
                onMouseEnter={() => premiumFeedback.haptic(5)}
                className={`group relative flex w-full items-center rounded-2xl border px-4 py-3 text-left transition-all duration-300 ease-premium ${selected
                    ? 'border-sky-300/18 bg-white/[0.07] text-white shadow-brand-glow'
                    : 'border-transparent text-ink-300 hover:border-white/10 hover:bg-white/[0.05] hover:text-white'
                  } ${collapsed ? 'justify-center' : 'gap-3'}`}
              >
                {selected ? (
                  <div className="absolute inset-y-3 left-2 hidden w-1 rounded-full bg-gradient-to-b from-sky-300 to-indigo-300 lg:block" />
                ) : null}
                <span className={`relative z-[1] text-lg ${selected ? 'text-white' : 'text-ink-300 group-hover:text-white'}`}>
                  {item.icon}
                </span>
                {!collapsed ? (
                  <span className="relative z-[1] flex-1 text-sm font-semibold">{item.label}</span>
                ) : null}
                {!collapsed && selected ? (
                  <span className="rounded-full border border-sky-300/15 bg-sky-300/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-sky-100">
                    Open
                  </span>
                ) : null}
              </motion.button>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-white/10 px-4 py-4">
          <div className={`glass-panel relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4 shadow-none ${collapsed ? 'items-center justify-center' : ''}`}>
            <Scanlines />
            {!collapsed ? (
              <div className="flex flex-col gap-4">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.2em] text-ink-400">AERA</p>
                  <p className="mt-2 text-sm font-semibold text-white">Simple business workspace</p>
                  <p className="mt-1 text-sm text-ink-300">Use this menu to check records, analytics, and actions without extra noise.</p>
                </div>
                <div className="space-y-2 border-t border-white/5 pt-4">
                  <ThermalEngine />
                </div>
              </div>
            ) : (
              <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.06] text-white">
                <HiSparkles />
              </span>
            )}
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export const MainLayout: React.FC<{
  children: React.ReactNode;
  sidebarItems: SidebarItem[];
  activePage: string;
  onNavigate: (href: string) => void;
  onLogout: () => void;
  userName?: string;
}> = ({ children, sidebarItems, activePage, onNavigate, onLogout, userName }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen text-white bg-transparent">
      <AdminAnnouncement />
      <MouseGlow />
      <Sidebar
        items={sidebarItems}
        active={activePage}
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onNavigate={onNavigate}
        onCollapseToggle={() => setCollapsed((value) => !value)}
        onMobileClose={() => setMobileOpen(false)}
      />

      <Navbar
        collapsed={collapsed}
        onCollapseToggle={() => setCollapsed((value) => !value)}
        onMobileToggle={() => setMobileOpen(true)}
        onLogout={onLogout}
        userName={userName}
      />

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 lg:hidden">
        <motion.nav
          initial={{ y: 80 }}
          animate={{ y: 0 }}
          className="mx-auto flex h-16 max-w-md items-center justify-around gap-1 rounded-2xl border border-white/10 bg-white/[0.03] p-2 shadow-2xl backdrop-blur-3xl"
        >
          {sidebarItems.slice(0, 4).map((item) => {
            const selected = activePage === item.href;
            return (
              <motion.button
                key={item.href}
                whileTap={{ scale: 0.9 }}
                onClick={() => onNavigate(item.href)}
                className={`flex flex-col items-center justify-center gap-1 rounded-xl px-4 py-1 transition-colors ${selected ? 'text-sky-400' : 'text-white/70'}`}
              >
                <span className={selected ? 'scale-110' : ''}>{item.icon}</span>
                <span className={`text-[10px] font-black uppercase tracking-tight ${selected ? 'text-sky-400' : 'text-white/60'}`}>{item.label.slice(0, 5)}</span>
              </motion.button>
            );
          })}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setMobileOpen(true)}
            className="flex flex-col items-center justify-center gap-1 rounded-xl px-4 py-1 text-white/70"
          >
            <Menu className="h-5 w-5" />
            <span className="text-[10px] font-black uppercase tracking-tight tertiary-text">More</span>
          </motion.button>
        </motion.nav>
      </div>

      <main className={`pt-24 transition-all duration-300 ease-premium ${collapsed ? 'lg:pl-[6.5rem]' : 'lg:pl-[18rem]'}`}>
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="px-4 pb-24 md:px-6 lg:px-8"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
};
