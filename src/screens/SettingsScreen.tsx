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
      
      <View style={[styles.group, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Profile</Text>
        <TouchableOpacity 
          style={styles.row}
          onPress={() => navigation.navigate('Profile')}
        >
          <View style={styles.rowLeft}>
            <Ionicons name="person-outline" size={22} color={colors.primary} style={styles.icon} />
            <Text style={[styles.text, { color: colors.text }]}>User Profile</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={[styles.group, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Ionicons name="moon-outline" size={22} color={colors.primary} style={styles.icon} />
            <Text style={[styles.text, { color: colors.text }]}>Dark Mode</Text>
          </View>
          <Switch
            trackColor={{ false: '#767577', true: colors.primary }}
            thumbColor={isDarkTheme ? '#ffffff' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleTheme}
            value={isDarkTheme}
          />
        </View>
      </View>

      <View style={[styles.group, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Preferences</Text>
        <TouchableOpacity 
          style={styles.row}
          onPress={() => navigation.navigate('Currency')}
        >
          <View style={styles.rowLeft}>
            <Ionicons name="cash-outline" size={22} color={colors.primary} style={styles.icon} />
            <Text style={[styles.text, { color: colors.text }]}>Currency</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ color: colors.primary, fontSize: 16, fontWeight: 'bold', marginRight: 8 }}>{currency}</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.text} />
          </View>
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity 
          style={styles.row}
          onPress={() => navigation.navigate('Budget')}
        >
          <View style={styles.rowLeft}>
            <Ionicons name="pie-chart-outline" size={22} color={colors.primary} style={styles.icon} />
            <Text style={[styles.text, { color: colors.text }]}>Budget</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity 
          style={styles.row}
          onPress={() => navigation.navigate('Categories')}
        >
          <View style={styles.rowLeft}>
            <Ionicons name="pricetag-outline" size={22} color={colors.primary} style={styles.icon} />
            <Text style={[styles.text, { color: colors.text }]}>Manage Categories</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity 
          style={styles.row}
          onPress={() => navigation.navigate('PaymentModes')}
        >
          <View style={styles.rowLeft}>
            <Ionicons name="card-outline" size={22} color={colors.primary} style={styles.icon} />
            <Text style={[styles.text, { color: colors.text }]}>Payment Modes</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={[styles.group, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Data Management</Text>
        <TouchableOpacity 
          style={styles.row}
          onPress={() => setIsImportModalVisible(true)}
        >
          <View style={styles.rowLeft}>
            <Ionicons name="document-text-outline" size={22} color={colors.primary} style={styles.icon} />
            <Text style={[styles.text, { color: colors.text }]}>Import from Google Sheets</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity 
          style={[styles.row, { opacity: isProcessing ? 0.5 : 1 }]}
          onPress={handleBackup}
          disabled={isProcessing}
        >
          <View style={styles.rowLeft}>
            <Ionicons name="save-outline" size={22} color={colors.primary} style={styles.icon} />
            <Text style={[styles.text, { color: colors.text }]}>Backup Data</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity 
          style={[styles.row, { opacity: isProcessing ? 0.5 : 1 }]}
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
          <View style={styles.rowLeft}>
            <Ionicons name="cloud-download-outline" size={22} color={colors.primary} style={styles.icon} />
            <Text style={[styles.text, { color: colors.text }]}>Restore Data</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={[styles.logoutButton, { backgroundColor: '#ff4444', marginTop: 10 }]} 
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
  group: {
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 52,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 15,
    width: 24,
    textAlign: 'center',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#888',
    opacity: 0.3,
    marginLeft: 54,
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 15,
    marginTop: 15,
    marginBottom: 5,
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
