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

// Dynamic Page Imports
const PremiumLogin = lazy(() => import('./pages/LoginPremium'));
const PremiumRegister = lazy(() => import('./pages/RegisterPremium'));
const PremiumLanding = lazy(() => import('./pages/LandingPremium'));
const Dashboard = lazy(() => import('./pages/DashboardRestructured'));
const Analytics = lazy(() => import('./pages/AnalyticsIntelligence'));

const AIAnalysis = lazy(() => import('./pages/AIAnalysisPage'));
const Settings = lazy(() => import('./pages/Admin')); 
const Records = lazy(() => import('./pages/RecordsPremium'));
const SystemHealth = lazy(() => import('./pages/SystemHealth'));
const Payments = lazy(() => import('./pages/Payments'));

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

  return (
    <>
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

      <Suspense fallback={<LoadingScreen />}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Public Routes */}
            <Route path="/" element={<PremiumLanding />} />
            <Route path="/login" element={<PremiumLogin />} />
            <Route path="/register" element={<PremiumRegister />} />
            <Route path="/pricing" element={<Pricing />} />

            {/* Core Dashboard Experience */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/ai-analysis" element={<ProtectedRoute><AIAnalysis /></ProtectedRoute>} />
            <Route path="/system-health" element={<ProtectedRoute><SystemHealth /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

            {/* Support Modules */}
            <Route path="/records" element={<ProtectedRoute><Records /></ProtectedRoute>} />
            <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

            {/* Catch All */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </>
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
        await new Promise(resolve => setTimeout(resolve, 2500));
        
        // --- PRODUCTION API TEST LOGIC ---
        const API = import.meta.env.VITE_API_URL || "https://bhie-server.onrender.com";
        console.log("API:", API);
        if (!API) console.error("VITE_API_URL is undefined. API calls may fail.");

        fetch(`${API}/api/health`)
          .then(res => res.json())
          .then(data => console.log("✅ API Connected:", data))
          .catch(err => console.error("❌ API Error:", err));
          
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
                position="bottom-right"
                toastOptions={{
                  style: {
                    background: 'rgba(15, 23, 42, 0.9)',
                    color: '#fff',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(12px)',
                    borderRadius: '16px',
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
