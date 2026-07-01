import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useThemeContext } from '../context/ThemeContext';

export default function SettingsScreen() {
  const { colors } = useTheme();
  const { isDarkTheme, toggleTheme } = useThemeContext();

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
  },
  text: {
    fontSize: 18,
    fontWeight: '500',
  },
});
