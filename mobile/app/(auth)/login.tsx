import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Button } from '../../components/ui/Button';
import * as authService from '../../services/auth';

export default function LoginScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!/^01[3-9]\d{8}$/.test(phone)) {
      Alert.alert('Error', 'Please enter a valid Bangladeshi phone number');
      return;
    }

    setLoading(true);
    try {
      await authService.register('', phone, '');
      router.push({
        pathname: '/(auth)/verify-otp',
        params: { phone },
      });
    } catch (error: any) {
      const message =
        error.response?.data?.error?.message || 'Failed to send OTP. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.logo}>🩸</Text>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>
          Enter your phone number to receive an OTP
        </Text>

        <View style={styles.phoneRow}>
          <View style={styles.countryCode}>
            <Text style={styles.countryCodeText}>+88</Text>
          </View>
          <TextInput
            style={[styles.input, styles.phoneInput]}
            value={phone}
            onChangeText={setPhone}
            placeholder="01XXXXXXXXX"
            placeholderTextColor={Colors.textMuted}
            keyboardType="phone-pad"
            maxLength={11}
          />
        </View>

        <Button
          title="Send OTP"
          onPress={handleLogin}
          loading={loading}
          style={{ marginTop: 24 }}
        />

        <TouchableOpacity
          onPress={() => router.push('/(auth)/register')}
          style={styles.registerLink}
        >
          <Text style={styles.registerText}>
            Don't have an account?{' '}
            <Text style={styles.registerHighlight}>Register</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 56,
    marginBottom: 16,
  },
  title: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 15,
    marginBottom: 32,
  },
  phoneRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  countryCode: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  countryCodeText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: Colors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  phoneInput: {
    flex: 1,
  },
  registerLink: {
    marginTop: 24,
  },
  registerText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  registerHighlight: {
    color: Colors.primary,
    fontWeight: '600',
  },
});
