import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useThemeContext } from '../context/ThemeContext';
import { useAuthContext } from '../context/AuthContext';
import ImportSheetModal from '../components/ImportSheetModal';
import { useExpenseContext } from '../context/ExpenseContext';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

export default function SettingsScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { isDarkTheme, toggleTheme, refreshTheme } = useThemeContext();
  const { logout, refreshAuth } = useAuthContext();
  const [isImportModalVisible, setIsImportModalVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { currency, refreshExpenseData } = useExpenseContext();

  const handleBackup = async () => {
    try {
      setIsProcessing(true);
      const keys = await AsyncStorage.getAllKeys();
      const stores = await AsyncStorage.multiGet(keys);
      const backupData = Object.fromEntries(stores);
      
      const fileUri = FileSystem.documentDirectory + 'ExpenseManagerBackup.json';
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(backupData));
      
      const isSharingAvailable = await Sharing.isAvailableAsync();
      if (isSharingAvailable) {
        await Sharing.shareAsync(fileUri, { mimeType: 'application/json', dialogTitle: 'Save Backup' });
      } else {
        alert('Sharing is not available on this device');
      }
    } catch (e: any) {
      alert('Backup failed: ' + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestore = async () => {
    try {
      setIsProcessing(true);
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/json', copyToCacheDirectory: true });
      
      if (result.canceled) {
        setIsProcessing(false);
        return;
      }
      
      const fileUri = result.assets[0].uri;
      const fileContent = await FileSystem.readAsStringAsync(fileUri);
      const parsedData = JSON.parse(fileContent);
      
      if (typeof parsedData !== 'object' || parsedData === null) {
        throw new Error('Invalid backup file format');
      }

      // Convert object back to array of pairs
      const kvPairs: [string, string][] = Object.entries(parsedData).map(([k, v]) => [k, String(v)]);
      
      // Clear existing and set new
      await AsyncStorage.clear();
      await AsyncStorage.multiSet(kvPairs);
      
      // Reload all contexts
      await refreshAuth();
      await refreshTheme();
      await refreshExpenseData();
      
      alert('Restore Successful! Your data has been loaded instantly.');
    } catch (e: any) {
      alert('Restore failed: ' + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      
      <TouchableOpacity 
        style={[styles.row, { backgroundColor: colors.card }]}
        onPress={() => navigation.navigate('Profile')}
      >
        <Text style={[styles.text, { color: colors.text }]}>User Profile</Text>
        <Ionicons name="chevron-forward" size={20} color={colors.text} />
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.row, { backgroundColor: colors.card, marginTop: 10 }]}
        onPress={() => navigation.navigate('Currency')}
      >
        <Text style={[styles.text, { color: colors.text }]}>Currency</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ color: colors.primary, fontSize: 18, fontWeight: 'bold', marginRight: 8 }}>{currency}</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.text} />
        </View>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.row, { backgroundColor: colors.card, marginTop: 10 }]}
        onPress={() => navigation.navigate('Budget')}
      >
        <Text style={[styles.text, { color: colors.text }]}>Budget</Text>
        <Ionicons name="chevron-forward" size={20} color={colors.text} />
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.row, { backgroundColor: colors.card, marginTop: 10 }]}
        onPress={() => navigation.navigate('Categories')}
      >
        <Text style={[styles.text, { color: colors.text }]}>Manage Categories</Text>
        <Ionicons name="chevron-forward" size={20} color={colors.text} />
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.row, { backgroundColor: colors.card, marginTop: 10 }]}
        onPress={() => navigation.navigate('PaymentModes')}
      >
        <Text style={[styles.text, { color: colors.text }]}>Payment Modes</Text>
        <Ionicons name="chevron-forward" size={20} color={colors.text} />
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.row, { backgroundColor: colors.card, marginTop: 10 }]}
        onPress={() => setIsImportModalVisible(true)}
      >
        <Text style={[styles.text, { color: colors.text }]}>Import from Google Sheets</Text>
        <Ionicons name="cloud-download-outline" size={20} color={colors.text} />
      </TouchableOpacity>

      <View style={[styles.row, { backgroundColor: colors.card, marginTop: 10 }]}>
        <Text style={[styles.text, { color: colors.text }]}>Dark Mode</Text>
        <Switch
          trackColor={{ false: '#767577', true: colors.primary }}
          thumbColor={isDarkTheme ? '#ffffff' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleTheme}
          value={isDarkTheme}
        />
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24, marginBottom: 8 }]}>Data Management</Text>

      <TouchableOpacity 
        style={[styles.row, { backgroundColor: colors.card, opacity: isProcessing ? 0.5 : 1 }]}
        onPress={handleBackup}
        disabled={isProcessing}
      >
        <Text style={[styles.text, { color: colors.primary }]}>Backup Data</Text>
        <Ionicons name="cloud-upload-outline" size={20} color={colors.primary} />
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.row, { backgroundColor: colors.card, marginTop: 10, opacity: isProcessing ? 0.5 : 1 }]}
        onPress={() => {
          Alert.alert(
            "Restore Data",
            "WARNING: This will completely overwrite all current expenses, categories, settings, and profile data with the backup file. This cannot be undone.",
            [
              { text: "Cancel", style: "cancel" },
              { text: "Proceed", style: "destructive", onPress: handleRestore }
            ]
          );
        }}
        disabled={isProcessing}
      >
        <Text style={[styles.text, { color: '#ff4444' }]}>Restore Data</Text>
        <Ionicons name="cloud-download-outline" size={20} color="#ff4444" />
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.logoutButton, { backgroundColor: '#ff4444', marginTop: 30 }]} 
        onPress={logout}
      >
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      <ImportSheetModal 
        visible={isImportModalVisible} 
        onClose={() => setIsImportModalVisible(false)} 
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  text: {
    fontSize: 18,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#888',
    marginLeft: 4,
  },
  logoutButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
