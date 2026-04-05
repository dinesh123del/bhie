import { Mail, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '../Logo';

const footerLinks = [
  { label: 'Home', to: '/' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'About', to: '/about' },
  { label: 'Terms', to: '/terms' },
  { label: 'Login', to: '/login' },
];

export default function MarketingFooter() {
  return (
    <footer className="relative border-t border-white/10 px-4 pb-10 pt-16 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent" />
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.4fr_0.8fr_1fr]">
        <div className="space-y-5">
          <Logo size="md" to="/" subtitle="Business Health Intelligence Engine" />
          <p className="max-w-md text-sm leading-7 text-slate-300">
            BHIE helps modern businesses turn operational data into decisions, momentum, and measurable growth.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
            Links
          </h3>
          <div className="mt-5 flex flex-col gap-3 text-sm text-slate-300">
            {footerLinks.map((link) => (
              <Link key={link.to} to={link.to} className="transition hover:text-white">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
            Contact
          </h3>
          <div className="mt-5 space-y-4 text-sm text-slate-300">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-cyan-300" />
              <span>hello@bhie.ai</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-cyan-300" />
              <span>+91 80 4567 2200</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-cyan-300" />
              <span>Bengaluru, India</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-7xl border-t border-white/10 pt-6 text-sm text-slate-400">
        Copyright © 2026 BHIE. All rights reserved.
      </div>
    </footer>
  );
}
