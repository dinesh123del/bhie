import React, { Suspense, ReactNode, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw, WifiOff } from 'lucide-react';

// Types
interface SafeRenderProps {
  children: ReactNode;
  fallback?: ReactNode;
  errorFallback?: ReactNode;
  timeout?: number;
}

interface ErrorState {
  hasError: boolean;
  error?: Error;
}

// Network status hook
const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setWasOffline(true);
      // Reset after 3 seconds
      setTimeout(() => setWasOffline(false), 3000);
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, wasOffline };
};

// Default loading skeleton
const DefaultLoadingFallback = () => (
  <div className="w-full h-full min-h-[200px] flex items-center justify-center">
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
      <p className="text-white/40 text-sm">Loading...</p>
    </motion.div>
  </div>
);

// Network error fallback
const NetworkErrorFallback = ({ onRetry }: { onRetry: () => void }) => {
  const { isOnline } = useNetworkStatus();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full h-full min-h-[200px] flex flex-col items-center justify-center p-6 bg-white/5 rounded-2xl border border-white/10"
    >
      <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
        <WifiOff className="w-8 h-8 text-amber-400" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">
        {isOnline ? 'Connection Issue' : 'You\'re Offline'}
      </h3>
      <p className="text-white/50 text-center text-sm max-w-xs mb-4">
        {isOnline
          ? 'Unable to load this content. Please check your connection and try again.'
          : 'Please check your internet connection and try again.'}
      </p>
      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm"
      >
        <RefreshCw className="w-4 h-4" />
        Retry
      </button>
    </motion.div>
  );
};

// General error fallback
const DefaultErrorFallback = ({ error, onRetry }: { error?: Error; onRetry: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="w-full h-full min-h-[200px] flex flex-col items-center justify-center p-6 bg-white/5 rounded-2xl border border-red-500/20"
  >
    <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
      <AlertCircle className="w-8 h-8 text-red-400" />
    </div>
    <h3 className="text-lg font-semibold text-white mb-2">Something went wrong</h3>
    <p className="text-white/50 text-center text-sm max-w-xs mb-2">
      {error?.message || 'Failed to load content'}
    </p>
    <p className="text-white/30 text-xs mb-4">
      Error ID: {Math.random().toString(36).substring(7).toUpperCase()}
    </p>
    <button
      onClick={onRetry}
      className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors text-sm"
    >
      <RefreshCw className="w-4 h-4" />
      Try Again
    </button>
  </motion.div>
);

// Error Boundary Component
class SafeRenderErrorBoundary extends React.Component<
  { children: ReactNode; onError: (error: Error) => void },
  ErrorState
> {
  constructor(props: { children: ReactNode; onError: (error: Error) => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[SafeRender] Component error:', error);
    console.error('[SafeRender] Component stack:', errorInfo.componentStack);
    this.props.onError(error);
  }

  render() {
    if (this.state.hasError) {
      return null; // Parent will handle the error UI
    }
    return this.props.children;
  }
}

// Timeout wrapper
const TimeoutWrapper = ({
  children,
  timeout = 10000,
  onTimeout,
}: {
  children: ReactNode;
  timeout?: number;
  onTimeout: () => void;
}) => {
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimedOut(true);
      onTimeout();
    }, timeout);

    return () => clearTimeout(timer);
  }, [timeout, onTimeout]);

  if (timedOut) {
    return (
      <div className="w-full h-full min-h-[200px] flex flex-col items-center justify-center">
        <p className="text-white/50 mb-4">Taking longer than expected...</p>
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
};

// Main SafeRender Component
export const SafeRender: React.FC<SafeRenderProps> = ({
  children,
  fallback,
  errorFallback,
  timeout = 10000,
}) => {
  const [error, setError] = useState<Error | undefined>();
  const [key, setKey] = useState(0);
  const { isOnline, wasOffline } = useNetworkStatus();

  const handleRetry = () => {
    setError(undefined);
    setKey((prev) => prev + 1);
  };

  // Show network error when offline
  if (!isOnline) {
    return errorFallback || <NetworkErrorFallback onRetry={handleRetry} />;
  }

  // Show reconnected toast
  if (wasOffline && isOnline) {
    console.log('[SafeRender] Connection restored');
  }

  // Show error fallback
  if (error) {
    return (
      errorFallback || <DefaultErrorFallback error={error} onRetry={handleRetry} />
    );
  }

  return (
    <SafeRenderErrorBoundary key={key} onError={setError}>
      <TimeoutWrapper timeout={timeout} onTimeout={() => console.warn('[SafeRender] Timeout reached')}>
        <Suspense fallback={fallback || <DefaultLoadingFallback />}>
          {children}
        </Suspense>
      </TimeoutWrapper>
    </SafeRenderErrorBoundary>
  );
};

// Hook for async data fetching with error handling
export const useSafeAsync = <T,>(
  asyncFunction: () => Promise<T>,
  deps: React.DependencyList = []
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const execute = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await asyncFunction();
        if (mounted) {
          setData(result);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    execute();

    return () => {
      mounted = false;
    };
  }, deps);

  const retry = () => {
    setError(null);
    setLoading(true);
  };

  return { data, loading, error, retry };
};

export default SafeRender;
