import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '@react-navigation/native';
import { useThemeContext } from '../context/ThemeContext';
import { useExpenseContext, Expense, Category } from '../context/ExpenseContext';
import { Ionicons } from '@expo/vector-icons';

interface AddExpenseModalProps {
  visible: boolean;
  onClose: () => void;
  expenseToEdit?: Expense | null;
}

export default function AddExpenseModal({ visible, onClose, expenseToEdit }: AddExpenseModalProps) {
  const { colors } = useTheme();
  const { isDarkTheme } = useThemeContext();
  const { addExpense, updateExpense, deleteExpense, categories, paymentModes } = useExpenseContext();
  const insets = useSafeAreaInsets();

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [paymentModeId, setPaymentModeId] = useState<string | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [amountError, setAmountError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [paymentModeError, setPaymentModeError] = useState('');

  const clearErrors = () => {
    setAmountError('');
    setDescriptionError('');
    setCategoryError('');
    setPaymentModeError('');
  };

  // Use effect to populate fields when editing
  React.useEffect(() => {
    if (visible) {
      if (expenseToEdit) {
        setAmount(expenseToEdit.amount.toString());
        setDescription(expenseToEdit.description);
        setDate(new Date(expenseToEdit.date));
        setCategoryId(expenseToEdit.categoryId);
        setPaymentModeId(expenseToEdit.paymentModeId);
      } else {
        setAmount('');
        setDescription('');
        setDate(new Date());
        setCategoryId(undefined);
        setPaymentModeId(undefined);
      }
      clearErrors();
    }
  }, [visible, expenseToEdit]);

  const placeholderColor = isDarkTheme ? '#888' : '#aaa';

  const handleSave = async () => {
    clearErrors();
    let hasError = false;

    if (!amount.trim() || isNaN(Number(amount))) {
      setAmountError('Please enter a valid amount.');
      hasError = true;
    }
    if (!description.trim()) {
      setDescriptionError('Please enter a description.');
      hasError = true;
    }
    if (categories.length > 0 && !categoryId) {
      setCategoryError('Please select a category.');
      hasError = true;
    }
    if (paymentModes.length > 0 && !paymentModeId) {
      setPaymentModeError('Please select a payment mode.');
      hasError = true;
    }

    if (hasError) return;

    try {
      if (expenseToEdit) {
        await updateExpense(expenseToEdit.id, Number(amount), description, date, categoryId, paymentModeId);
      } else {
        await addExpense(Number(amount), description, date, categoryId, paymentModeId);
      }
      onClose();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save expense.');
    }
  };

  const handleDelete = () => {
    if (expenseToEdit) {
      Alert.alert(
        "Delete Expense",
        "Are you sure you want to delete this expense? This action cannot be undone.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                await deleteExpense(expenseToEdit.id);
                onClose();
              } catch (e: any) {
                Alert.alert('Error', e.message || 'Failed to delete expense.');
              }
            }
          }
        ]
      );
    }
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios'); // iOS keeps it open, Android closes
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={[styles.modalContent, { backgroundColor: colors.background, paddingBottom: Math.max(24, insets.bottom + 16) }]}
          >
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>
                {expenseToEdit ? 'Edit Expense' : 'Add Expense'}
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Amount</Text>
              <TextInput
                style={[styles.input, { backgroundColor: isDarkTheme ? '#1e1e1e' : '#f5f5f5', color: colors.text, borderColor: isDarkTheme ? '#333' : '#e0e0e0' }]}
                placeholder="0.00"
                placeholderTextColor={placeholderColor}
                keyboardType="numeric"
                value={amount}
                onChangeText={(text) => { setAmount(text); setAmountError(''); }}
              />
              {amountError ? <Text style={styles.fieldErrorText}>{amountError}</Text> : null}
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: isDarkTheme ? '#1e1e1e' : '#f5f5f5', color: colors.text, borderColor: isDarkTheme ? '#333' : '#e0e0e0' }]}
                placeholder="Description"
                placeholderTextColor={placeholderColor}
                value={description}
                onChangeText={(text) => { setDescription(text); setDescriptionError(''); }}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
              {descriptionError ? <Text style={styles.fieldErrorText}>{descriptionError}</Text> : null}
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Date</Text>
              <TouchableOpacity
                style={[styles.dateButton, { backgroundColor: isDarkTheme ? '#1e1e1e' : '#f5f5f5', borderColor: isDarkTheme ? '#333' : '#e0e0e0' }]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={{ color: colors.text, fontSize: 16 }}>{date.toLocaleDateString()}</Text>
                <Ionicons name="calendar-outline" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            {categories.length > 0 && (
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.categoryChip,
                        { backgroundColor: categoryId === cat.id ? cat.color : isDarkTheme ? '#1e1e1e' : '#f5f5f5' }
                      ]}
                      onPress={() => { setCategoryId(cat.id); setCategoryError(''); }}
                    >
                      <Ionicons name={cat.icon as any} size={16} color={categoryId === cat.id ? '#fff' : cat.color} style={{ marginRight: 6 }} />
                      <Text style={{ color: categoryId === cat.id ? '#fff' : colors.text, fontWeight: '600' }}>{cat.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                {categoryError ? <Text style={styles.fieldErrorText}>{categoryError}</Text> : null}
              </View>
            )}

            {paymentModes.length > 0 && (
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Payment Mode</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
                  {paymentModes.map((mode) => (
                    <TouchableOpacity
                      key={mode.id}
                      style={[
                        styles.categoryChip,
                        { backgroundColor: paymentModeId === mode.id ? mode.color : isDarkTheme ? '#1e1e1e' : '#f5f5f5' }
                      ]}
                      onPress={() => { setPaymentModeId(mode.id); setPaymentModeError(''); }}
                    >
                      <Ionicons name={mode.icon as any} size={16} color={paymentModeId === mode.id ? '#fff' : mode.color} style={{ marginRight: 6 }} />
                      <Text style={{ color: paymentModeId === mode.id ? '#fff' : colors.text, fontWeight: '600' }}>{mode.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                {paymentModeError ? <Text style={styles.fieldErrorText}>{paymentModeError}</Text> : null}
              </View>
            )}

            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={onChangeDate}
              />
            )}

            <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary }]} onPress={handleSave}>
              <Text style={styles.saveButtonText}>
                {expenseToEdit ? 'Update Expense' : 'Save Expense'}
              </Text>
            </TouchableOpacity>

            {expenseToEdit && (
              <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                <Ionicons name="trash-outline" size={20} color="#ff4444" style={{ marginRight: 8 }} />
                <Text style={styles.deleteButtonText}>Delete Expense</Text>
              </TouchableOpacity>
            )}

          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#ff4444',
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  fieldErrorText: {
    color: '#ff4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
    marginLeft: 4,
    fontWeight: '600',
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    paddingTop: 12,
    paddingBottom: 12,
  },
  dateButton: {
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryScroll: {
    paddingVertical: 4,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
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
  deleteButton: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ff4444',
    backgroundColor: 'transparent',
  },
  deleteButtonText: {
    color: '#ff4444',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
