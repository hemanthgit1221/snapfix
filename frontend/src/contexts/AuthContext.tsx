import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthResponse } from '../types';
import { authService } from '../services/authService';
import { rewardService } from '../services/rewardService';
import { updateApiClientToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  userPoints: number;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUserPoints: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [userPoints, setUserPoints] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const userData = await authService.getCurrentUser(storedToken);
          setUser(userData);
          setToken(storedToken);
          updateApiClientToken(storedToken); // Sync token with API client
          // Refresh user points on page load
          await refreshUserPoints();
        } catch (error) {
          console.error('Failed to validate token:', error);
          localStorage.removeItem('token');
          setToken(null);
          updateApiClientToken(null); // Clear token from API client
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('AuthContext: Attempting login for:', email);
      const response: AuthResponse = await authService.login(email, password);
      console.log('AuthContext: Login successful, token received:', response.token ? 'YES' : 'NO');
      setUser(response.user);
      setToken(response.token);
      localStorage.setItem('token', response.token);
      updateApiClientToken(response.token); // Sync token with API client
      console.log('AuthContext: Token stored and synced with API client');
      
      // Fetch user points after successful login
      await refreshUserPoints();
    } catch (error) {
      console.error('AuthContext: Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUserPoints = async () => {
    try {
      const response = await rewardService.getRewardStats();
      if (response.success) {
        setUserPoints(response.data.totalPoints || 0);
      }
    } catch (error) {
      console.error('Failed to refresh user points:', error);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setUserPoints(0);
    localStorage.removeItem('token');
    updateApiClientToken(null); // Clear token from API client
  };

  const value: AuthContextType = {
    user,
    token,
    userPoints,
    login,
    logout,
    refreshUserPoints,
    isLoading,
    isAuthenticated: !!user && !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
