import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { LanguageProvider } from './contexts/LanguageContext';
import { HelmetProvider } from 'react-helmet-async';
import { API } from './lib/axios';

import AppleCinematicWelcome from './components/welcome/AppleCinematicWelcome';
import GlobalVoiceAssistant from './components/voice/GlobalVoiceAssistant';

// Layout Components
import PremiumLayout from './components/PremiumLayout';
import LoadingScreen from './components/LoadingScreen';
import { UpgradeModal } from './components/UpgradeModal';
import NetworkStatus from './components/NetworkStatus';
import { PageTransition } from './components/ui/MicroInteractions';
import { OnboardingStep } from './components/ui/BizPlusEliteUI';
import { PremiumBackground } from './components/ui/PremiumBackground';
import { BizPlusMomentum } from './components/BizPlusMomentum';

// Direct Page Imports (no lazy loading)
import LoginPage from './pages/Login';
import BizPlusRegisterPage from './pages/BizPlusRegister';
import LandingPage from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import BizPlusRecords from './pages/BizPlusRecords';

// User Growth Features
import PublicDemo from './components/PublicDemo';
import ViralWaitlist from './components/ViralWaitlist';

// Placeholder components for other pages
const AnalysisBizPlusReport = () => <div className="p-8 text-white">Analysis BizPlusReport - Coming Soon</div>;
const AdminPanel = () => <div className="p-8 text-white">Admin Panel - Coming Soon</div>;
const SystemHealth = () => <div className="p-8 text-white">System Health - Coming Soon</div>;
const Payments = () => <div className="p-8 text-white">Payments - Coming Soon</div>;
const ScanBill = () => <div className="p-8 text-white">Scan Bill - Coming Soon</div>;
const DataScienceHub = () => <div className="p-8 text-white">Data Science Hub - Coming Soon</div>;
const Pricing = () => <div className="p-8 text-white">Pricing - Coming Soon</div>;
const Profile = () => <div className="p-8 text-white">Profile - Coming Soon</div>;
const About = () => <div className="p-8 text-white">About - Coming Soon</div>;
const Terms = () => <div className="p-8 text-white">Terms - Coming Soon</div>;
const Privacy = () => <div className="p-8 text-white">Privacy - Coming Soon</div>;
const Contact = () => <div className="p-8 text-white">Contact - Coming Soon</div>;
const BizPlusReports = () => <div className="p-8 text-white">BizPlusReports - Coming Soon</div>;
const Insights = () => <div className="p-8 text-white">Insights - Coming Soon</div>;
const AIChat = () => <div className="p-8 text-white">AI Chat - Coming Soon</div>;
const Prediction = () => <div className="p-8 text-white">Prediction - Coming Soon</div>;
const ImageScanner = () => <div className="p-8 text-white">Image Scanner - Coming Soon</div>;
const CompanySetup = () => <div className="p-8 text-white">Company Setup - Coming Soon</div>;
const Notifications = () => <div className="p-8 text-white">Notifications - Coming Soon</div>;
const SimulationBizPlusEngine = () => <div className="p-8 text-white">Simulation BizPlusEngine - Coming Soon</div>;
const CAPortal = () => <div className="p-8 text-white">CA Portal - Coming Soon</div>;
const BusinessBrain = () => <div className="p-8 text-white">Business Brain - Coming Soon</div>;
const BizPlusResellerPartner = () => <div className="p-8 text-white">BizPlusReseller Partner - Coming Soon</div>;
const Workflows = () => <div className="p-8 text-white">Workflows - Coming Soon</div>;

// ── Mute preference key ──────────────────────────────────────
const MUTE_KEY = 'bizplus_sound_muted';

// Legacy key migration
if (localStorage.getItem('bizplus_sound_muted')) {
  localStorage.setItem('bizplus_sound_muted', localStorage.getItem('bizplus_sound_muted')!);
  localStorage.removeItem('bizplus_sound_muted');
}
if (localStorage.getItem('bizplus_sound_muted')) {
  localStorage.setItem('bizplus_sound_muted', localStorage.getItem('bizplus_sound_muted')!);
  localStorage.removeItem('bizplus_sound_muted');
}
if (localStorage.getItem('bizpulse_sound_muted')) {
  localStorage.setItem('bizplus_sound_muted', localStorage.getItem('bizpulse_sound_muted')!);
  localStorage.removeItem('bizpulse_sound_muted');
}

function getMutePreference(): boolean {
  try { return localStorage.getItem(MUTE_KEY) === 'true'; } catch { return false; }
}

