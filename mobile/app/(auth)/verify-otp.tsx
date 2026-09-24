import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Button } from '../../components/ui/Button';
import * as authService from '../../services/auth';
import { useAuthStore } from '../../stores/authStore';

export default function VerifyOtpScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const login = useAuthStore((s) => s.login);

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (index === 5 && value) {
      const fullOtp = newOtp.join('');
      if (fullOtp.length === 6) {
        handleVerify(fullOtp);
      }
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (otpCode?: string) => {
    const code = otpCode || otp.join('');
    if (code.length !== 6) {
      Alert.alert('Error', 'Please enter the full 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const { token, user } = await authService.verifyOtp(phone!, code);
      login(token, user);
      router.replace('/(tabs)/dashboard');
    } catch (error: any) {
      const message =
        error.response?.data?.error?.message || 'Invalid OTP. Please try again.';
      Alert.alert('Error', message);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    try {
      await authService.register('', phone!, '');
      setResendTimer(60);
      Alert.alert('Success', 'A new OTP has been sent to your phone');
    } catch {
      Alert.alert('Error', 'Failed to resend OTP');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.icon}>🔐</Text>
        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit code sent to{'\n'}
          <Text style={styles.phone}>+88{phone}</Text>
        </Text>

        <View style={styles.otpRow}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={({ nativeEvent }) =>
                handleKeyPress(nativeEvent.key, index)
              }
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              autoFocus={index === 0}
            />
          ))}
        </View>

        <Button
          title="Verify"
          onPress={() => handleVerify()}
          loading={loading}
          disabled={otp.join('').length !== 6}
          style={{ marginTop: 24 }}
        />

        <View style={styles.resendRow}>
          {resendTimer > 0 ? (
            <Text style={styles.resendTimer}>
              Resend OTP in {resendTimer}s
            </Text>
          ) : (
            <Text style={styles.resendLink} onPress={handleResend}>
              Resend OTP
            </Text>
          )}
        </View>
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
  icon: {
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
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  phone: {
    color: Colors.primary,
    fontWeight: '700',
  },
  otpRow: {
    flexDirection: 'row',
    gap: 10,
  },
  otpBox: {
    width: 48,
    height: 56,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    color: Colors.text,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  otpBoxFilled: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryGhost,
  },
  resendRow: {
    marginTop: 24,
  },
  resendTimer: {
    color: Colors.textMuted,
    fontSize: 14,
  },
  resendLink: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
