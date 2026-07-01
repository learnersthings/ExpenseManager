import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useThemeContext } from '../context/ThemeContext';
import { useAuthContext } from '../context/AuthContext';

export default function SettingsScreen() {
  const { colors } = useTheme();
  const { isDarkTheme, toggleTheme } = useThemeContext();
  const { logout } = useAuthContext();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.row, { backgroundColor: colors.card }]}>
        <Text style={[styles.text, { color: colors.text }]}>Dark Mode</Text>
        <Switch
          trackColor={{ false: '#767577', true: colors.primary }}
          thumbColor={isDarkTheme ? '#ffffff' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleTheme}
          value={isDarkTheme}
        />
      </View>

      <TouchableOpacity 
        style={[styles.logoutButton, { backgroundColor: '#ff4444' }]} 
        onPress={logout}
      >
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    fontWeight: '500',
  },
  logoutButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
