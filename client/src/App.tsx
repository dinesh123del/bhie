import { Suspense, lazy, useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './hooks/useAuth';

// Layout Components
import PremiumLayout from './components/PremiumLayout';
import LoadingScreen from './components/LoadingScreen';
import CinematicSplash from './components/CinematicSplash';
import { UpgradeModal } from './components/UpgradeModal';
import { PageTransition } from './components/ui/MicroInteractions';
import { OnboardingStep } from './components/ui/EliteUI';
import { PremiumBackground } from './components/ui/PremiumBackground';

// Dynamic Page Imports
const PremiumLogin    = lazy(() => import('./pages/LoginPremium'));
const PremiumRegister = lazy(() => import('./pages/RegisterPremium'));
const PremiumLanding  = lazy(() => import('./pages/LandingPremium'));
const Dashboard       = lazy(() => import('./pages/DashboardPremium'));
const Analytics       = lazy(() => import('./pages/AnalyticsPremium'));

const AnalysisReport  = lazy(() => import('./pages/AIAnalysisPage'));
const Settings        = lazy(() => import('./pages/Admin'));
const AdminPanel      = lazy(() => import('./pages/Admin'));
const Records         = lazy(() => import('./pages/RecordsPremium'));
const SystemHealth    = lazy(() => import('./pages/SystemHealth'));
const Payments        = lazy(() => import('./pages/Payments'));
const ScanBill        = lazy(() => import('./pages/ScanBill'));
const DataScienceHub  = lazy(() => import('./pages/DataScienceHub'));

const Pricing = lazy(() => import('./pages/Pricing'));
const Profile = lazy(() => import('./pages/Home'));

// ── Mute preference key ──────────────────────────────────────
const MUTE_KEY = 'bhie_sound_muted';

function getMutePreference(): boolean {
  try { return localStorage.getItem(MUTE_KEY) === 'true'; } catch { return false; }
}

const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return user
    ? <PremiumLayout>{children}</PremiumLayout>
    : <Navigate to="/login" replace />;
};

function MainApp() {
  const location = useLocation();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);

  useEffect(() => {
    const hasOnboarded = localStorage.getItem('has_onboarded');
    if (!hasOnboarded && location.pathname === '/dashboard') {
      setShowOnboarding(true);
    }
  }, [location.pathname]);

  const handleNextOnboarding = () => {
    if (onboardingStep < 3) {
      setOnboardingStep(prev => prev + 1);
    } else {
      setShowOnboarding(false);
      localStorage.setItem('has_onboarded', 'true');
    }
  };

  const onboardingSteps = [
    {
      title: 'Welcome to BHIE',
      description: "Welcome to the future of business intelligence. Let's get your finances automated in 60 seconds.",
    },
    {
      title: 'Snap & Automate',
      description: 'Snap any receipt. AI extracts the merchant, date, and amount instantly — no manual entry.',
    },
    {
      title: 'Real-time Control',
      description: 'Watch your profit and loss update live as you scan. Your first insight awaits.',
    },
  ];

  return (
    <PremiumBackground>
      <AnimatePresence>
        {showOnboarding && (
          <OnboardingStep
            step={onboardingStep}
            total={3}
            title={onboardingSteps[onboardingStep - 1].title}
            description={onboardingSteps[onboardingStep - 1].description}
            onNext={handleNextOnboarding}
          />
        )}
      </AnimatePresence>

      <Suspense fallback={<LoadingScreen />}>
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname}>
            <Routes location={location}>
              {/* Public Routes */}
              <Route path="/"        element={<PremiumLanding />} />
              <Route path="/login"   element={<PremiumLogin />} />
              <Route path="/register" element={<PremiumRegister />} />
              <Route path="/pricing" element={<Pricing />} />

              {/* Core Dashboard Experience */}
              <Route path="/dashboard"       element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/analytics"       element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
              <Route path="/analysis-report" element={<ProtectedRoute><AnalysisReport /></ProtectedRoute>} />
              <Route path="/system-health"   element={<ProtectedRoute><SystemHealth /></ProtectedRoute>} />
              <Route path="/scan-bill"       element={<ProtectedRoute><ScanBill /></ProtectedRoute>} />
              <Route path="/ds-hub"          element={<ProtectedRoute><DataScienceHub /></ProtectedRoute>} />
              <Route path="/settings"        element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/admin"           element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />

              {/* Support Modules */}
              <Route path="/records"  element={<ProtectedRoute><Records /></ProtectedRoute>} />
              <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
              <Route path="/profile"  element={<ProtectedRoute><Profile /></ProtectedRoute>} />

              {/* Catch All */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </PageTransition>
        </AnimatePresence>
      </Suspense>
    </PremiumBackground>
  );
}

function App() {
  const [splashDone, setSplashDone] = useState(false);
  const [dataReady, setDataReady]   = useState(false);
  const muted = getMutePreference();

  // Preload backend during splash (non-blocking)
  useEffect(() => {
    const preload = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'https://bhie-api.onrender.com';
        await fetch(`${API_URL}/api/health`, { signal: AbortSignal.timeout(2500) });
      } catch {
        // Backend unreachable — offline mode
      } finally {
        setDataReady(true);
      }
    };
    void preload();
  }, []);

  const handleSplashComplete = useCallback(() => {
    setSplashDone(true);
  }, []);

  // Show app only when BOTH splash has played AND data is preloaded
  const showApp = splashDone && dataReady;

  return (
    <AuthProvider>
      <ThemeProvider>
        <AnimatePresence mode="wait">
          {!showApp ? (
            <motion.div
              key="bhie-splash"
              className="fixed inset-0 z-[10000]"
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
            >
              <CinematicSplash
                onComplete={handleSplashComplete}
                duration={2700}
                muted={muted}
              />
            </motion.div>
          ) : (
            <motion.div
              key="bhie-app"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
              className="h-full w-full"
            >
              <MainApp />
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 5000,
                  style: {
                    background: 'rgba(10, 10, 10, 0.9)',
                    color: '#fff',
                    border: '1px solid rgba(79,70,229,0.2)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '16px',
                    padding: '14px 20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.5), 0 0 20px rgba(79,70,229,0.1)',
                  },
                  success: {
                    iconTheme: { primary: '#10b981', secondary: '#fff' },
                  },
                }}
              />
              <UpgradeModal />
            </motion.div>
          )}
        </AnimatePresence>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
