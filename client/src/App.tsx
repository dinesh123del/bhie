import { Suspense, lazy, useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './hooks/useAuth';

// Layout Components
import PremiumLayout from './components/PremiumLayout';
import LoadingScreen from './components/LoadingScreen';
import FullscreenLogoLoader from './components/FullscreenLogoLoader';
import { UpgradeModal } from './components/UpgradeModal';
import { PageTransition } from './components/ui/MicroInteractions';
import { OnboardingStep } from './components/ui/EliteUI';
import { PremiumBackground } from './components/ui/PremiumBackground';

// Dynamic Page Imports
const PremiumLogin = lazy(() => import('./pages/LoginPremium'));
const PremiumRegister = lazy(() => import('./pages/RegisterPremium'));
const PremiumLanding = lazy(() => import('./pages/LandingPremium'));
const Dashboard = lazy(() => import('./pages/DashboardPremium'));
const Analytics = lazy(() => import('./pages/AnalyticsPremium'));

const AnalysisReport = lazy(() => import('./pages/AIAnalysisPage'));
const Settings = lazy(() => import('./pages/Admin')); 
const Records = lazy(() => import('./pages/RecordsPremium'));
const SystemHealth = lazy(() => import('./pages/SystemHealth'));
const Payments = lazy(() => import('./pages/Payments'));
const ScanBill = lazy(() => import('./pages/ScanBill'));

const Pricing = lazy(() => import('./pages/Pricing'));
const Profile = lazy(() => import('./pages/Home')); // Using Home as Profile placeholder

const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return user ? <PremiumLayout>{children}</PremiumLayout> : <Navigate to="/login" replace />;
};

function MainApp() {
  const location = useLocation();
  const [routeLoading, setRouteLoading] = useState(false);

  // Route Transition Loading (Advanced)
  useEffect(() => {
    // Show loading during route changes
    setRouteLoading(true);
    
    // Simulate brief transition handling or wait for component mount
    const timer = setTimeout(() => {
      setRouteLoading(false);
    }, 600); 

    return () => clearTimeout(timer);
  }, [location.pathname]);

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
      title: "Welcome to BHIE",
      description: "Welcome to the future of expense tracking. Let's get your business automated in 60 seconds."
    },
    {
      title: "Snap & Automate",
      description: "Snap a photo of any receipt. Our AI extracts the merchant, date, and amount instantly."
    },
    {
      title: "Real-time Control",
      description: "Watch your profit and loss dashboard update in real-time as you scan. Let's track your first expense."
    }
  ];

  return (
    <PremiumBackground>
      <AnimatePresence mode="wait">
        {routeLoading && (
          <motion.div
            key="route-loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.4 } }}
            className="fixed inset-0 z-[10000] pointer-events-none"
          >
            <LoadingScreen />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showOnboarding && (
          <OnboardingStep
            step={onboardingStep}
            total={3}
            title={onboardingSteps[onboardingStep-1].title}
            description={onboardingSteps[onboardingStep-1].description}
            onNext={handleNextOnboarding}
          />
        )}
      </AnimatePresence>

      <Suspense fallback={<LoadingScreen />}>
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname}>
            <Routes location={location}>
              {/* Public Routes */}
              <Route path="/" element={<PremiumLanding />} />
              <Route path="/login" element={<PremiumLogin />} />
              <Route path="/register" element={<PremiumRegister />} />
              <Route path="/pricing" element={<Pricing />} />

              {/* Core Dashboard Experience */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
              <Route path="/analysis-report" element={<ProtectedRoute><AnalysisReport /></ProtectedRoute>} />
              <Route path="/system-health" element={<ProtectedRoute><SystemHealth /></ProtectedRoute>} />
              <Route path="/scan-bill" element={<ProtectedRoute><ScanBill /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

              {/* Support Modules */}
              <Route path="/records" element={<ProtectedRoute><Records /></ProtectedRoute>} />
              <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

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
  // Global loading state
  const [loading, setLoading] = useState(true);

  // Initial Load Handling & API-Based Loading Control Example
  useEffect(() => {
    let isMounted = true;

    const initializeApp = async () => {
      try {
        setLoading(true);
        // Simulate or wait for data/API readiness
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Check API health briefly without blocking
        const API = import.meta.env.VITE_API_URL || "https://bhie-api.onrender.com";
        fetch(`${API}/api/health`).catch(() => {});
          
      } catch (err) {
        console.error("Failed during initialization:", err);
      } finally {
        // Prevent infinite loading by ensuring loading always turns false
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeApp();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider>
        {/* Smooth exit animation for loading screen switch */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="global-loading"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
              className="fixed inset-0 z-[10000]"
            >
              <LoadingScreen />
            </motion.div>
          ) : (
            <motion.div
              key="main-app"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="h-full w-full"
            >
              <MainApp />
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 5000,
                  style: {
                    background: 'rgba(15, 23, 42, 0.8)',
                    color: '#fff',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '24px',
                    padding: '16px 24px',
                    fontSize: '14px',
                    fontWeight: '700',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    letterSpacing: '-0.02em',
                  },
                  success: {
                    iconTheme: {
                      primary: '#10b981',
                      secondary: '#fff',
                    },
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
