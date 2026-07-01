import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useThemeContext } from '../context/ThemeContext';
import { useAuthContext } from '../context/AuthContext';
import { useExpenseContext } from '../context/ExpenseContext';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { isDarkTheme, toggleTheme } = useThemeContext();
  const { logout } = useAuthContext();
  const { currency } = useExpenseContext();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      
      <TouchableOpacity 
        style={[styles.row, { backgroundColor: colors.card }]}
        onPress={() => navigation.navigate('Profile')}
      >
        <Text style={[styles.text, { color: colors.text }]}>User Profile</Text>
        <Ionicons name="chevron-forward" size={20} color={colors.text} />
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.row, { backgroundColor: colors.card, marginTop: 10 }]}
        onPress={() => navigation.navigate('Currency')}
      >
        <Text style={[styles.text, { color: colors.text }]}>Currency</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ color: colors.primary, fontSize: 18, fontWeight: 'bold', marginRight: 8 }}>{currency}</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.text} />
        </View>
      </TouchableOpacity>

      <View style={[styles.row, { backgroundColor: colors.card, marginTop: 10 }]}>
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
    marginBottom: 10,
  },
  text: {
    fontSize: 18,
    fontWeight: '500',
  },
  logoutButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
