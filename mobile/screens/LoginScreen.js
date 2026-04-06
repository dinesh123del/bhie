import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Input from '../components/Input';
import Button from '../components/Button';
import PremiumBackground from '../components/PremiumBackground';
import { authService } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import premiumFeedback from '../services/soundHelper';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    let valid = true;
    let newErrors = {};
    if (!email) { newErrors.email = 'Email required'; valid = false; }
    if (!password) { newErrors.password = 'Password required'; valid = false; }
    setErrors(newErrors);
    
    if (!valid) {
      premiumFeedback.warning();
    }
    
    return valid;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    await premiumFeedback.impact();
    
    try {
      await premiumFeedback.success();
      navigation.replace('Main');
    } catch (error) {
      await premiumFeedback.error();
      Alert.alert('Login Error', 'Something went wrong. Please check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PremiumBackground>
      <StatusBar style="light" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.form}>
          <View style={styles.titleBlock}>
            <Text style={styles.kicker}>Secure Sign In</Text>
            <Text style={styles.title}>BHIE <Text style={styles.highlight}>Mobile</Text></Text>
            <Text style={styles.subtitle}>Sign in to access your business dashboard on the go.</Text>
          </View>

          <Input 
            label="Email Address"
            placeholder="node_admin@bhie.com"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
          />

          <Input 
            label="Password"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            error={errors.password}
          />

          <Button 
            title={loading ? "Signing in..." : "Sign In Now"} 
            onPress={handleLogin}
            style={styles.loginBtn}
          />

          <TouchableOpacity 
            onPress={() => Alert.alert('Create Account', 'Please visit bhie.app on your browser to create a new account.')}
            style={styles.registerLink}
          >
            <Text style={styles.registerText}>
              New here? <Text style={styles.boldText}>Create Account</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </PremiumBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  form: {
    paddingHorizontal: 32,
  },
  titleBlock: {
    marginBottom: 48,
  },
  kicker: {
    fontSize: 10,
    fontWeight: '900',
    color: '#007AFF',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 12,
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: -2,
  },
  highlight: {
    color: '#007AFF',
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.4)',
    lineHeight: 22,
    marginBottom: 40,
    fontWeight: '500',
  },
  loginBtn: {
    marginTop: 20,
  },
  registerLink: {
    marginTop: 32,
    alignItems: 'center',
  },
  registerText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.4)',
    fontWeight: '600',
  },
  boldText: {
    color: '#007AFF',
    fontWeight: '800',
  }
});

export default LoginScreen;
