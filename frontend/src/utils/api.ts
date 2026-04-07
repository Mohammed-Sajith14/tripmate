const normalizeApiBaseUrl = (value: string) => value.trim().replace(/\/+$/, '');

export const getApiBaseUrl = () => {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL;
  if (typeof configuredBaseUrl === 'string' && configuredBaseUrl.trim() !== '') {
    return normalizeApiBaseUrl(configuredBaseUrl);
  }

  if (typeof window !== 'undefined') {
    const { hostname, origin } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000/api';
    }

    return `${normalizeApiBaseUrl(origin)}/api`;
  }

  return 'http://localhost:5000/api';
};

export const API_BASE_URL = getApiBaseUrl();