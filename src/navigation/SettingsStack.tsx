import React from 'react';
import { View, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import SettingsScreen from '../screens/SettingsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CurrencyScreen from '../screens/CurrencyScreen';
import BudgetScreen from '../screens/BudgetScreen';

const Stack = createNativeStackNavigator();

export default function SettingsStack() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen 
        name="SettingsMain" 
        component={SettingsScreen} 
        options={{ 
          headerShown: true,
          headerTitle: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="settings" size={22} color={colors.text} style={{ marginRight: 8 }} />
              <Text style={{ color: colors.text, fontSize: 18, fontWeight: '600' }}>Settings</Text>
            </View>
          )
        }} 
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'User Profile' }} 
      />
      <Stack.Screen 
        name="Currency" 
        component={CurrencyScreen} 
        options={{ title: 'Select Currency' }} 
      />
      <Stack.Screen 
        name="Budget" 
        component={BudgetScreen} 
        options={{ title: 'Set Budget' }} 
      />
    </Stack.Navigator>
  );
}
