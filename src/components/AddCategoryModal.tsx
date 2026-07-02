import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import { useThemeContext } from '../context/ThemeContext';
import { useExpenseContext, Category } from '../context/ExpenseContext';
import { Ionicons } from '@expo/vector-icons';
import { PRESET_COLORS, PRESET_ICONS } from '../constants/presets';

interface AddCategoryModalProps {
  visible: boolean;
  onClose: () => void;
  categoryToEdit?: Category | null;
}

export default function AddCategoryModal({ visible, onClose, categoryToEdit }: AddCategoryModalProps) {
  const { colors } = useTheme();
  const { isDarkTheme } = useThemeContext();
  const { addCategory, updateCategory, deleteCategory } = useExpenseContext();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [icon, setIcon] = useState(PRESET_ICONS[0]);
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (visible) {
      if (categoryToEdit) {
        setName(categoryToEdit.name);
        setIcon(categoryToEdit.icon);
        setColor(categoryToEdit.color);
      } else {
        setName('');
        setIcon(PRESET_ICONS[0]);
        setColor(PRESET_COLORS[0]);
      }
      setError('');
    }
  }, [visible, categoryToEdit]);

  const placeholderColor = isDarkTheme ? '#888' : '#aaa';

  const handleSave = async () => {
    setError('');

    if (!name.trim()) {
      setError('Please enter a category name.');
      return;
    }

    try {
      if (categoryToEdit) {
        await updateCategory(categoryToEdit.id, name, icon, color);
      } else {
        await addCategory(name, icon, color);
      }
      onClose();
    } catch (e: any) {
      setError(e.message || 'Failed to save category.');
    }
  };

  const handleDelete = () => {
    if (categoryToEdit) {
      Alert.alert(
        "Delete Category",
        "Are you sure you want to delete this category? This action cannot be undone.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                await deleteCategory(categoryToEdit.id);
                onClose();
              } catch (e: any) {
                setError(e.message || 'Failed to delete category.');
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
                {categoryToEdit ? 'Edit Category' : 'Add Category'}
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Category Name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: isDarkTheme ? '#1e1e1e' : '#f5f5f5', color: colors.text, borderColor: isDarkTheme ? '#333' : '#e0e0e0' }]}
                placeholder="e.g. Groceries"
                placeholderTextColor={placeholderColor}
                value={name}
                onChangeText={(text) => { setName(text); setError(''); }}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Select Color</Text>
              <View style={{ height: 180, borderWidth: 1, borderColor: isDarkTheme ? '#333' : '#e0e0e0', borderRadius: 12, padding: 8 }}>
                <ScrollView contentContainerStyle={styles.gridContainer} nestedScrollEnabled>
                  {PRESET_COLORS.map(c => (
                    <View key={c} style={styles.gridItem}>
                      <TouchableOpacity
                        style={[styles.colorSwatch, { backgroundColor: c, borderWidth: color === c ? 3 : (c === '#ffffff' ? 1 : 0), borderColor: color === c ? colors.text : '#ddd' }]}
                        onPress={() => setColor(c)}
                      />
                    </View>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Select Icon</Text>
              <View style={{ height: 180, borderWidth: 1, borderColor: isDarkTheme ? '#333' : '#e0e0e0', borderRadius: 12, padding: 8 }}>
                <ScrollView contentContainerStyle={styles.gridContainer} nestedScrollEnabled>
                  {PRESET_ICONS.map(i => (
                    <View key={i} style={styles.gridItem}>
                      <TouchableOpacity
                        style={[styles.iconSwatch, { backgroundColor: icon === i ? colors.primary : isDarkTheme ? '#1e1e1e' : '#f5f5f5' }]}
                        onPress={() => setIcon(i)}
                      >
                        <Ionicons name={i as any} size={24} color={icon === i ? '#fff' : colors.text} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </View>
            </View>

            <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary }]} onPress={handleSave}>
              <Text style={styles.saveButtonText}>
                {categoryToEdit ? 'Update Category' : 'Save Category'}
              </Text>
            </TouchableOpacity>

            {categoryToEdit && (
              <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                <Ionicons name="trash-outline" size={20} color="#ff4444" style={{ marginRight: 8 }} />
                <Text style={styles.deleteButtonText}>Delete Category</Text>
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
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    paddingVertical: 8,
  },
  gridItem: {
    width: '16.66%',
    alignItems: 'center',
    marginBottom: 12,
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  iconSwatch: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
