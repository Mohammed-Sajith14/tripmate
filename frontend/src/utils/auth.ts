// Authentication utility functions

const API_BASE_URL = 'http://localhost:5000/api';

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
  localStorage.removeItem('token');
  localStorage.removeItem('user');
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
