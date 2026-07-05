import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import AppText from '../components/AppText';
import { useThemeColors } from '../hooks/useThemeColors';
import { useExpenseContext } from '../context/ExpenseContext';
import { Ionicons } from '@expo/vector-icons';

export default function AnalyticsChartSettingsScreen() {
  const colors = useThemeColors();
  const { analyticsChartType, updateAnalyticsChartType } = useExpenseContext();

  const handleSelect = (type: 'Pie' | 'Donut') => {
    updateAnalyticsChartType(type);
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
        <AppText style={[styles.title, { color: colors.text }]}>Select Chart Type</AppText>
        <AppText style={styles.subtitle}>Choose how you want your analytics data to be visualized.</AppText>

        <TouchableOpacity 
          style={[styles.optionRow, { borderBottomColor: colors.border }]} 
          onPress={() => handleSelect('Pie')}
        >
          <View style={styles.optionLeft}>
            <Ionicons name="pie-chart-outline" size={24} color={colors.primary} style={styles.icon} />
            <AppText style={[styles.optionText, { color: colors.text }]}>Pie Chart</AppText>
          </View>
          {analyticsChartType === 'Pie' && <Ionicons name="checkmark-circle" size={24} color={colors.primary} />}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.optionRow, { borderBottomWidth: 0 }]} 
          onPress={() => handleSelect('Donut')}
        >
          <View style={styles.optionLeft}>
            <Ionicons name="aperture-outline" size={24} color={colors.primary} style={styles.icon} />
            <AppText style={[styles.optionText, { color: colors.text }]}>Donut Chart</AppText>
          </View>
          {analyticsChartType === 'Donut' && <Ionicons name="checkmark-circle" size={24} color={colors.primary} />}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 16,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
