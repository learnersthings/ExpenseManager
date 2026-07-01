import React from 'react';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

import { useThemeContext } from '../context/ThemeContext';
import BottomTabs from './BottomTabs';

export default function RootNavigator() {
  const { isDarkTheme } = useThemeContext();

  return (
    <NavigationContainer theme={isDarkTheme ? DarkTheme : DefaultTheme}>
      <StatusBar style={isDarkTheme ? 'light' : 'dark'} />
      <BottomTabs />
    </NavigationContainer>
  );
}
