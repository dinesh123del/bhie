/**
 * Environment Configuration
 * Validates and provides fallback defaults for all environment variables
 */

interface EnvConfig {
  API_URL: string;
  GOOGLE_CLIENT_ID: string;
  SENTRY_DSN: string;
  NODE_ENV: string;
  isProduction: boolean;
  isDevelopment: boolean;
}

// Default values for critical environment variables
const DEFAULTS = {
  API_URL: 'http://localhost:5001',
  GOOGLE_CLIENT_ID: '',
  SENTRY_DSN: '',
  NODE_ENV: 'development',
};

// Validation function
const validateEnv = (): { config: EnvConfig; warnings: string[] } => {
  const warnings: string[] = [];

  // Get values from import.meta.env (Vite) or process.env (Node)
  const getEnv = (key: string): string | undefined => {
    // Vite environment
    const viteKey = `VITE_${key}`;
    if (import.meta.env && import.meta.env[viteKey]) {
      return import.meta.env[viteKey];
    }
    // Direct access
    if (import.meta.env && import.meta.env[key]) {
      return import.meta.env[key];
    }
    return undefined;
  };

  // API URL validation
  let API_URL = getEnv('API_URL') || DEFAULTS.API_URL;
  if (!API_URL) {
    warnings.push('VITE_API_URL is not set. Using default: http://localhost:5001');
    API_URL = DEFAULTS.API_URL;
  }

  // Ensure API_URL doesn't end with /
  API_URL = API_URL.replace(/\/$/, '');

  // Google Client ID
  const GOOGLE_CLIENT_ID = getEnv('GOOGLE_CLIENT_ID') || DEFAULTS.GOOGLE_CLIENT_ID;
  if (!GOOGLE_CLIENT_ID) {
    warnings.push('VITE_GOOGLE_CLIENT_ID is not set. Google OAuth will not work.');
  }

  // Node Environment
  const NODE_ENV = getEnv('NODE_ENV') || DEFAULTS.NODE_ENV;

  // Sentry DSN
  const SENTRY_DSN = getEnv('SENTRY_DSN') || DEFAULTS.SENTRY_DSN;
  if (!SENTRY_DSN && NODE_ENV === 'production') {
    warnings.push('VITE_SENTRY_DSN is not set. Error tracking will be disabled.');
  }

  // Log warnings in development
  if (warnings.length > 0 && NODE_ENV === 'development') {
    console.warn('[ENV] Configuration warnings:');
    warnings.forEach(w => console.warn(`  - ${w}`));
  }

  return {
    config: {
      API_URL,
      GOOGLE_CLIENT_ID,
      SENTRY_DSN,
      NODE_ENV,
      isProduction: NODE_ENV === 'production',
      isDevelopment: NODE_ENV === 'development',
    },
    warnings,
  };
};

// Initialize and export
const { config, warnings } = validateEnv();

export const ENV = config;
export const ENV_WARNINGS = warnings;

// Helper to check if all critical env vars are present
export const isEnvValid = (): boolean => {
  return ENV.API_URL !== '';
};

// Log at startup
console.log('[ENV] Environment initialized:', {
  API_URL: ENV.API_URL,
  hasGoogleClientId: !!ENV.GOOGLE_CLIENT_ID,
  NODE_ENV: ENV.NODE_ENV,
});

export default ENV;
