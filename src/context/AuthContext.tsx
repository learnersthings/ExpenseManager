import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  name?: string;
  email: string;
  password?: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  login: (email?: string, password?: string) => Promise<void>;
  register: (name?: string, email?: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (newName: string) => Promise<void>;
  changePassword: (oldPassword?: string, newPassword?: string) => Promise<void>;
  isAuthLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  user: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  updateProfile: async () => {},
  changePassword: async () => {},
  isAuthLoading: true,
});

export const useAuthContext = () => useContext(AuthContext);

const AUTH_KEY = '@app_is_logged_in';
const USER_CREDENTIALS_KEY = '@app_user_credentials';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const storedAuth = await AsyncStorage.getItem(AUTH_KEY);
        if (storedAuth === 'true') {
          setIsLoggedIn(true);
          const storedUser = await AsyncStorage.getItem(USER_CREDENTIALS_KEY);
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        }
      } catch (e) {
        console.error('Failed to load auth state', e);
      } finally {
        setIsAuthLoading(false);
      }
    };
    loadAuthState();
  }, []);

  const register = async (name?: string, email?: string, password?: string) => {
    if (!name || !email || !password) {
      throw new Error('Please fill in all details.');
    }
    const newUser = { name, email: email.toLowerCase(), password };
    await AsyncStorage.setItem(USER_CREDENTIALS_KEY, JSON.stringify(newUser));
    
    // Auto login after register
    await AsyncStorage.setItem(AUTH_KEY, 'true');
    setUser(newUser);
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
      setUser(storedUser);
      setIsLoggedIn(true);
    } else {
      throw new Error('Incorrect email or password.');
    }
  };

  const updateProfile = async (newName: string) => {
    if (!newName.trim()) throw new Error('Name cannot be empty.');
    if (!user) throw new Error('User not logged in.');

    const updatedUser = { ...user, name: newName };
    await AsyncStorage.setItem(USER_CREDENTIALS_KEY, JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const changePassword = async (oldPassword?: string, newPassword?: string) => {
    if (!oldPassword || !newPassword) {
      throw new Error('Please enter both old and new passwords.');
    }
    if (!user) {
      throw new Error('User not logged in.');
    }

    const storedData = await AsyncStorage.getItem(USER_CREDENTIALS_KEY);
    if (!storedData) throw new Error('User data corrupted.');
    
    const storedUser = JSON.parse(storedData);
    if (storedUser.password !== oldPassword) {
      throw new Error('Incorrect current password.');
    }

    const updatedUser = { ...storedUser, password: newPassword };
    await AsyncStorage.setItem(USER_CREDENTIALS_KEY, JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(AUTH_KEY);
      setUser(null);
      setIsLoggedIn(false);
    } catch (e) {
      console.error('Failed to clear auth state', e);
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, register, logout, updateProfile, changePassword, isAuthLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
