export const API = import.meta.env.VITE_API_URL || "https://bhie-api.onrender.com";

if (!API) {
  console.error("VITE_API_URL is undefined. API calls may fail.");
}

console.log("API URL:", API);

const envApiUrl = (API || '').trim();

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
  : window.location.origin;

export const apiRoute = (pathname: string): string => {
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${apiBaseUrl}${normalizedPath}`;
};

export const backendUrl = (pathname: string): string => {
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${backendOrigin}${normalizedPath}`;
};
