const normalizeApiBaseUrl = (value: string) => value.trim().replace(/\/+$/, '');
const PRODUCTION_API_BASE_URL = 'https://tripmate-production-dc44.up.railway.app/api';

export const getApiBaseUrl = () => {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL;
  if (typeof configuredBaseUrl === 'string' && configuredBaseUrl.trim() !== '') {
    return normalizeApiBaseUrl(configuredBaseUrl);
  }

  if (typeof window !== 'undefined') {
    const { hostname } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000/api';
    }

    return PRODUCTION_API_BASE_URL;
  }

  return PRODUCTION_API_BASE_URL;
};

export const API_BASE_URL = getApiBaseUrl();