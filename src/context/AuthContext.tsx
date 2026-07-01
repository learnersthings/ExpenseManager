import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  isLoggedIn: boolean;
  login: (email?: string, password?: string) => Promise<void>;
  register: (email?: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  isAuthLoading: true,
});

export const useAuthContext = () => useContext(AuthContext);

const AUTH_KEY = '@app_is_logged_in';
const USER_CREDENTIALS_KEY = '@app_user_credentials';

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

  const register = async (email?: string, password?: string) => {
    if (!email || !password) {
      throw new Error('Please fill in all details.');
    }
    const user = { email: email.toLowerCase(), password };
    await AsyncStorage.setItem(USER_CREDENTIALS_KEY, JSON.stringify(user));
    
    // Auto login after register
    await AsyncStorage.setItem(AUTH_KEY, 'true');
    setIsLoggedIn(true);
  };

  const login = async (email?: string, password?: string) => {
    if (!email || !password) {
      throw new Error('Please enter both email and password.');
    }

    const storedData = await AsyncStorage.getItem(USER_CREDENTIALS_KEY);
    if (!storedData) {
      throw new Error('Account does not exist. Please sign up first.');
    }

    const storedUser = JSON.parse(storedData);
    if (storedUser.email === email.toLowerCase() && storedUser.password === password) {
      await AsyncStorage.setItem(AUTH_KEY, 'true');
      setIsLoggedIn(true);
    } else {
      throw new Error('Incorrect email or password.');
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
    <AuthContext.Provider value={{ isLoggedIn, login, register, logout, isAuthLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