// Error boundary for auth-related errors
class AuthErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('[AuthErrorBoundary] Auth context error:', error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
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
      title: 'Welcome to BIZ PLUS',
      description: "Your business health implementation ecosystem. Built to help your business thrive.",
    },
    {
      title: 'Snap & Save',
      description: 'Take a photo of any receipt or invoice. We automatically extract the details.',
    },
    {
      title: 'See Your Progress',
      description: 'Watch your profit grow as you add transactions. Clear insights to help you decide.',
    },
  ];

  return (
    <PremiumBackground>
      <NetworkStatus />
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
      <BizPlusMomentum />

      <AnimatePresence mode="wait">
        <PageTransition key={location.pathname}>
          <Routes location={location}>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<BizPlusRegisterPage />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/about" element={<About />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/contact" element={<Contact />} />

            {/* User Growth - Public Demo & Waitlist */}
            <Route path="/demo" element={<PublicDemo />} />
            <Route path="/waitlist" element={<ViralWaitlist />} />

            {/* Core Dashboard Experience */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/analysis-report" element={<ProtectedRoute><AnalysisBizPlusReport /></ProtectedRoute>} />
            <Route path="/system-health" element={<ProtectedRoute><SystemHealth /></ProtectedRoute>} />
            <Route path="/scan-bill" element={<ProtectedRoute><ScanBill /></ProtectedRoute>} />
            <Route path="/ds-hub" element={<ProtectedRoute><DataScienceHub /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />

            {/* Support Modules */}
            <Route path="/records" element={<ProtectedRoute><BizPlusRecords /></ProtectedRoute>} />
            <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><BizPlusReports /></ProtectedRoute>} />
            <Route path="/insights" element={<ProtectedRoute><Insights /></ProtectedRoute>} />
            <Route path="/business-brain" element={<ProtectedRoute><BusinessBrain /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/reseller-partner" element={<ProtectedRoute><BizPlusResellerPartner /></ProtectedRoute>} />

            {/* Extra Valid Routes */}
            <Route path="/assistant" element={<ProtectedRoute><AIChat /></ProtectedRoute>} />
            <Route path="/predictions" element={<ProtectedRoute><Prediction /></ProtectedRoute>} />
            <Route path="/image-scanner" element={<ProtectedRoute><ImageScanner /></ProtectedRoute>} />
            <Route path="/company-setup" element={<ProtectedRoute><CompanySetup /></ProtectedRoute>} />
            <Route path="/simulation" element={<ProtectedRoute><SimulationBizPlusEngine /></ProtectedRoute>} />
            <Route path="/ca-portal" element={<ProtectedRoute><CAPortal /></ProtectedRoute>} />
            <Route path="/workflows" element={<ProtectedRoute><Workflows /></ProtectedRoute>} />
            <Route path="/analysis-sync" element={<Navigate to="/analysis-report" replace />} />

            {/* Catch All */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </PageTransition>
      </AnimatePresence>

      {/* Global Voice Command Assistant */}
      <GlobalVoiceAssistant />
    </PremiumBackground>
  );
}

function App() {
  const [splashDone, setSplashDone] = useState(false);
  const [dataReady, setDataReady] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const seenWelcome = sessionStorage.getItem('seen_welcome');
    if (seenWelcome) setShowWelcome(false);
  }, []);

  const handleWelcomeEnter = () => {
    setShowWelcome(false);
    sessionStorage.setItem('seen_welcome', 'true');
  };

  useEffect(() => {
    const safetyTimeout = setTimeout(() => {
      if (!dataReady) setDataReady(true);
    }, 8000);

    const preload = async () => {
      try {
        await Promise.allSettled([
          fetch(`${API}/api/auth/csrf-token`, { credentials: 'include', signal: AbortSignal.timeout(3000) }),
          fetch(`${API}/api/health`, { signal: AbortSignal.timeout(2500) })
        ]);
      } finally {
        setDataReady(true);
        clearTimeout(safetyTimeout);
      }
    };
    void preload();
    return () => clearTimeout(safetyTimeout);
  }, [dataReady]);

  const handleSplashComplete = useCallback(() => {
    setSplashDone(true);
  }, []);

  const showApp = splashDone && dataReady;

  return (
    <AuthProvider>
      <LanguageProvider>
        <HelmetProvider>
          <ThemeProvider>
            <AnimatePresence mode="wait">
              {showWelcome ? (
                <motion.div
                  key="bizplus-welcome"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ 
                    opacity: 0, 
                    scale: 1.2, 
                    filter: 'blur(100px)',
                    transition: { duration: 1.5, ease: [0.76, 0, 0.24, 1] } 
                  }}
                  className="fixed inset-0 z-[20000]"
                >
                  <AppleCinematicWelcome onEnter={handleWelcomeEnter} />
                </motion.div>
              ) : !showApp ? (
                <motion.div
                  key="bizplus-loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ 
                    opacity: 0, 
                    scale: 1.5, 
                    filter: 'blur(150px)',
                    transition: { duration: 2, ease: [0.76, 0, 0.24, 1] }
                  }}
                  className="fixed inset-0 z-[10000]"
                >
                  <LoadingScreen onComplete={handleSplashComplete} />
                </motion.div>
              ) : (
                <motion.div
                  key="bizplus-app"
                  initial={{ opacity: 0, scale: 0.95, filter: 'blur(20px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full w-full"
                >
                  <MainApp />
                  <Toaster
                    position="top-right"
                    toastOptions={{
                      duration: 5000,
                      style: {
                        background: 'black',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(40px)',
                        borderRadius: '0px',
                        padding: '16px 24px',
                        fontSize: '12px',
                        fontWeight: '800',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        boxShadow: '0 40px 80px rgba(0,0,0,0.8)',
                      },
                    }}
                  />
                  <UpgradeModal />
                </motion.div>
              )}
            </AnimatePresence>
          </ThemeProvider>
        </HelmetProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
