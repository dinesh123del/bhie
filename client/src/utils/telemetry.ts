/**
 * Finly Telemetry & Monitoring System
 * Unified integration for Sentry (Errors) and Google Analytics (Insights).
 */

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN || '';
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_ID || '';

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

/**
 * Initialize all telemetry services
 */
export const initTelemetry = async () => {
  if (import.meta.env.MODE !== 'production') {
    return;
  }

  // 1. Sentry Integration (Error Tracking)
  if (SENTRY_DSN) {
    try {
      const Sentry = await import('@sentry/react');
      Sentry.init({
        dsn: SENTRY_DSN,
        integrations: [
          Sentry.browserTracingIntegration(),
          Sentry.replayIntegration(),
        ],
        // Performance Monitoring
        tracesSampleRate: 1.0,
        // Session Replay
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
      });
      console.log('🛡️ Sentry: Monitoring active');
    } catch (err) {
      console.error('Failed to initialize Sentry:', err);
    }
  }

  // 2. Google Analytics (User Insights)
  if (GA_MEASUREMENT_ID) {
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    script.async = true;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag(..._args: any[]) {
      window.dataLayer.push(arguments);
    }
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID);
    console.log('📈 Analytics: Tracking active');
  }
};

/**
 * Log a custom event to Analytics
 */
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};
