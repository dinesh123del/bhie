import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, PanInfo } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  Crown,
  Home,
  Lightbulb,
  Moon,
  Settings,
  Sparkles,
  SunMedium,
  Upload,
  User2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../contexts/ThemeContext';

const QuickAdd = lazy(() => import('../components/QuickAdd'));
const FileUpload = lazy(() => import('../components/FileUpload'));

type SlideId = 'home' | 'add' | 'insights' | 'analytics' | 'profile';

interface SlideDefinition {
  id: SlideId;
  label: string;
  icon: typeof Home;
  eyebrow: string;
  title: string;
  subtitle: string;
}

const slides: SlideDefinition[] = [
  {
    id: 'home',
    label: 'Home',
    icon: Home,
    eyebrow: 'Daily summary',
    title: 'Your business in one premium glance',
    subtitle: 'Track the most important numbers, your daily guidance, and what needs attention next.',
  },
  {
    id: 'add',
    label: 'Add',
    icon: Upload,
    eyebrow: 'Capture',
    title: 'Quick add or upload new records',
    subtitle: 'Use simple input or upload files without leaving the flow of the workspace.',
  },
  {
    id: 'insights',
    label: 'Insights',
    icon: Lightbulb,
    eyebrow: 'AI advice',
    title: 'Actionable recommendations for today',
    subtitle: 'Prioritized insights designed to help you move faster with less friction.',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    eyebrow: 'Visual trends',
    title: 'Dive into rich, scrollable business analytics',
    subtitle: 'Review growth, expenses, profit, and watch trends in a smooth premium feed.',
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: User2,
    eyebrow: 'Account',
    title: 'Manage subscription and settings',
    subtitle: 'Control your plan, appearance, and account preferences from one polished page.',
  },
];

const analyticsCards = [
  { label: 'Revenue', value: '₹2.48L', detail: '+12.6% this month' },
  { label: 'Profit', value: '₹64.2K', detail: '+8.2% margin lift' },
  { label: 'Expenses', value: '₹1.11L', detail: '-3.4% operational spend' },
  { label: 'Growth', value: '18.4%', detail: 'Quarterly run-rate trending up' },
];

const actionCards = [
  'Send payment reminders to 4 customers',
  'Upload last week’s pending receipts',
  'Review a spike in travel expenses',
];

const insightCards = [
  {
    title: 'Cash flow is improving',
    body: 'Collections are arriving faster than last week. Keep following up on large pending invoices.',
  },
  {
    title: 'Expense concentration detected',
    body: 'Marketing and logistics now drive most variable costs. Watch the next 7 days closely.',
  },
  {
    title: 'Growth opportunity',
    body: 'Top customers are repeating purchases. A small loyalty push may improve monthly revenue.',
  },
];

const springTransition = {
  type: 'spring' as const,
  stiffness: 280,
  damping: 28,
  mass: 0.95,
};

const slideVariants = {
  enter: (direction: number) => ({
    x: direction >= 0 ? 120 : -120,
    opacity: 0,
    scale: 0.97,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction >= 0 ? -120 : 120,
    opacity: 0,
    scale: 0.97,
  }),
};

