import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  isLoggedIn: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  isAuthLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  login: async () => {},
  logout: async () => {},
  isAuthLoading: true,
});

export const useAuthContext = () => useContext(AuthContext);

const AUTH_KEY = '@app_is_logged_in';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const storedAuth = await AsyncStorage.getItem(AUTH_KEY);
        if (storedAuth === 'true') {
          setIsLoggedIn(true);
        }
      } catch (e) {
        console.error('Failed to load auth state', e);
      } finally {
        setIsAuthLoading(false);
      }
    };
    loadAuthState();
  }, []);

  const login = async () => {
    try {
      await AsyncStorage.setItem(AUTH_KEY, 'true');
      setIsLoggedIn(true);
    } catch (e) {
      console.error('Failed to save auth state', e);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(AUTH_KEY);
      setIsLoggedIn(false);
    } catch (e) {
      console.error('Failed to clear auth state', e);
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, isAuthLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
