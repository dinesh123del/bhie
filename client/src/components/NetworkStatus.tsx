import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi, AlertCircle, RefreshCw } from 'lucide-react';
import { getNetworkStatus, resetNetworkStatus } from '../lib/axios';

interface NetworkStatusProps {
  showIndicator?: boolean;
}

export const NetworkStatus: React.FC<NetworkStatusProps> = ({ showIndicator = true }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showReconnect, setShowReconnect] = useState(false);
  const [apiError, setApiError] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setApiError(false);
      resetNetworkStatus();
      setShowReconnect(true);
      setTimeout(() => setShowReconnect(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    const handleApiError = (event: CustomEvent) => {
      console.log('[NetworkStatus] API error detected:', event.detail);
      setApiError(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('api:network-error' as any, handleApiError);

    // Periodic check of API status
    const interval = setInterval(() => {
      const status = getNetworkStatus();
      if (status.isNetworkDown && !apiError) {
        setApiError(true);
      } else if (!status.isNetworkDown && apiError) {
        setApiError(false);
      }
    }, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('api:network-error' as any, handleApiError);
      clearInterval(interval);
    };
  }, [apiError]);

  // Don't show anything if online and no API errors
  if (isOnline && !apiError && !showReconnect) return null;

  if (!showIndicator) return null;

  return (
    <AnimatePresence mode="wait">
      {/* Offline State */}
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-0 left-0 right-0 z-[9999] bg-amber-500 text-black px-4 py-3 flex items-center justify-center gap-3 shadow-lg"
        >
          <WifiOff className="w-5 h-5" />
          <span className="font-semibold text-sm">
            You're offline. Some features may not work.
          </span>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-1 px-3 py-1 bg-black/20 hover:bg-black/30 rounded-md text-sm font-medium transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </motion.div>
      )}

      {/* API Error State */}
      {isOnline && apiError && !showReconnect && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-0 left-0 right-0 z-[9999] bg-red-500/90 backdrop-blur-sm text-white px-4 py-3 flex items-center justify-center gap-3 shadow-lg"
        >
          <AlertCircle className="w-5 h-5" />
          <span className="font-semibold text-sm">
            Having trouble connecting to servers. Retrying...
          </span>
          <button
            onClick={() => {
              resetNetworkStatus();
              window.location.reload();
            }}
            className="flex items-center gap-1 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-md text-sm font-medium transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Reload
          </button>
        </motion.div>
      )}

      {/* Reconnected State */}
      {isOnline && showReconnect && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-0 left-0 right-0 z-[9999] bg-emerald-500 text-white px-4 py-3 flex items-center justify-center gap-3 shadow-lg"
        >
          <Wifi className="w-5 h-5" />
          <span className="font-semibold text-sm">
            Connection restored!
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NetworkStatus;
