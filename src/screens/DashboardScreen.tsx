import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Alert, TextInput, Platform, ActivityIndicator } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '../context/ThemeContext';
import { useExpenseContext, Expense } from '../context/ExpenseContext';
import AddExpenseModal from '../components/AddExpenseModal';
import FilterModal from '../components/FilterModal';
import { formatAmount } from '../utils/format';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { generateDashboardPDFHTML } from '../utils/pdfGenerator';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';

export default function DashboardScreen() {
  const { colors } = useTheme();
  const { isDarkTheme } = useThemeContext();
  const { getCurrentMonthTotal, getPreviousMonthTotal, expenses, categories, paymentModes, currency, monthlyBudget, yearlyBudget, bulkDeleteExpenses, showMonthlyBudget, showYearlyBudget, downloadPathUri } = useExpenseContext();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [displayCount, setDisplayCount] = useState(10);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedExpenseIds, setSelectedExpenseIds] = useState<string[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<number[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedPaymentModeIds, setSelectedPaymentModeIds] = useState<string[]>([]);

  // Compute available filter options dynamically from expenses
  const availableYears = useMemo(() => {
    const years = new Set(expenses.map(e => new Date(e.date).getFullYear()));
    return Array.from(years).sort((a, b) => b - a);
  }, [expenses]);

  const availableMonths = useMemo(() => {
    const months = new Set(expenses.map(e => new Date(e.date).getMonth()));
    return Array.from(months).sort((a, b) => a - b);
  }, [expenses]);

  const availableCategories = useMemo(() => {
    const usedIds = new Set(expenses.map(e => e.categoryId).filter(Boolean));
    return categories.filter(c => usedIds.has(c.id));
  }, [expenses, categories]);

  const availablePaymentModes = useMemo(() => {
    const usedIds = new Set(expenses.map(e => e.paymentModeId).filter(Boolean));
    return paymentModes.filter(p => usedIds.has(p.id));
  }, [expenses, paymentModes]);

  // Derived filtered expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      // Filter by Search Query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const cat = categories.find(c => c.id === exp.categoryId);
        const pMode = paymentModes.find(m => m.id === exp.paymentModeId);

        const matchDesc = exp.description.toLowerCase().includes(query);
        const matchAmt = formatAmount(exp.amount).includes(query);
        const matchCat = cat && cat.name.toLowerCase().includes(query);
        const matchMode = pMode && pMode.name.toLowerCase().includes(query);
        const matchDate = new Date(exp.date).toLocaleDateString().toLowerCase().includes(query);

        if (!matchDesc && !matchAmt && !matchCat && !matchMode && !matchDate) {
          return false;
        }
      }

      // Filter by Year
      const expYear = new Date(exp.date).getFullYear();
      if (selectedYears.length > 0 && !selectedYears.includes(expYear)) {
        return false;
      }

      // Filter by Month
      const expMonth = new Date(exp.date).getMonth();
      if (selectedMonths.length > 0 && !selectedMonths.includes(expMonth)) {
        return false;
      }

      // Filter by Category
      if (selectedCategoryIds.length > 0 && (!exp.categoryId || !selectedCategoryIds.includes(exp.categoryId))) {
        return false;
      }

      // Filter by Payment Mode
      if (selectedPaymentModeIds.length > 0 && (!exp.paymentModeId || !selectedPaymentModeIds.includes(exp.paymentModeId))) {
        return false;
      }

      return true;
    });
  }, [expenses, searchQuery, selectedYears, selectedMonths, selectedCategoryIds, selectedPaymentModeIds, categories, paymentModes]);

  const total = getCurrentMonthTotal();
  const prevTotal = getPreviousMonthTotal();
  const currentMonthName = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  const currentYear = new Date().getFullYear();
  const currentYearTotal = expenses
    .filter(exp => new Date(exp.date).getFullYear() === currentYear)
    .reduce((sum, exp) => sum + exp.amount, 0);

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

  const handleRowPress = (exp: Expense) => {
    if (isSelectMode) {
      if (selectedExpenseIds.includes(exp.id)) {
        setSelectedExpenseIds(selectedExpenseIds.filter(id => id !== exp.id));
      } else {
        setSelectedExpenseIds([...selectedExpenseIds, exp.id]);
      }
    } else {
      handleEditExpense(exp);
    }
  };

  const handleSelectAll = () => {
    const currentlyDisplayedIds = filteredExpenses.slice(0, displayCount).map(e => e.id);
    if (selectedExpenseIds.length === currentlyDisplayedIds.length && currentlyDisplayedIds.length > 0) {
      setSelectedExpenseIds([]);
    } else {
      setSelectedExpenseIds(currentlyDisplayedIds);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedExpenseIds.length === 0) return;
    Alert.alert(
      "Delete Expenses",
      `Are you sure you want to delete ${selectedExpenseIds.length} selected expenses?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await bulkDeleteExpenses(selectedExpenseIds);
            setIsSelectMode(false);
            setSelectedExpenseIds([]);
          }
        }
      ]
    );
  };

  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true);
      const html = generateDashboardPDFHTML(filteredExpenses, categories, paymentModes, currency);
      const { uri, base64 } = await Print.printToFileAsync({ html, base64: true });

      if (downloadPathUri && Platform.OS === 'android') {
        const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(downloadPathUri, `Expense_Report_${new Date().getTime()}.pdf`, 'application/pdf');
        if (base64) {
          await FileSystem.writeAsStringAsync(fileUri, base64, { encoding: FileSystem.EncodingType.Base64 });
          Alert.alert('Success', 'PDF saved automatically to your chosen download folder.');
        }
      } else {
        await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to generate or save PDF report.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Monthly Spending Card */}
        <View style={[styles.card, { backgroundColor: colors.card, shadowColor: isDarkTheme ? '#00FFFF' : '#000', padding: 20 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1, paddingRight: 16 }}>
              <Text style={{ fontSize: 14, color: colors.text, opacity: 0.7, marginBottom: 8, fontWeight: '600', textTransform: 'uppercase' }}>{currentMonthName} Spending</Text>
              <Text style={{ fontSize: 32, fontWeight: 'bold', color: monthlyBudget > 0 && total > monthlyBudget ? '#ff4444' : colors.text, marginBottom: monthlyBudget > 0 && showMonthlyBudget ? 16 : 0 }} numberOfLines={1} adjustsFontSizeToFit>
                {currency}{formatAmount(total)}
              </Text>
              {monthlyBudget > 0 && showMonthlyBudget && (
                <View style={{ height: 6, backgroundColor: isDarkTheme ? '#333' : '#eee', borderRadius: 3, width: '100%', overflow: 'hidden' }}>
                  <View style={{ height: '100%', backgroundColor: total > monthlyBudget ? '#ff4444' : colors.primary, width: `${Math.min((total / monthlyBudget) * 100, 100)}%` }} />
                </View>
              )}
            </View>
            
            {monthlyBudget > 0 && showMonthlyBudget && (
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <Svg width={120} height={120}>
                  <Circle stroke={isDarkTheme ? '#333' : '#eee'} cx={60} cy={60} r={50} strokeWidth={8} fill="none" />
                  <Circle
                    stroke={total > monthlyBudget ? '#ff4444' : colors.primary}
                    cx={60} cy={60} r={50} strokeWidth={8}
                    strokeDasharray={`${2 * Math.PI * 50} ${2 * Math.PI * 50}`}
                    strokeDashoffset={2 * Math.PI * 50 - (Math.min((total / monthlyBudget) * 100, 100) / 100) * 2 * Math.PI * 50}
                    strokeLinecap="round" fill="none" transform="rotate(-90 60 60)"
                  />
                </Svg>
                <View style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 15, fontWeight: 'bold', color: colors.text }}>
                    {`${String(((total / monthlyBudget) * 100).toFixed(2)).padStart(5, '0')}%`}
                  </Text>
                  <Text style={{ fontSize: 10, color: colors.text, opacity: 0.6, marginTop: 2 }}>
                    of {currency}{formatAmount(monthlyBudget)}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Yearly Spending Card */}
        <View style={[styles.card, { backgroundColor: colors.card, shadowColor: isDarkTheme ? '#00FFFF' : '#000', padding: 20 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1, paddingRight: 16 }}>
              <Text style={{ fontSize: 14, color: colors.text, opacity: 0.7, marginBottom: 8, fontWeight: '600', textTransform: 'uppercase' }}>{currentYear} Total</Text>
              <Text style={{ fontSize: 32, fontWeight: 'bold', color: yearlyBudget > 0 && currentYearTotal > yearlyBudget ? '#ff4444' : colors.text, marginBottom: yearlyBudget > 0 && showYearlyBudget ? 16 : 0 }} numberOfLines={1} adjustsFontSizeToFit>
                {currency}{formatAmount(currentYearTotal)}
              </Text>
              {yearlyBudget > 0 && showYearlyBudget && (
                <View style={{ height: 6, backgroundColor: isDarkTheme ? '#333' : '#eee', borderRadius: 3, width: '100%', overflow: 'hidden' }}>
                  <View style={{ height: '100%', backgroundColor: currentYearTotal > yearlyBudget ? '#ff4444' : colors.primary, width: `${Math.min((currentYearTotal / yearlyBudget) * 100, 100)}%` }} />
                </View>
              )}
            </View>
            
            {yearlyBudget > 0 && showYearlyBudget && (
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <Svg width={120} height={120}>
                  <Circle stroke={isDarkTheme ? '#333' : '#eee'} cx={60} cy={60} r={50} strokeWidth={8} fill="none" />
                  <Circle
                    stroke={currentYearTotal > yearlyBudget ? '#ff4444' : colors.primary}
                    cx={60} cy={60} r={50} strokeWidth={8}
                    strokeDasharray={`${2 * Math.PI * 50} ${2 * Math.PI * 50}`}
                    strokeDashoffset={2 * Math.PI * 50 - (Math.min((currentYearTotal / yearlyBudget) * 100, 100) / 100) * 2 * Math.PI * 50}
                    strokeLinecap="round" fill="none" transform="rotate(-90 60 60)"
                  />
                </Svg>
                <View style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 15, fontWeight: 'bold', color: colors.text }}>
                    {`${String(((currentYearTotal / yearlyBudget) * 100).toFixed(2)).padStart(5, '0')}%`}
                  </Text>
                  <Text style={{ fontSize: 10, color: colors.text, opacity: 0.6, marginTop: 2 }}>
                    of {currency}{formatAmount(yearlyBudget)}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</Text>
          {expenses.length > 0 && (
            <TouchableOpacity onPress={() => {
              setIsSelectMode(!isSelectMode);
              setSelectedExpenseIds([]);
            }}>
              <Text style={{ color: colors.primary, fontWeight: '600' }}>
                {isSelectMode ? 'Cancel' : 'Select'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {expenses.length > 0 && (
          <View style={styles.searchFilterContainer}>
            <View style={[styles.searchBar, { backgroundColor: isDarkTheme ? '#1e1e1e' : '#f5f5f5', borderColor: isDarkTheme ? '#333' : '#e0e0e0' }]}>
              <Ionicons name="search" size={20} color={isDarkTheme ? '#888' : '#aaa'} style={styles.searchIcon} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Search expenses..."
                placeholderTextColor={isDarkTheme ? '#888' : '#aaa'}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color={isDarkTheme ? '#888' : '#aaa'} />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              style={[styles.filterButton, { backgroundColor: isDarkTheme ? '#1e1e1e' : '#f5f5f5', borderColor: isDarkTheme ? '#333' : '#e0e0e0', marginRight: 10 }]}
              onPress={handleDownloadPDF}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <ActivityIndicator size="small" color={colors.text} />
              ) : (
                <Ionicons name="download-outline" size={22} color={colors.text} />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, { backgroundColor: isDarkTheme ? '#1e1e1e' : '#f5f5f5', borderColor: isDarkTheme ? '#333' : '#e0e0e0' }]}
              onPress={() => setIsFilterModalVisible(true)}
            >
              <Ionicons
                name="options-outline"
                size={22}
                color={(selectedYears.length > 0 || selectedMonths.length > 0 || selectedCategoryIds.length > 0 || selectedPaymentModeIds.length > 0) ? colors.primary : colors.text}
              />
              {(selectedYears.length > 0 || selectedMonths.length > 0 || selectedCategoryIds.length > 0 || selectedPaymentModeIds.length > 0) && (
                <View style={[styles.filterBadge, { backgroundColor: colors.primary }]} />
              )}
            </TouchableOpacity>
          </View>
        )}

        {expenses.length > 0 && (searchQuery.length > 0 || selectedYears.length > 0 || selectedMonths.length > 0 || selectedCategoryIds.length > 0 || selectedPaymentModeIds.length > 0) && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingHorizontal: 4 }}>
            <Text style={{ color: '#888', fontSize: 13, fontWeight: '500' }}>
              Showing {filteredExpenses.length} result{filteredExpenses.length !== 1 ? 's' : ''}
            </Text>
            <Text style={{ color: colors.text, fontSize: 14, fontWeight: 'bold' }}>
              Total: {currency}{formatAmount(filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0))}
            </Text>
          </View>
        )}

        {isSelectMode && (
          <View style={styles.bulkActions}>
            <TouchableOpacity onPress={handleSelectAll}>
              <Text style={{ color: colors.primary, fontWeight: '600' }}>
                {selectedExpenseIds.length === filteredExpenses.slice(0, displayCount).length && filteredExpenses.length > 0 ? 'Deselect All' : 'Select All'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDeleteSelected}
              disabled={selectedExpenseIds.length === 0}
              style={{ opacity: selectedExpenseIds.length === 0 ? 0.5 : 1 }}
            >
              <Text style={{ color: '#ff4444', fontWeight: '600' }}>
                Delete ({selectedExpenseIds.length})
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {expenses.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No expenses yet. Add one!</Text>
          </View>
        ) : filteredExpenses.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No expenses match your search or filters.</Text>
          </View>
        ) : (
          <>
            {filteredExpenses.slice(0, displayCount).map((exp) => {
              const category = categories.find(c => c.id === exp.categoryId);
              const paymentMode = paymentModes.find(m => m.id === exp.paymentModeId);

              return (
                <TouchableOpacity
                  key={exp.id}
                  style={[styles.expenseRow, { backgroundColor: colors.card }]}
                  onPress={() => handleRowPress(exp)}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    {isSelectMode && (
                      <View style={[styles.checkbox, { borderColor: colors.primary, backgroundColor: selectedExpenseIds.includes(exp.id) ? colors.primary : 'transparent' }]}>
                        {selectedExpenseIds.includes(exp.id) && <Ionicons name="checkmark" size={16} color="#fff" />}
                      </View>
                    )}
                    {category ? (
                      <View style={[styles.expenseIcon, { backgroundColor: category.color }]}>
                        <Ionicons name={category.icon as any} size={20} color="#fff" />
                      </View>
                    ) : (
                      <View style={[styles.expenseIcon, { backgroundColor: isDarkTheme ? '#333' : '#eee' }]}>
                        <Ionicons name="cash-outline" size={20} color={colors.text} />
                      </View>
                    )}
                    <View style={{ flex: 1, paddingRight: 10 }}>
                      <Text style={[styles.expenseDesc, { color: colors.text }]} numberOfLines={1}>{exp.description}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                        <Text style={styles.expenseDate}>{new Date(exp.date).toLocaleDateString()}</Text>
                        {paymentMode && (
                          <>
                            <Text style={styles.dotSeparator}>•</Text>
                            <Ionicons name={paymentMode.icon as any} size={12} color={paymentMode.color} style={{ marginRight: 4 }} />
                            <Text style={[styles.paymentModeText, { color: paymentMode.color }]} numberOfLines={1}>{paymentMode.name}</Text>
                          </>
                        )}
                      </View>
                    </View>
                  </View>
                  <Text style={[styles.expenseAmount, { color: '#ff4444' }]}>-{currency}{formatAmount(exp.amount)}</Text>
                </TouchableOpacity>
              );
            })}

            {filteredExpenses.length > displayCount && (
              <TouchableOpacity
                style={[styles.loadMoreButton, { backgroundColor: isDarkTheme ? '#2a2a2a' : '#f0f0f0' }]}
                onPress={() => setDisplayCount(prev => prev + 20)}
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

      <FilterModal
        visible={isFilterModalVisible}
        onClose={() => setIsFilterModalVisible(false)}
        availableYears={availableYears}
        availableMonths={availableMonths}
        availableCategories={availableCategories}
        availablePaymentModes={availablePaymentModes}
        selectedYears={selectedYears}
        setSelectedYears={setSelectedYears}
        selectedMonths={selectedMonths}
        setSelectedMonths={setSelectedMonths}
        selectedCategoryIds={selectedCategoryIds}
        setSelectedCategoryIds={setSelectedCategoryIds}
        selectedPaymentModeIds={selectedPaymentModeIds}
        setSelectedPaymentModeIds={setSelectedPaymentModeIds}
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
    fontWeight: 'bold',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 15,
  },
  summaryItem: {
    flex: 1,
  },
  summaryDivider: {
    width: 1,
    height: '70%',
    alignSelf: 'center',
    marginHorizontal: 15,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
    marginBottom: 6,
  },
  summaryAmount: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  budgetSubtext: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    marginRight: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  bulkActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 8,
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
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expenseIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  expenseDesc: {
    fontSize: 16,
    fontWeight: '600',
  },
  expenseDate: {
    fontSize: 12,
    color: '#888',
  },
  dotSeparator: {
    fontSize: 12,
    color: '#888',
    marginHorizontal: 4,
  },
  paymentModeText: {
    fontSize: 12,
    fontWeight: '600',
    flexShrink: 1,
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
