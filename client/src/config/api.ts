const envApiUrl = (import.meta.env.VITE_API_URL || '').trim();

if (!import.meta.env.DEV && !envApiUrl) {
  throw new Error('VITE_API_URL is required in production');
}

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');
const normalizeApiBaseUrl = (value: string): string => {
  if (!value) {
    return '/api';
  }

  const trimmed = trimTrailingSlash(value);
  return /\/api$/i.test(trimmed) ? trimmed : `${trimmed}/api`;
};

export const apiBaseUrl = normalizeApiBaseUrl(envApiUrl);

export const backendOrigin = envApiUrl
  ? trimTrailingSlash(envApiUrl).replace(/\/api$/i, '')
  : import.meta.env.DEV
    ? 'http://localhost:5001'
    : window.location.origin;

export const apiRoute = (pathname: string): string => {
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${apiBaseUrl}${normalizedPath}`;
};

export const backendUrl = (pathname: string): string => {
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${backendOrigin}${normalizedPath}`;
};