function SlideShell({
  children,
  activeSlide,
}: {
  children: React.ReactNode;
  activeSlide: SlideDefinition;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden app-shell-bg">
      <div className="brand-grid" />
      <div className="brand-ambient brand-ambient-cyan" />
      <div className="brand-ambient brand-ambient-amber" />

      <div className="relative z-[1] mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-32 pt-6 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <motion.div
            layout
            className="glass-panel inline-flex items-center gap-3 rounded-full px-4 py-3"
            whileHover={{ y: -1 }}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-300 to-indigo-400 text-slate-950">
              <activeSlide.icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[11px] uppercase tracking-[0.26em] text-slate-400">{activeSlide.eyebrow}</p>
              <p className="text-sm font-semibold text-white">{activeSlide.label}</p>
            </div>
          </motion.div>

          <div className="glass-panel hidden items-center gap-2 rounded-full px-3 py-2 text-xs font-medium text-slate-300 sm:flex">
            <Sparkles className="h-4 w-4 text-sky-300" />
            Swipe or tap to move through the app
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}

function HomeSlide() {
  return (
    <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      <motion.section
        className="glass-panel-strong noise-overlay rounded-[2rem] p-6 md:p-8"
        whileHover={{ y: -4, scale: 1.003 }}
        transition={{ duration: 0.2 }}
      >
        <span className="section-kicker">
          <Sparkles className="h-3.5 w-3.5" />
          Premium summary
        </span>
        <h1 className="mt-5 text-4xl font-semibold leading-tight md:text-5xl">
          Fluid motion. <span className="text-gradient-brand">No reload feeling.</span>
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
          Welcome back. Your workspace is now organized into swipeable slides so you can move from summary to action,
          insight, analytics, and profile without breaking context.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {analyticsCards.map((card, index) => (
            <motion.article
              key={card.label}
              className="glass-panel rounded-[1.6rem] p-4"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 * index, ...springTransition }}
              whileHover={{ y: -6 }}
            >
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{card.label}</p>
              <p className="mt-3 text-2xl font-semibold text-white">{card.value}</p>
              <p className="mt-2 text-sm text-slate-300">{card.detail}</p>
            </motion.article>
          ))}
        </div>
      </motion.section>

      <div className="grid gap-4">
        <motion.section
          className="glass-panel rounded-[2rem] p-6"
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
        >
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Daily message</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Today looks strong</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Focus on collections and uploading pending records. Revenue trend is healthy and your cost curve is stable.
          </p>
          <button className="brand-button-primary mt-6 inline-flex items-center gap-2">
            Open insights
            <ArrowRight className="h-4 w-4" />
          </button>
        </motion.section>

        <motion.section
          className="glass-panel rounded-[2rem] p-6"
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
        >
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Next actions</p>
          <div className="mt-4 space-y-3">
            {actionCards.map((action) => (
              <div
                key={action}
                className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] px-4 py-4 text-sm text-slate-200 card-glow"
              >
                {action}
              </div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}

function AddSlide() {
  return (
    <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
      <motion.section className="glass-panel-strong rounded-[2rem] p-6 md:p-8" whileHover={{ y: -4 }}>
        <span className="section-kicker">
          <Upload className="h-3.5 w-3.5" />
          Add / upload
        </span>
        <h2 className="mt-5 text-3xl font-semibold text-white">Capture new business activity fast</h2>
        <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300">
          Use a quick add flow for manual entries or upload files to keep your records fresh without leaving this slide.
        </p>

        <div className="mt-6 space-y-4">
          <div className="glass-panel rounded-[1.5rem] p-4">
            <p className="text-sm font-semibold text-white">Quick add</p>
            <p className="mt-1 text-sm text-slate-300">Log revenue, expense, or note in a minimal workflow.</p>
          </div>
          <div className="glass-panel rounded-[1.5rem] p-4">
            <p className="text-sm font-semibold text-white">Upload documents</p>
            <p className="mt-1 text-sm text-slate-300">Import receipts, invoices, or statements from your device.</p>
          </div>
        </div>
      </motion.section>

      <div className="grid gap-4">
        <Suspense fallback={<div className="glass-panel rounded-[2rem] p-6 text-sm text-slate-300">Loading quick add…</div>}>
          <div className="glass-panel rounded-[2rem] p-3">
            <QuickAdd />
          </div>
        </Suspense>

        <Suspense fallback={<div className="glass-panel rounded-[2rem] p-6 text-sm text-slate-300">Loading upload…</div>}>
          <div className="glass-panel rounded-[2rem] p-3">
            <FileUpload />
          </div>
        </Suspense>
      </div>
    </div>
  );
}

function InsightsSlide() {
  return (
    <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
      <motion.section className="glass-panel-strong rounded-[2rem] p-6 md:p-8" whileHover={{ y: -4 }}>
        <span className="section-kicker">
          <Lightbulb className="h-3.5 w-3.5" />
          Main advice
        </span>
        <h2 className="mt-5 text-3xl font-semibold text-white">You should focus on collections first</h2>
        <p className="mt-4 text-sm leading-7 text-slate-300">
          Invoice recovery remains the fastest way to strengthen cash flow. Follow up with the largest pending accounts,
          then upload missing expense evidence to keep your dashboard accurate.
        </p>

        <div className="mt-6 rounded-[1.6rem] border border-sky-300/15 bg-sky-300/10 p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-sky-100">Priority move</p>
          <p className="mt-2 text-lg font-semibold text-white">Recover 3 high-value payments in the next 48 hours</p>
        </div>
      </motion.section>

      <div className="space-y-4">
        {insightCards.map((insight, index) => (
          <motion.article
            key={insight.title}
            className="glass-panel rounded-[1.8rem] p-5"
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.06 * index, ...springTransition }}
            whileHover={{ y: -4, scale: 1.01 }}
          >
            <p className="text-lg font-semibold text-white">{insight.title}</p>
            <p className="mt-2 text-sm leading-7 text-slate-300">{insight.body}</p>
          </motion.article>
        ))}
      </div>
    </div>
  );
}

