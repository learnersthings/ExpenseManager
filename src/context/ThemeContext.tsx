import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthContext } from './AuthContext';

interface ThemeContextType {
  isDarkTheme: boolean;
  toggleTheme: () => void;
  refreshTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType>({
  isDarkTheme: true,
  toggleTheme: () => {},
  refreshTheme: async () => {},
});

export const useThemeContext = () => useContext(ThemeContext);

const THEME_KEY = '@app_theme_is_dark';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const { user } = useAuthContext();
  const themeKey = user ? `${THEME_KEY}_${user.email}` : THEME_KEY;
  
  // Default to system theme or true (dark) if system is unavailable
  const [isDarkTheme, setIsDarkTheme] = useState(systemColorScheme === 'dark' || systemColorScheme == null);
  const [isReady, setIsReady] = useState(false);

  const loadTheme = async () => {
    try {
      const storedTheme = await AsyncStorage.getItem(themeKey);
      if (storedTheme !== null) {
        setIsDarkTheme(JSON.parse(storedTheme));
      } else {
        setIsDarkTheme(systemColorScheme === 'dark' || systemColorScheme == null);
      }
    } catch (e) {
      console.error('Failed to load theme.', e);
    } finally {
      setIsReady(true);
    }
  };

  useEffect(() => {
    loadTheme();
  }, [themeKey]);

  const toggleTheme = async () => {
    const newTheme = !isDarkTheme;
    setIsDarkTheme(newTheme);
    await AsyncStorage.setItem(themeKey, JSON.stringify(newTheme));
  };

  if (!isReady) return null;

  return (
    <ThemeContext.Provider value={{ isDarkTheme, toggleTheme, refreshTheme: loadTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

