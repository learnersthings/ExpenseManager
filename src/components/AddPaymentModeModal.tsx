import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import { useThemeContext } from '../context/ThemeContext';
import { useExpenseContext, PaymentMode } from '../context/ExpenseContext';
import { Ionicons } from '@expo/vector-icons';

interface AddPaymentModeModalProps {
  visible: boolean;
  onClose: () => void;
  modeToEdit?: PaymentMode | null;
}

const PRESET_COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336', '#E91E63', '#673AB7', '#3F51B5', '#00BCD4', '#009688', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#795548', '#9E9E9E', '#607D8B'];
const PRESET_ICONS = ['cash', 'card', 'wallet', 'business', 'phone-portrait', 'logo-bitcoin', 'logo-apple', 'logo-google', 'qr-code', 'swap-horizontal'];

export default function AddPaymentModeModal({ visible, onClose, modeToEdit }: AddPaymentModeModalProps) {
  const { colors } = useTheme();
  const { isDarkTheme } = useThemeContext();
  const { addPaymentMode, updatePaymentMode, deletePaymentMode } = useExpenseContext();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [icon, setIcon] = useState(PRESET_ICONS[0]);
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (visible) {
      if (modeToEdit) {
        setName(modeToEdit.name);
        setIcon(modeToEdit.icon);
        setColor(modeToEdit.color);
      } else {
        setName('');
        setIcon(PRESET_ICONS[0]);
        setColor(PRESET_COLORS[0]);
      }
      setError('');
    }
  }, [visible, modeToEdit]);

  const placeholderColor = isDarkTheme ? '#888' : '#aaa';

  const handleSave = async () => {
    setError('');
    
    if (!name.trim()) {
      setError('Please enter a payment mode name.');
      return;
    }

    try {
      if (modeToEdit) {
        await updatePaymentMode(modeToEdit.id, name, icon, color);
      } else {
        await addPaymentMode(name, icon, color);
      }
      onClose();
    } catch (e: any) {
      setError(e.message || 'Failed to save payment mode.');
    }
  };

  const handleDelete = () => {
    if (modeToEdit) {
      Alert.alert(
        "Delete Payment Mode",
        "Are you sure you want to delete this payment mode? This action cannot be undone.",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Delete", 
            style: "destructive",
            onPress: async () => {
              try {
                await deletePaymentMode(modeToEdit.id);
                onClose();
              } catch (e: any) {
                setError(e.message || 'Failed to delete payment mode.');
              }
            }
          }
        ]
      );
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
                {modeToEdit ? 'Edit Payment Mode' : 'Add Payment Mode'}
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Mode Name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: isDarkTheme ? '#1e1e1e' : '#f5f5f5', color: colors.text, borderColor: isDarkTheme ? '#333' : '#e0e0e0' }]}
                placeholder="e.g. Credit Card"
                placeholderTextColor={placeholderColor}
                value={name}
                onChangeText={(text) => { setName(text); setError(''); }}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Select Color</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.colorScroll}>
                {PRESET_COLORS.map(c => (
                  <TouchableOpacity 
                    key={c} 
                    style={[styles.colorSwatch, { backgroundColor: c, borderWidth: color === c ? 3 : 0, borderColor: colors.text }]} 
                    onPress={() => setColor(c)} 
                  />
                ))}
              </ScrollView>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Select Icon</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.colorScroll}>
                {PRESET_ICONS.map(i => (
                  <TouchableOpacity 
                    key={i} 
                    style={[styles.iconSwatch, { backgroundColor: icon === i ? colors.primary : isDarkTheme ? '#1e1e1e' : '#f5f5f5' }]} 
                    onPress={() => setIcon(i)}
                  >
                    <Ionicons name={i as any} size={24} color={icon === i ? '#fff' : colors.text} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary }]} onPress={handleSave}>
              <Text style={styles.saveButtonText}>
                {modeToEdit ? 'Update Payment Mode' : 'Save Payment Mode'}
              </Text>
            </TouchableOpacity>

            {modeToEdit && (
              <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                <Ionicons name="trash-outline" size={20} color="#ff4444" style={{ marginRight: 8 }} />
                <Text style={styles.deleteButtonText}>Delete Payment Mode</Text>
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
  colorScroll: {
    paddingVertical: 8,
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  iconSwatch: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
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
