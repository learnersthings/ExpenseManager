import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Switch } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useThemeContext } from '../context/ThemeContext';
import { useExpenseContext } from '../context/ExpenseContext';

export default function BudgetScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { isDarkTheme } = useThemeContext();
  const { currency, monthlyBudget, yearlyBudget, updateBudgets, showMonthlyBudget, showYearlyBudget, toggleShowMonthlyBudget, toggleShowYearlyBudget } = useExpenseContext();

  const [monthVal, setMonthVal] = useState(monthlyBudget > 0 ? monthlyBudget.toString() : '');
  const [yearVal, setYearVal] = useState(yearlyBudget > 0 ? yearlyBudget.toString() : '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const placeholderColor = isDarkTheme ? '#888' : '#aaa';

  const handleSave = async () => {
    setError('');
    setSuccess('');

    const m = Number(monthVal);
    const y = Number(yearVal);

    if (isNaN(m) || isNaN(y) || m < 0 || y < 0) {
      setError('Please enter valid positive numbers.');
      return;
    }

    try {
      await updateBudgets(m, y);
      setSuccess('Budgets saved successfully!');
      setTimeout(() => navigation.goBack(), 1500);
    } catch (e) {
      setError('Failed to save budgets.');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView 
        style={[styles.container, { backgroundColor: colors.background }]} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          
          <View style={[styles.card, { backgroundColor: colors.card, shadowColor: isDarkTheme ? '#00FFFF' : '#000' }]}>
            <Text style={[styles.title, { color: colors.text }]}>Set Your Budgets</Text>
            <Text style={styles.subtitle}>These limits will help you track your spending.</Text>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            {success ? <Text style={styles.successText}>{success}</Text> : null}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Monthly Budget ({currency})</Text>
              <TextInput
                style={[styles.input, { backgroundColor: isDarkTheme ? '#1e1e1e' : '#f5f5f5', color: colors.text, borderColor: isDarkTheme ? '#333' : '#e0e0e0' }]}
                placeholder="e.g. 500"
                placeholderTextColor={placeholderColor}
                keyboardType="numeric"
                value={monthVal}
                onChangeText={(t) => { setMonthVal(t); setError(''); setSuccess(''); }}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Yearly Budget ({currency})</Text>
              <TextInput
                style={[styles.input, { backgroundColor: isDarkTheme ? '#1e1e1e' : '#f5f5f5', color: colors.text, borderColor: isDarkTheme ? '#333' : '#e0e0e0' }]}
                placeholder="e.g. 6000"
                placeholderTextColor={placeholderColor}
                keyboardType="numeric"
                value={yearVal}
                onChangeText={(t) => { setYearVal(t); setError(''); setSuccess(''); }}
              />
            </View>

            <View style={styles.toggleContainer}>
              <Text style={[styles.label, { color: colors.text, marginBottom: 0 }]}>Show Monthly Budget on Dashboard</Text>
              <Switch
                trackColor={{ false: '#767577', true: colors.primary }}
                thumbColor={showMonthlyBudget ? '#ffffff' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={toggleShowMonthlyBudget}
                value={showMonthlyBudget}
              />
            </View>

            <View style={styles.toggleContainer}>
              <Text style={[styles.label, { color: colors.text, marginBottom: 0 }]}>Show Yearly Budget on Dashboard</Text>
              <Switch
                trackColor={{ false: '#767577', true: colors.primary }}
                thumbColor={showYearlyBudget ? '#ffffff' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={toggleShowYearlyBudget}
                value={showYearlyBudget}
              />
            </View>

            <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary }]} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Budgets</Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: 20,
  },
  card: {
    borderRadius: 16,
    padding: 24,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  saveButton: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#ff4444',
    marginBottom: 16,
    fontWeight: '600',
  },
  successText: {
    color: '#00C851',
    marginBottom: 16,
    fontWeight: '600',
  },
});
