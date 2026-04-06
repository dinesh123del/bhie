import { Suspense, lazy, useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { LanguageProvider } from './contexts/LanguageContext';

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
const About   = lazy(() => import('./pages/About'));
const Terms   = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Contact = lazy(() => import('./pages/Contact'));
const Reports = lazy(() => import('./pages/Reports'));
const Insights = lazy(() => import('./pages/Insights'));
const AIChat = lazy(() => import('./pages/AIChat'));
const Prediction = lazy(() => import('./pages/Prediction'));
const InnovativeDashboard = lazy(() => import('./pages/InnovativeDashboard'));
const ImageIntelligence = lazy(() => import('./pages/ImageIntelligence'));
const CompanySetup = lazy(() => import('./pages/CompanySetup'));
const AnalyticsPremium = lazy(() => import('./pages/AnalyticsPremium'));
const DashboardPremium = lazy(() => import('./pages/DashboardPremium'));
const LandingPremiumPage = lazy(() => import('./pages/LandingPremium'));
const RecordsPremium = lazy(() => import('./pages/RecordsPremium'));
const Home = lazy(() => import('./pages/Home'));
const Notifications = lazy(() => import('./pages/Notifications'));

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

import { API } from './lib/axios';

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
      description: "We help you track your business money and grow. Let's get you set up in one minute.",
    },
    {
      title: 'Snap & Save',
      description: 'Just take a photo of any bill. Our AI finds the shop name, date, and price instantly — you do nothing.',
    },
    {
      title: 'See Your Progress',
      description: 'Watch your profit grow as you scan. We make your business clear and simple.',
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
              <Route path="/about"   element={<About />} />
              <Route path="/terms"   element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/contact" element={<Contact />} />

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
              <Route path="/reports"  element={<ProtectedRoute><Reports /></ProtectedRoute>} />
              <Route path="/insights" element={<ProtectedRoute><Insights /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
              
              {/* Extra Valid Routes from Standard Sidebar */}
              <Route path="/ai-chat" element={<ProtectedRoute><AIChat /></ProtectedRoute>} />
              <Route path="/predictions" element={<ProtectedRoute><Prediction /></ProtectedRoute>} />
              <Route path="/innovative-dashboard" element={<ProtectedRoute><InnovativeDashboard /></ProtectedRoute>} />
              <Route path="/image-intelligence" element={<ProtectedRoute><ImageIntelligence /></ProtectedRoute>} />
              <Route path="/company-setup" element={<ProtectedRoute><CompanySetup /></ProtectedRoute>} />
              <Route path="/analytics-premium" element={<ProtectedRoute><AnalyticsPremium /></ProtectedRoute>} />
              <Route path="/dashboard-premium" element={<ProtectedRoute><DashboardPremium /></ProtectedRoute>} />
              <Route path="/landing" element={<ProtectedRoute><LandingPremiumPage /></ProtectedRoute>} />
              <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/ai-analysis" element={<Navigate to="/analysis-report" replace />} />

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
        // BANK-GRADE SECURITY: Initialize CSRF session
        await fetch(`${API}/api/auth/csrf-token`, { 
          credentials: 'include',
          signal: AbortSignal.timeout(3000) 
        });
        
        await fetch(`${API}/api/health`, { signal: AbortSignal.timeout(2500) });
      } catch (err) {
        console.error('Security handshake failed:', err);
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
      <LanguageProvider>
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
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
