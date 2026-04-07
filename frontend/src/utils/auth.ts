// Authentication utility functions

const resolveApiBaseUrl = () => {
  const configuredBaseUrl = (import.meta as any)?.env?.VITE_API_BASE_URL;
  if (typeof configuredBaseUrl === 'string' && configuredBaseUrl.trim() !== '') {
    return configuredBaseUrl.trim().replace(/\/+$/, '');
  }

  if (typeof window !== 'undefined') {
    const { hostname, origin } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000/api';
    }

    return `${origin.replace(/\/+$/, '')}/api`;
  }

  return 'http://localhost:5000/api';
};

export const API_BASE_URL = resolveApiBaseUrl();
export const SOCKET_BASE_URL = API_BASE_URL.replace(/\/api$/, '');

const decodeBase64Url = (value: string) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  return atob(padded);
};

export const clearAuthSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const isTokenExpired = (token: string | null) => {
  if (!token) {
    return true;
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return true;
  }

  try {
    const payload = JSON.parse(decodeBase64Url(parts[1]));
    if (typeof payload.exp !== 'number') {
      return false;
    }

    return payload.exp * 1000 <= Date.now();
  } catch (error) {
    console.error('Error decoding auth token:', error);
    return true;
  }
};

export const getValidAuthToken = () => {
  const token = getAuthToken();
  if (isTokenExpired(token)) {
    clearAuthSession();
    return null;
  }

  return token;
};

// Get stored user data
export const getStoredUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error parsing stored user:', error);
    return null;
  }
};

// Get stored auth token
export const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getAuthToken() && !!getStoredUser();
};

// Get auth headers for API requests
export const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Logout user
export const logout = () => {
  clearAuthSession();
  window.location.href = '/'; // Redirect to landing page
};

// API helper function
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

// Fetch current user profile from backend
export const fetchUserProfile = async () => {
  try {
    const data = await apiRequest('/auth/me');
    if (data.status === 'success') {
      // Update localStorage with fresh data
      localStorage.setItem('user', JSON.stringify(data.data.user));
      return data.data.user;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};
