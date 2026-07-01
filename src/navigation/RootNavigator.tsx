import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

import { useThemeContext } from '../context/ThemeContext';
import { useAuthContext } from '../context/AuthContext';
import BottomTabs from './BottomTabs';
import AuthStack from './AuthStack';

export default function RootNavigator() {
  const { isDarkTheme } = useThemeContext();
  const { isLoggedIn, isAuthLoading } = useAuthContext();

  if (isAuthLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: isDarkTheme ? '#121212' : '#ffffff' }}>
        <ActivityIndicator size="large" color={isDarkTheme ? '#00FFFF' : '#0000ff'} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={isDarkTheme ? DarkTheme : DefaultTheme}>
      <StatusBar style={isDarkTheme ? 'light' : 'dark'} />
      {isLoggedIn ? <BottomTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}
