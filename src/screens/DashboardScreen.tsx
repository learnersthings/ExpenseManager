import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '../context/ThemeContext';
import { useExpenseContext, Expense } from '../context/ExpenseContext';
import AddExpenseModal from '../components/AddExpenseModal';

export default function DashboardScreen() {
  const { colors } = useTheme();
  const { isDarkTheme } = useThemeContext();
  const { getCurrentMonthTotal, expenses, currency, monthlyBudget } = useExpenseContext();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const total = getCurrentMonthTotal();
  const currentMonthName = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  const handleOpenAddModal = () => {
    setSelectedExpense(null);
    setIsModalVisible(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsModalVisible(true);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Current Month Card */}
        <View style={[styles.card, { backgroundColor: colors.card, shadowColor: isDarkTheme ? '#00FFFF' : '#000' }]}>
          <Text style={styles.cardSubtitle}>{currentMonthName}</Text>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Total Expenses</Text>
          
          <Text style={[styles.totalAmount, { color: monthlyBudget > 0 && total > monthlyBudget ? '#ff4444' : colors.primary }]}>
            {currency}{total.toFixed(2)}
            {monthlyBudget > 0 && <Text style={styles.budgetAmount}> / {currency}{monthlyBudget}</Text>}
          </Text>

          {monthlyBudget > 0 && (
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Budget Progress</Text>
                <Text style={styles.progressPercent}>
                  {String(((total / monthlyBudget) * 100).toFixed(2)).padStart(5, '0')}%
                </Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={[
                  styles.progressBar, 
                  { 
                    backgroundColor: total > monthlyBudget ? '#ff4444' : colors.primary,
                    width: `${Math.min((total / monthlyBudget) * 100, 100)}%` 
                  }
                ]} />
              </View>
            </View>
          )}
        </View>

        {/* Recent Expenses List Preview */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</Text>
        
        {expenses.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No expenses yet. Add one!</Text>
          </View>
        ) : (
          expenses.slice(0, 5).map((exp) => (
            <TouchableOpacity 
              key={exp.id} 
              style={[styles.expenseRow, { backgroundColor: colors.card }]}
              onPress={() => handleEditExpense(exp)}
            >
              <View>
                <Text style={[styles.expenseDesc, { color: colors.text }]}>{exp.description}</Text>
                <Text style={styles.expenseDate}>{new Date(exp.date).toLocaleDateString()}</Text>
              </View>
              <Text style={[styles.expenseAmount, { color: '#ff4444' }]}>-{currency}{exp.amount.toFixed(2)}</Text>
            </TouchableOpacity>
          ))
        )}

      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
        onPress={handleOpenAddModal}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      <AddExpenseModal 
        visible={isModalVisible} 
        onClose={() => setIsModalVisible(false)} 
        expenseToEdit={selectedExpense}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100, // padding for FAB
  },
  card: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 30,
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  totalAmount: {
    fontSize: 42,
    fontWeight: 'bold',
  },
  budgetAmount: {
    fontSize: 20,
    color: '#888',
  },
  progressSection: {
    width: '100%',
    marginTop: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressPercent: {
    fontSize: 12,
    color: '#888',
    fontWeight: 'bold',
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#888',
    fontSize: 16,
    fontStyle: 'italic',
  },
  expenseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  expenseDesc: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  expenseDate: {
    fontSize: 12,
    color: '#888',
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
