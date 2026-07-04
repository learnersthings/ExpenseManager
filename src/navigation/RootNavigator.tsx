import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

import { useThemeContext } from '../context/ThemeContext';
import { useAuthContext } from '../context/AuthContext';
import BottomTabs from './BottomTabs';
import AuthStack from './AuthStack';

export default function RootNavigator() {
  const { isDarkTheme, accentColor } = useThemeContext();
  const { isLoggedIn, isAuthLoading } = useAuthContext();

  const CustomDarkTheme = {
    ...DarkTheme,
    colors: { ...DarkTheme.colors, primary: accentColor },
  };

  const CustomLightTheme = {
    ...DefaultTheme,
    colors: { ...DefaultTheme.colors, primary: accentColor },
  };

  if (isAuthLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: isDarkTheme ? '#121212' : '#ffffff' }}>
        <ActivityIndicator size="large" color={accentColor} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={isDarkTheme ? CustomDarkTheme : CustomLightTheme}>
      <StatusBar style={isDarkTheme ? 'light' : 'dark'} />
      {isLoggedIn ? <BottomTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}

