import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, AuthTokens, LoginResponse, RegisterResponse } from '../types/auth.types';
import { authService } from '../services/auth.service';
import webSocketService from '../services/websocket.service';

interface AuthContextType {
  user: User | null;
  tokens: AuthTokens | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; firstName?: string; lastName?: string }) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing tokens on app start
    const savedTokens = localStorage.getItem('auth_tokens');
    if (savedTokens) {
      try {
        const parsedTokens: AuthTokens = JSON.parse(savedTokens);
        setTokens(parsedTokens);
        // Fetch user profile
        fetchProfile();
      } catch (error) {
        console.error('Error parsing saved tokens:', error);
        localStorage.removeItem('auth_tokens');
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchProfile = async () => {
    try {
      const profile = await authService.getProfile();
      console.log('Fetched user profile:', profile); // Debug log
      setUser(profile);
      // Save user profile to localStorage for API requests
      localStorage.setItem('user_profile', JSON.stringify(profile));
      
      // Connect to WebSocket when user profile is loaded
      if (profile?.id) {
        webSocketService.connect(profile.id);
        console.log('User profile loaded and WebSocket connected:', profile);
      }
    } catch (error: any) {
      // Only force logout if it's definitively an auth error (401)
      const status = error?.response?.status;
      console.error('Error fetching profile:', error);
      if (status === 401) {
        logout();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response: LoginResponse = await authService.login({ email, password });
      console.log('Login response (using user directly):', response); // Debug log
      setTokens(response.tokens);
      localStorage.setItem('auth_tokens', JSON.stringify(response.tokens));
      // Use returned user immediately to avoid race / extra network call dependency
      setUser(response.user as User);
      // Save user profile to localStorage for API requests
      localStorage.setItem('user_profile', JSON.stringify(response.user));
      // Optionally refresh profile in background (non-blocking)
      fetchProfile();
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: { email: string; password: string; firstName?: string; lastName?: string }) => {
    try {
      const response: RegisterResponse = await authService.register(data);
      console.log('Register response (using user directly):', response); // Debug log
      setTokens(response.tokens);
      localStorage.setItem('auth_tokens', JSON.stringify(response.tokens));
      setUser(response.user as User);
      // Background refresh (in case server enriches profile later)
      fetchProfile();
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setTokens(null);
      localStorage.removeItem('auth_tokens');
      localStorage.removeItem('user_profile');
      
      // Disconnect WebSocket when logging out
      webSocketService.disconnect();
      console.log('User logged out and WebSocket disconnected');
    }
  };

  const value: AuthContextType = {
    user,
    tokens,
    login,
    register,
    logout,
    isLoading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};