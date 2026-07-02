import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import { useThemeContext } from '../context/ThemeContext';
import { useExpenseContext, Category } from '../context/ExpenseContext';
import { Ionicons } from '@expo/vector-icons';
import { PRESET_COLORS, PRESET_ICONS } from '../constants/presets';
import ColorPickerModal from './ColorPickerModal';
import IconPickerModal from './IconPickerModal';

interface AddCategoryModalProps {
  visible: boolean;
  onClose: () => void;
  categoryToEdit?: Category | null;
}

export default function AddCategoryModal({ visible, onClose, categoryToEdit }: AddCategoryModalProps) {
  const { colors } = useTheme();
  const { isDarkTheme } = useThemeContext();
  const { categories, addCategory, updateCategory, deleteCategory } = useExpenseContext();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [color, setColor] = useState('');
  const [error, setError] = useState('');
  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  const [iconPickerVisible, setIconPickerVisible] = useState(false);

  React.useEffect(() => {
    if (visible) {
      if (categoryToEdit) {
        setName(categoryToEdit.name);
        setIcon(categoryToEdit.icon);
        setColor(categoryToEdit.color);
      } else {
        setName('');
        setIcon('');
        setColor('');
      }
      setError('');
    }
  }, [visible, categoryToEdit]);

  const placeholderColor = isDarkTheme ? '#888' : '#aaa';

  const handleSave = async () => {
    setError('');

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Please enter a category name.');
      return;
    }

    const nameExists = categories.some(
      (c) => c.name.toLowerCase() === trimmedName.toLowerCase() && c.id !== categoryToEdit?.id
    );

    if (nameExists) {
      setError('A category with this name already exists.');
      return;
    }

    let finalIcon = icon;
    let finalColor = color;

    if (!finalIcon) {
      finalIcon = PRESET_ICONS[Math.floor(Math.random() * PRESET_ICONS.length)];
    }
    if (!finalColor) {
      finalColor = PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)];
    }

    try {
      if (categoryToEdit) {
        await updateCategory(categoryToEdit.id, name, finalIcon, finalColor);
      } else {
        await addCategory(name, finalIcon, finalColor);
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

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
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
                <TouchableOpacity 
                  style={[styles.pickerButton, { borderColor: isDarkTheme ? '#333' : '#e0e0e0', backgroundColor: isDarkTheme ? '#1e1e1e' : '#f5f5f5' }]}
                  onPress={() => setColorPickerVisible(true)}
                >
                  {color ? (
                    <View style={[styles.colorSwatchSmall, { backgroundColor: color, borderWidth: color === '#ffffff' ? 1 : 0, borderColor: '#ddd' }]} />
                  ) : (
                    <View style={[styles.colorSwatchSmall, { backgroundColor: '#888' }]} />
                  )}
                  <Text style={[styles.pickerButtonText, { color: colors.text }]}>
                    {color ? color.toUpperCase() : 'Random Color (Default)'}
                  </Text>
                  <Ionicons name="chevron-forward" size={20} color={colors.text} />
                </TouchableOpacity>
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Select Icon</Text>
                <TouchableOpacity 
                  style={[styles.pickerButton, { borderColor: isDarkTheme ? '#333' : '#e0e0e0', backgroundColor: isDarkTheme ? '#1e1e1e' : '#f5f5f5' }]}
                  onPress={() => setIconPickerVisible(true)}
                >
                  {icon ? (
                    <View style={[styles.iconSwatchSmall, { backgroundColor: colors.primary }]}>
                      <Ionicons name={icon as any} size={18} color="#fff" />
                    </View>
                  ) : (
                    <View style={[styles.iconSwatchSmall, { backgroundColor: '#888' }]}>
                      <Ionicons name="help" size={18} color="#fff" />
                    </View>
                  )}
                  <Text style={[styles.pickerButtonText, { color: colors.text }]}>
                    {icon ? icon : 'Random Icon (Default)'}
                  </Text>
                  <Ionicons name="chevron-forward" size={20} color={colors.text} />
                </TouchableOpacity>
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
            </ScrollView>

          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>

      <ColorPickerModal 
        visible={colorPickerVisible} 
        onClose={() => setColorPickerVisible(false)} 
        color={color} 
        onSelect={setColor} 
      />
      
      <IconPickerModal 
        visible={iconPickerVisible} 
        onClose={() => setIconPickerVisible(false)} 
        icon={icon} 
        onSelect={setIcon} 
      />
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
    maxHeight: '90%',
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
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    height: 56,
  },
  pickerButtonText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  colorSwatchSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  iconSwatchSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
