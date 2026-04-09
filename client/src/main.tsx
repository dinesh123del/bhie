import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

// Comment out potentially blocking initializations
// import './i18n'
// import { initTelemetry } from './utils/telemetry'
// initTelemetry();

import { GoogleOAuthProvider } from '@react-oauth/google'
import { ENV } from './config/env'

const GOOGLE_CLIENT_ID = ENV.GOOGLE_CLIENT_ID;

import * as Sentry from '@sentry/react';

// Initialize Sentry for global error/exception tracking
const isSentryEnabled = ENV.SENTRY_DSN && 
  !ENV.SENTRY_DSN.includes('your-sentry-dsn') && 
  ENV.SENTRY_DSN.startsWith('https://');

if (isSentryEnabled) {
  Sentry.init({
    dsn: ENV.SENTRY_DSN,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    // Capture 100% of the transactions in development, lower in production
    tracesSampleRate: 1.0,
    // Capture 10% of sessions for replay, but 100% of sessions with errors
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    environment: import.meta.env.MODE,
  });
}

// ── Global Error Boundary ─────────────────────────────────────
class GlobalErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null; errorInfo: React.ErrorInfo | null; retryCount: number }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, retryCount: 0 };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('🚨 GlobalErrorBoundary caught:', error);
    console.error('📋 Component stack:', info.componentStack);

    // Report to Sentry
    Sentry.captureException(error, {
      contexts: {
        react: { componentStack: info.componentStack }
      }
    });

    // Log to localStorage for debugging
    try {
      const errorLog = {
        message: error.message,
        stack: error.stack,
        componentStack: info.componentStack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      };
      localStorage.setItem('last_error', JSON.stringify(errorLog));
    } catch {
      // Ignore localStorage errors
    }

    this.setState({ errorInfo: info });
  }

  handleRetry = () => {
    this.setState(prev => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prev.retryCount + 1
    }));
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const { error, retryCount } = this.state;
      const isRetryable = retryCount < 3;

      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
          color: '#ffffff',
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px',
            boxShadow: '0 10px 40px rgba(102, 126, 234, 0.3)'
          }}>
            <span style={{ fontSize: '36px', fontWeight: 'bold' }}>!</span>
          </div>

          <h2 style={{
            fontSize: '28px',
            fontWeight: '700',
            marginBottom: '12px',
            background: 'linear-gradient(135deg, #fff 0%, #a8b2d1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Something went wrong
          </h2>

          <p style={{
            color: '#8892b0',
            marginBottom: '32px',
            maxWidth: '400px',
            lineHeight: '1.6',
            fontSize: '16px'
          }}>
            {error?.message || 'An unexpected error occurred. We\'ve logged this issue and our team will look into it.'}
          </p>

          <div style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            {isRetryable && (
              <button
                onClick={this.handleRetry}
                style={{
                  padding: '14px 28px',
                  background: 'transparent',
                  color: '#64ffda',
                  border: '1px solid #64ffda',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(100, 255, 218, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                Try Again ({3 - retryCount} left)
              </button>
            )}

            <button
              onClick={this.handleReload}
              style={{
                padding: '14px 28px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
              }}
            >
              Reload Application
            </button>
          </div>

          <p style={{
            marginTop: '32px',
            fontSize: '12px',
            color: '#555',
            fontFamily: 'monospace'
          }}>
            Error ID: {Math.random().toString(36).substring(7).toUpperCase()}
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <React.Suspense fallback={<div className="bg-black min-h-screen" />}>
            <App />
          </React.Suspense>
        </BrowserRouter>
      </GoogleOAuthProvider>
    </GlobalErrorBoundary>
  </React.StrictMode>,
)
