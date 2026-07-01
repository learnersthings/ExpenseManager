import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useAuthContext } from '../context/AuthContext';
import { useThemeContext } from '../context/ThemeContext';

export default function SignupScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { register } = useAuthContext();
  const { isDarkTheme } = useThemeContext();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');

  const placeholderColor = isDarkTheme ? '#888' : '#aaa';

  const handleSignup = async () => {
    let isValid = true;
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setGeneralError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name.trim()) {
      setNameError('Name is required');
      isValid = false;
    }
    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!emailRegex.test(email.trim())) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    }
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    }

    if (!isValid) return;

    try {
      await register(email, password);
    } catch (error: any) {
      setGeneralError(error.message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
      
      {generalError ? <Text style={styles.errorTextCenter}>{generalError}</Text> : null}

      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input, 
            { backgroundColor: colors.card, color: colors.text, borderColor: nameError ? '#ff4444' : colors.border }
          ]}
          placeholder="Full Name"
          placeholderTextColor={placeholderColor}
          value={name}
          onChangeText={(text) => { setName(text); setNameError(''); setGeneralError(''); }}
        />
        {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}

        <TextInput
          style={[
            styles.input, 
            { backgroundColor: colors.card, color: colors.text, borderColor: emailError ? '#ff4444' : colors.border }
          ]}
          placeholder="Email"
          placeholderTextColor={placeholderColor}
          value={email}
          onChangeText={(text) => { setEmail(text); setEmailError(''); setGeneralError(''); }}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

        <TextInput
          style={[
            styles.input, 
            { backgroundColor: colors.card, color: colors.text, borderColor: passwordError ? '#ff4444' : colors.border }
          ]}
          placeholder="Password"
          placeholderTextColor={placeholderColor}
          value={password}
          onChangeText={(text) => { setPassword(text); setPasswordError(''); setGeneralError(''); }}
          secureTextEntry
        />
        {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
      </View>

      <TouchableOpacity 
        style={[styles.button, { backgroundColor: colors.primary }]} 
        onPress={handleSignup}
      >
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={[styles.link, { color: colors.primary }]}>
          Already have an account? Log in
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 4,
    fontSize: 16,
    marginTop: 12,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4,
  },
  errorTextCenter: {
    color: '#ff4444',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  link: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
});
