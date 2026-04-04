import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Input from '../components/Input';
import Button from '../components/Button';
import PremiumBackground from '../components/PremiumBackground';
import { authService } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

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
    return valid;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.replace('Main');
    } catch (error) {
      Alert.alert('Protocol Error', 'Verification failed. Please check credentials.');
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
          <View className="mb-12">
            <Text style={styles.kicker}>Authorized Access Only</Text>
            <Text style={styles.title}>Elite <Text style={styles.highlight}>Mobile</Text></Text>
            <Text style={styles.subtitle}>Enter your credentials to synchronize with the BHIE dashboard.</Text>
          </View>

          <Input 
            label="Node Identifier"
            placeholder="node_admin@bhie.com"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
          />

          <Input 
            label="Security Protocol"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            error={errors.password}
          />

          <Button 
            title={loading ? "Authenticating..." : "Initialize Command"} 
            onPress={handleLogin}
            style={styles.loginBtn}
          />

          <TouchableOpacity 
            onPress={() => navigation.navigate('Register')}
            style={styles.registerLink}
          >
            <Text style={styles.registerText}>
              First-time activation? <Text style={styles.boldText}>Create Node</Text>
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
  kicker: {
    fontSize: 10,
    fontWeight: '900',
    color: '#38BDF8',
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
    color: '#38BDF8',
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
    color: '#38BDF8',
    fontWeight: '800',
  }
});

export default LoginScreen;
