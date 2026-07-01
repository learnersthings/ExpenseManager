import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useAuthContext } from '../context/AuthContext';
import { useThemeContext } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { isDarkTheme } = useThemeContext();
  const { user, updateProfile, changePassword } = useAuthContext();

  const [name, setName] = useState(user?.name || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  const [nameError, setNameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalMessage, setGeneralMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const placeholderColor = isDarkTheme ? '#888' : '#aaa';

  const handleUpdateProfile = async () => {
    setNameError('');
    setGeneralMessage('');
    setIsSuccess(false);

    if (!name.trim()) {
      setNameError('Name cannot be empty.');
      return;
    }

    try {
      await updateProfile(name);
      setGeneralMessage('Profile updated successfully!');
      setIsSuccess(true);
    } catch (error: any) {
      setGeneralMessage(error.message);
      setIsSuccess(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    setGeneralMessage('');
    setIsSuccess(false);

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError('Please fill in all password fields.');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    try {
      await changePassword(oldPassword, newPassword);
      setGeneralMessage('Password changed successfully!');
      setIsSuccess(true);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsChangingPassword(false);
    } catch (error: any) {
      setGeneralMessage(error.message);
      setIsSuccess(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {generalMessage ? (
          <View style={[styles.messageBox, { backgroundColor: isSuccess ? '#4caf5020' : '#ff444420', borderColor: isSuccess ? '#4caf50' : '#ff4444' }]}>
            <Text style={[styles.messageText, { color: isSuccess ? '#4caf50' : '#ff4444' }]}>{generalMessage}</Text>
          </View>
        ) : null}

        <View style={[styles.card, { backgroundColor: colors.card, shadowColor: isDarkTheme ? '#00FFFF' : '#000' }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Personal Information</Text>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={[
                styles.input, 
                { backgroundColor: isDarkTheme ? '#2a2a2a' : '#eaeaea', color: '#888', borderColor: isDarkTheme ? '#333' : '#e0e0e0' }
              ]}
              value={user?.email || ''}
              editable={false}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={[
                styles.input, 
                { backgroundColor: isDarkTheme ? '#1e1e1e' : '#f5f5f5', color: colors.text, borderColor: nameError ? '#ff4444' : (isDarkTheme ? '#333' : '#e0e0e0') }
              ]}
              placeholder="Your Name"
              placeholderTextColor={placeholderColor}
              value={name}
              onChangeText={(text) => { setName(text); setNameError(''); setGeneralMessage(''); }}
            />
            {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
          </View>

          <TouchableOpacity 
            style={[styles.button, { backgroundColor: colors.primary }]} 
            onPress={handleUpdateProfile}
          >
            <Text style={styles.buttonText}>Update Profile</Text>
          </TouchableOpacity>
        </View>

        {!isChangingPassword ? (
          <TouchableOpacity 
            style={[styles.rowButton, { backgroundColor: colors.card, shadowColor: isDarkTheme ? '#00FFFF' : '#000' }]}
            onPress={() => setIsChangingPassword(true)}
          >
            <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>Change Password</Text>
            <Ionicons name="chevron-forward" size={24} color={colors.text} />
          </TouchableOpacity>
        ) : (
          <View style={[styles.card, { backgroundColor: colors.card, shadowColor: isDarkTheme ? '#00FFFF' : '#000' }]}>
            <View style={styles.headerRow}>
              <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>Change Password</Text>
              <TouchableOpacity onPress={() => {
                setIsChangingPassword(false);
                setPasswordError('');
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
              }}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={[styles.inputWrapper, { marginTop: 20 }]}>
              <TextInput
                style={[
                  styles.input, 
                  { backgroundColor: isDarkTheme ? '#1e1e1e' : '#f5f5f5', color: colors.text, borderColor: passwordError ? '#ff4444' : (isDarkTheme ? '#333' : '#e0e0e0') }
                ]}
                placeholder="Current Password"
                placeholderTextColor={placeholderColor}
                value={oldPassword}
                onChangeText={(text) => { setOldPassword(text); setPasswordError(''); setGeneralMessage(''); }}
                secureTextEntry
              />
            </View>

            <View style={styles.inputWrapper}>
              <TextInput
                style={[
                  styles.input, 
                  { backgroundColor: isDarkTheme ? '#1e1e1e' : '#f5f5f5', color: colors.text, borderColor: passwordError ? '#ff4444' : (isDarkTheme ? '#333' : '#e0e0e0') }
                ]}
                placeholder="New Password"
                placeholderTextColor={placeholderColor}
                value={newPassword}
                onChangeText={(text) => { setNewPassword(text); setPasswordError(''); setGeneralMessage(''); }}
                secureTextEntry
              />
            </View>

            <View style={styles.inputWrapper}>
              <TextInput
                style={[
                  styles.input, 
                  { backgroundColor: isDarkTheme ? '#1e1e1e' : '#f5f5f5', color: colors.text, borderColor: passwordError ? '#ff4444' : (isDarkTheme ? '#333' : '#e0e0e0') }
                ]}
                placeholder="Confirm New Password"
                placeholderTextColor={placeholderColor}
                value={confirmPassword}
                onChangeText={(text) => { setConfirmPassword(text); setPasswordError(''); setGeneralMessage(''); }}
                secureTextEntry
              />
              {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
            </View>

            <TouchableOpacity 
              style={[styles.button, { backgroundColor: colors.primary, marginTop: 4 }]} 
              onPress={handleChangePassword}
            >
              <Text style={styles.buttonText}>Update Password</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  messageBox: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  messageText: {
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginBottom: 20,
  },
  rowButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  button: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
