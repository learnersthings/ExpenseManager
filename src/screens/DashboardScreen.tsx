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
  const { getCurrentMonthTotal, getPreviousMonthTotal, expenses, currency, monthlyBudget } = useExpenseContext();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [displayCount, setDisplayCount] = useState(5);

  const total = getCurrentMonthTotal();
  const prevTotal = getPreviousMonthTotal();
  const currentMonthName = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  // Calculate percentage diff
  let diffPercent = null;
  let diffColor = colors.text;
  let diffPrefix = '';
  
  if (prevTotal > 0) {
    const diff = ((prevTotal - total) / prevTotal) * 100;
    diffPercent = Math.abs(diff).toFixed(1);
    if (diff > 0) {
      // Saved money
      diffColor = '#00C851'; // Green
      diffPrefix = '+';
    } else if (diff < 0) {
      // Spent more
      diffColor = '#ff4444'; // Red
      diffPrefix = '-';
    } else {
      diffColor = '#888';
      diffPrefix = '';
    }
  }

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
          <View style={styles.cardHeader}>
            <Text style={styles.cardSubtitle}>{currentMonthName}</Text>
            {diffPercent !== null && (
              <View style={[styles.diffBadge, { backgroundColor: diffPrefix === '+' ? 'rgba(0,200,81,0.1)' : diffPrefix === '-' ? 'rgba(255,68,68,0.1)' : 'rgba(136,136,136,0.1)' }]}>
                <Ionicons 
                  name={diffPrefix === '+' ? "trending-down" : diffPrefix === '-' ? "trending-up" : "remove"} 
                  size={14} 
                  color={diffColor} 
                  style={{ marginRight: 4 }}
                />
                <Text style={[styles.diffText, { color: diffColor }]}>
                  {diffPrefix}{diffPercent}%
                </Text>
              </View>
            )}
          </View>

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
          <>
            {expenses.slice(0, displayCount).map((exp) => (
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
            ))}
            
            {expenses.length > displayCount && (
              <TouchableOpacity 
                style={[styles.loadMoreButton, { backgroundColor: isDarkTheme ? '#2a2a2a' : '#f0f0f0' }]} 
                onPress={() => setDisplayCount(prev => prev + 5)}
              >
                <Text style={[styles.loadMoreText, { color: colors.primary }]}>Load More</Text>
                <Ionicons name="chevron-down" size={16} color={colors.primary} />
              </TouchableOpacity>
            )}
          </>
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
    marginBottom: 30,
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
  },
  diffBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  diffText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  totalAmount: {
    fontSize: 42,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
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
  loadMoreButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 12,
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 4,
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
