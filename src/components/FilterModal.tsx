import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, SafeAreaView, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { useThemeContext } from '../context/ThemeContext';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  availableYears: number[];
  availableMonths: number[];
  availableCategories: { id: string; name: string }[];
  availablePaymentModes: { id: string; name: string }[];

  selectedYears: number[];
  setSelectedYears: (val: number[]) => void;

  selectedMonths: number[];
  setSelectedMonths: (val: number[]) => void;

  selectedCategoryIds: string[];
  setSelectedCategoryIds: (val: string[]) => void;

  selectedPaymentModeIds: string[];
  setSelectedPaymentModeIds: (val: string[]) => void;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function FilterModal(props: FilterModalProps) {
  const { colors } = useTheme();
  const { isDarkTheme } = useThemeContext();

  const toggleYear = (y: number) => {
    if (props.selectedYears.includes(y)) {
      props.setSelectedYears(props.selectedYears.filter(year => year !== y));
    } else {
      props.setSelectedYears([...props.selectedYears, y]);
    }
  };

  const toggleMonth = (m: number) => {
    if (props.selectedMonths.includes(m)) {
      props.setSelectedMonths(props.selectedMonths.filter(month => month !== m));
    } else {
      props.setSelectedMonths([...props.selectedMonths, m]);
    }
  };

  const toggleCategory = (id: string) => {
    if (props.selectedCategoryIds.includes(id)) {
      props.setSelectedCategoryIds(props.selectedCategoryIds.filter(catId => catId !== id));
    } else {
      props.setSelectedCategoryIds([...props.selectedCategoryIds, id]);
    }
  };

  const togglePaymentMode = (id: string) => {
    if (props.selectedPaymentModeIds.includes(id)) {
      props.setSelectedPaymentModeIds(props.selectedPaymentModeIds.filter(pmId => pmId !== id));
    } else {
      props.setSelectedPaymentModeIds([...props.selectedPaymentModeIds, id]);
    }
  };

  const handleClearAll = () => {
    props.setSelectedYears([]);
    props.setSelectedMonths([]);
    props.setSelectedCategoryIds([]);
    props.setSelectedPaymentModeIds([]);
  };

  const renderChip = (label: string, isSelected: boolean, onPress: () => void) => (
    <TouchableOpacity
      key={label}
      style={[
        styles.chip,
        { backgroundColor: isSelected ? colors.primary : (isDarkTheme ? '#333' : '#e0e0e0') }
      ]}
      onPress={onPress}
    >
      <Text style={[styles.chipText, { color: isSelected ? '#fff' : colors.text }]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={props.visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={props.onClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]}>
        <View style={[styles.header, { borderBottomColor: isDarkTheme ? '#333' : '#eee' }]}>
          <TouchableOpacity onPress={handleClearAll} style={styles.headerButton}>
            <Text style={{ color: '#ff4444', fontSize: 16, fontWeight: 'bold' }}>Clear</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Filters</Text>
          <TouchableOpacity onPress={props.onClose} style={styles.headerButton}>
            <Text style={{ color: colors.primary, fontSize: 16, fontWeight: 'bold' }}>Done</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>

          {/* Years */}
          {props.availableYears.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Year</Text>
              <View style={styles.chipContainer}>
                {props.availableYears.map(y => renderChip(y.toString(), props.selectedYears.includes(y), () => toggleYear(y)))}
              </View>
            </View>
          )}

          {/* Months */}
          {props.availableMonths.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Month</Text>
              <View style={styles.chipContainer}>
                {props.availableMonths.map(m => renderChip(MONTH_NAMES[m], props.selectedMonths.includes(m), () => toggleMonth(m)))}
              </View>
            </View>
          )}

          {/* Categories */}
          {props.availableCategories.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Category</Text>
              <View style={styles.chipContainer}>
                {props.availableCategories.map(c => renderChip(c.name, props.selectedCategoryIds.includes(c.id), () => toggleCategory(c.id)))}
              </View>
            </View>
          )}

          {/* Payment Modes */}
          {props.availablePaymentModes.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Mode</Text>
              <View style={styles.chipContainer}>
                {props.availablePaymentModes.map(p => renderChip(p.name, props.selectedPaymentModeIds.includes(p.id), () => togglePaymentMode(p.id)))}
              </View>
            </View>
          )}

        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerButton: {
    padding: 5,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
