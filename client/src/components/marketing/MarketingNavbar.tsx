import { Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import Logo from '../Logo';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'About', to: '/about' },
];

const linkClassName = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-4 py-2 text-sm font-semibold transition ${
    isActive
      ? 'bg-white/12 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.08)]'
      : 'text-slate-300 hover:bg-white/6 hover:text-white'
  }`;

export default function MarketingNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 px-4 pt-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between rounded-[28px] border border-white/10 bg-[rgba(7,10,24,0.72)] px-4 py-3 shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur-2xl sm:px-6">
        <Logo size="sm" to="/" showSubtitle={false} />

        <nav className="hidden items-center gap-2 md:flex">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClassName}>
              {link.label}
            </NavLink>
          ))}
          <Link
            to="/login"
            className="ml-2 inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]"
          >
            Login
          </Link>
        </nav>

        <button
          type="button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white md:hidden"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="mx-auto mt-3 max-w-7xl rounded-[28px] border border-white/10 bg-[rgba(7,10,24,0.92)] p-3 shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur-2xl md:hidden"
          >
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={linkClassName}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </NavLink>
              ))}
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950"
                onClick={() => setOpen(false)}
              >
                Login
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
