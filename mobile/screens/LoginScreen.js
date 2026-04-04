import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from 'react-native';
import Input from '../components/Input';
import Button from '../components/Button';
import { authService } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { registerForPushNotificationsAsync } from '../src/services/pushNotifications';
import { REGISTER_TOKEN_URL } from '../src/config/api';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    let valid = true;
    let newErrors = {};
    if (!email) { newErrors.email = 'Email is required'; valid = false; }
    if (!password) { newErrors.password = 'Password is required'; valid = false; }
    setErrors(newErrors);
    return valid;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      // Mock login for demo
      // const res = await authService.login({ email, password });
      // await AsyncStorage.setItem('token', res.data.token);
      
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Register Push Token if available
      try {
        const token = await registerForPushNotificationsAsync();
        if (token) {
          await fetch(REGISTER_TOKEN_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pushToken: token, email }),
          });
        }
      } catch (tokenError) {
        console.warn('Failed to register push token during login:', tokenError);
      }

      navigation.replace('Main');
    } catch (error) {
      Alert.alert('Error', 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.form}>
        <Text style={styles.title}>BHIE Mobile</Text>
        <Text style={styles.subtitle}>Sign in to manage your SaaS dashboard</Text>

        <Input 
          label="Email Address"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          error={errors.email}
        />

        <Input 
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          error={errors.password}
        />

        <Button 
          title={loading ? "Signing in..." : "Sign In"} 
          onPress={handleLogin}
          style={styles.loginBtn}
        />

        <TouchableOpacity 
          onPress={() => navigation.navigate('Register')}
          style={styles.registerLink}
        >
          <Text style={styles.registerText}>
            Don't have an account? <Text style={styles.boldText}>Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
    justifyContent: 'center',
  },
  form: {
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 40,
    fontWeight: '900',
    color: '#1A1A1A',
    marginBottom: 8,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  loginBtn: {
    marginTop: 20,
  },
  registerLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  registerText: {
    fontSize: 14,
    color: '#666',
  },
  boldText: {
    color: '#007AFF',
    fontWeight: '700',
  }
});

export default LoginScreen;