function AnalyticsSlide() {
  return (
    <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
      <motion.section className="glass-panel-strong rounded-[2rem] p-6 md:p-8" whileHover={{ y: -4 }}>
        <span className="section-kicker">
          <BarChart3 className="h-3.5 w-3.5" />
          Analytics
        </span>
        <h2 className="mt-5 text-3xl font-semibold text-white">Scrollable cards with a streaming feel</h2>
        <p className="mt-4 text-sm leading-7 text-slate-300">
          This slide is built to feel cinematic and fast. Scroll vertically through cards while staying inside the
          horizontal slide system.
        </p>
      </motion.section>

      <div className="max-h-[65vh] space-y-4 overflow-y-auto pr-1">
        {analyticsCards.concat(analyticsCards).map((card, index) => (
          <motion.article
            key={`${card.label}-${index}`}
            className="glass-panel rounded-[1.8rem] p-5"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.05 * index, ...springTransition }}
            whileHover={{ y: -4 }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{card.label}</p>
                <p className="mt-2 text-2xl font-semibold text-white">{card.value}</p>
              </div>
              <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-slate-300">
                Trend
              </span>
            </div>
            <div className="mt-5 h-28 rounded-[1.4rem] bg-gradient-to-r from-sky-300/10 via-indigo-300/10 to-transparent p-4">
              <div className="flex h-full items-end gap-2">
                {[40, 68, 52, 84, 62, 90, 72].map((height) => (
                  <motion.div
                    key={`${card.label}-${height}`}
                    className="flex-1 rounded-full bg-gradient-to-t from-sky-300 to-indigo-400"
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: 0.05 * index, duration: 0.55 }}
                  />
                ))}
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-300">{card.detail}</p>
          </motion.article>
        ))}
      </div>
    </div>
  );
}

function ProfileSlide() {
  const { user, logout } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
      <motion.section className="glass-panel-strong rounded-[2rem] p-6 md:p-8" whileHover={{ y: -4 }}>
        <span className="section-kicker">
          <User2 className="h-3.5 w-3.5" />
          Profile
        </span>
        <h2 className="mt-5 text-3xl font-semibold text-white">{user?.name || 'Your workspace profile'}</h2>
        <p className="mt-2 text-sm text-slate-300">{user?.email || 'Manage your BHIE account and preferences.'}</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="glass-panel rounded-[1.5rem] p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Plan</p>
            <div className="mt-3 flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-300" />
              <p className="text-lg font-semibold text-white">{user?.plan || 'Premium'}</p>
            </div>
          </div>
          <div className="glass-panel rounded-[1.5rem] p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Theme</p>
            <button
              onClick={toggleTheme}
              className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-medium text-white transition hover:bg-white/[0.08]"
            >
              {resolvedTheme === 'dark' ? <SunMedium className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {resolvedTheme === 'dark' ? 'Switch to light' : 'Switch to dark'}
            </button>
          </div>
        </div>
      </motion.section>

      <div className="grid gap-4">
        <motion.section className="glass-panel rounded-[2rem] p-6" whileHover={{ y: -4 }}>
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Subscription + settings</p>
          <div className="mt-4 space-y-3">
            <button
              onClick={() => navigate('/payments')}
              className="flex w-full items-center justify-between rounded-[1.4rem] border border-white/10 bg-white/[0.04] px-4 py-4 text-left text-sm text-slate-100 transition hover:bg-white/[0.07]"
            >
              Billing and payments
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigate('/company-setup')}
              className="flex w-full items-center justify-between rounded-[1.4rem] border border-white/10 bg-white/[0.04] px-4 py-4 text-left text-sm text-slate-100 transition hover:bg-white/[0.07]"
            >
              Company settings
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </motion.section>

        <motion.section className="glass-panel rounded-[2rem] p-6" whileHover={{ y: -4 }}>
          <button onClick={logout} className="brand-button-secondary w-full">
            Log out
          </button>
        </motion.section>
      </div>
    </div>
  );
}

