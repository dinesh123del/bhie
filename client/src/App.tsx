import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './hooks/useAuth';

// Layout Components
import PremiumLayout from './components/PremiumLayout';
import FullscreenLogoLoader from './components/FullscreenLogoLoader';

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
  if (loading) return <FullscreenLogoLoader label="Securing Session" />;
  return user ? <PremiumLayout>{children}</PremiumLayout> : <Navigate to="/login" replace />;
};

function AppContent() {
  const location = useLocation();

  return (
    <Suspense fallback={<FullscreenLogoLoader label="Initialising Universe" />}>
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
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
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
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;

