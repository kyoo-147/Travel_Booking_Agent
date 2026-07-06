import axios, { AxiosResponse } from 'axios';
import {
  User,
  AuthTokens,
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  RegisterResponse,
  RefreshTokenResponse
} from '../types'; // hoặc '../types/auth.types'

// Use proxy-aware URL - Vite proxy handles routing to backend
const API_BASE_URL = '/api/v1'; // Use relative URL so Vite proxy handles it

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add auth token (skip for login/register endpoints)
api.interceptors.request.use((config) => {
  // Skip adding token for auth endpoints
  const isAuthEndpoint = config.url?.includes('/auth/login') || 
                         config.url?.includes('/auth/register') ||
                         config.url?.includes('/auth/refresh');
  
  if (isAuthEndpoint) {
    console.log('Auth endpoint detected, skipping token:', config.url);
    return config;
  }
  
  const tokens = localStorage.getItem('auth_tokens');
  const user = localStorage.getItem('user_profile');
  if (tokens) {
    try {
      const parsedTokens: AuthTokens = JSON.parse(tokens);
      config.headers.Authorization = `Bearer ${parsedTokens.accessToken}`;
      
      // Add user ID header for backend compatibility
      if (user) {
        const parsedUser = JSON.parse(user);
        config.headers['user-id'] = parsedUser.id;
      }
      
      console.log('Added Authorization header for:', config.url);
    } catch (error) {
      console.error('Error parsing auth tokens:', error);
    }
  }
  return config;
});

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const tokens = localStorage.getItem('auth_tokens');
        if (tokens) {
          const parsedTokens: AuthTokens = JSON.parse(tokens);
          if (parsedTokens.refreshToken) {
            const newTokens = await refreshToken(parsedTokens.refreshToken);
            localStorage.setItem('auth_tokens', JSON.stringify(newTokens));
            
            // Retry the original request
            originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        console.error('Token refresh failed:', refreshError);
        localStorage.removeItem('auth_tokens');
        // Only redirect if we're not already on auth pages
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

const refreshToken = async (refreshToken: string): Promise<AuthTokens> => {
  const response: AxiosResponse<AuthTokens> = await axios.post(
    `${API_BASE_URL}/auth/refresh`,
    { refreshToken },
    {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    }
  );
  return response.data;
};

export const authService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    // Clear any existing tokens before login attempt
    localStorage.removeItem('auth_tokens');
    console.log('=== LOGIN DEBUG ===');
    console.log('Request URL:', `/auth/login`);
    console.log('Request data:', data);
    console.log('API_BASE_URL:', '/api/v1');
    console.log('==================');
    const response: AxiosResponse<LoginResponse> = await api.post('/auth/login', data);
    console.log('Login response status:', response.status);
    console.log('Login response data:', response.data);
    return response.data;
  },

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    // Clear any existing tokens before register attempt
    localStorage.removeItem('auth_tokens');
    const response: AxiosResponse<RegisterResponse> = await api.post('/auth/register', data);
    return response.data;
  },

  async getProfile(): Promise<User> {
    // No need to manually add headers, the request interceptor will handle it
    const response: AxiosResponse<User> = await api.get('/auth/profile');
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Even if logout fails on server, we clear local storage
      console.error('Logout error:', error);
    } finally {
      this.clearTokens();
    }
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await api.post('/auth/reset-password', {
      token,
      newPassword,
    });
  },

  // Helper methods for token management
  getStoredTokens(): AuthTokens | null {
    try {
      const tokens = localStorage.getItem('auth_tokens');
      return tokens ? JSON.parse(tokens) : null;
    } catch (error) {
      console.error('Error parsing stored tokens:', error);
      localStorage.removeItem('auth_tokens');
      return null;
    }
  },

  setTokens(tokens: AuthTokens): void {
    localStorage.setItem('auth_tokens', JSON.stringify(tokens));
  },

  clearTokens(): void {
    localStorage.removeItem('auth_tokens');
  },

  isAuthenticated(): boolean {
    const tokens = this.getStoredTokens();
    return !!tokens?.accessToken;
  },
};