function SlideViewport({
  activeIndex,
  direction,
}: {
  activeIndex: number;
  direction: number;
}) {
  const activeSlide = slides[activeIndex];

  return (
    <AnimatePresence custom={direction} mode="wait">
      <motion.div
        key={activeSlide.id}
        custom={direction}
        variants={slideVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={springTransition}
        className="flex-1"
      >
        <SlideShell activeSlide={activeSlide}>
          {activeSlide.id === 'home' ? <HomeSlide /> : null}
          {activeSlide.id === 'add' ? <AddSlide /> : null}
          {activeSlide.id === 'insights' ? <InsightsSlide /> : null}
          {activeSlide.id === 'analytics' ? <AnalyticsSlide /> : null}
          {activeSlide.id === 'profile' ? <ProfileSlide /> : null}
        </SlideShell>
      </motion.div>
    </AnimatePresence>
  );
}

function BottomNavigation({
  activeIndex,
  onSelect,
}: {
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 px-4">
      <motion.nav
        initial={{ opacity: 0, y: 28, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={springTransition}
        className="glass-panel-strong pointer-events-auto mx-auto flex max-w-md items-center justify-between rounded-[2rem] px-2 py-2"
      >
        {slides.map((slide, index) => {
          const Icon = slide.icon;
          const active = index === activeIndex;

          return (
            <motion.button
              key={slide.id}
              onClick={() => onSelect(index)}
              whileTap={{ scale: 0.94 }}
              whileHover={{ y: -2 }}
              className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-[1.3rem] px-3 py-3 transition ${
                active ? 'bg-gradient-to-br from-sky-300/20 to-indigo-400/20 text-white' : 'text-slate-400'
              }`}
              aria-label={slide.label}
            >
              <Icon className={`h-5 w-5 ${active ? 'text-sky-200' : ''}`} />
              <span className="text-[11px] font-medium">{slide.label}</span>
            </motion.button>
          );
        })}
      </motion.nav>
    </div>
  );
}

export default function SlideApp() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const dragLockedRef = useRef(false);

  const goTo = (targetIndex: number) => {
    if (targetIndex === activeIndex || targetIndex < 0 || targetIndex >= slides.length) {
      return;
    }

    setDirection(targetIndex > activeIndex ? 1 : -1);
    setActiveIndex(targetIndex);
  };

  const goNext = () => goTo(activeIndex + 1);
  const goPrevious = () => goTo(activeIndex - 1);

  const gestureHandlers = useMemo(
    () => ({
      onDragStart: () => {
        dragLockedRef.current = false;
      },
      onDragEnd: (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        if (dragLockedRef.current) {
          return;
        }

        const offset = info.offset.x;
        const velocity = info.velocity.x;
        const threshold = 90;

        if (offset < -threshold || velocity < -650) {
          dragLockedRef.current = true;
          goNext();
        } else if (offset > threshold || velocity > 650) {
          dragLockedRef.current = true;
          goPrevious();
        }
      },
    }),
    [activeIndex],
  );

  useEffect(() => {
    const preloadAdjacent = async () => {
      if (slides[activeIndex + 1]?.id === 'add' || slides[activeIndex - 1]?.id === 'add') {
        await Promise.all([import('../components/QuickAdd'), import('../components/FileUpload')]);
      }
    };

    preloadAdjacent();
  }, [activeIndex]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.12}
        className="min-h-screen touch-pan-y"
        {...gestureHandlers}
      >
        <SlideViewport activeIndex={activeIndex} direction={direction} />
      </motion.div>

      <BottomNavigation activeIndex={activeIndex} onSelect={goTo} />
    </div>
  );
}
