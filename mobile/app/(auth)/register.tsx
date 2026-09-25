import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { BLOOD_GROUPS } from '../../constants/bloodGroups';
import { Button } from '../../components/ui/Button';
import * as authService from '../../services/auth';
import { t } from '../../utils/i18n';

export default function RegisterScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    if (step === 1) {
      if (!name.trim() || name.trim().length < 2) {
        Alert.alert('Error', 'Please enter your full name (at least 2 characters)');
        return;
      }
      if (!/^01[3-9]\d{8}$/.test(phone)) {
        Alert.alert('Error', 'Please enter a valid Bangladeshi phone number');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (password.length < 6) {
        Alert.alert('Error', 'Password must be at least 6 characters');
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return;
      }
      setStep(3);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleRegister = async () => {
    if (!selectedBloodGroup) {
      Alert.alert('Error', 'Please select your blood group');
      return;
    }

    setLoading(true);
    try {
      await authService.register(name.trim(), phone, selectedBloodGroup, password);
      router.push({
        pathname: '/(auth)/verify-otp',
        params: { phone },
      });
    } catch (error: any) {
      const message =
        error.response?.data?.error?.message || 'Registration failed. Please try again.';
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
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>🩸</Text>
          </View>
          <Text style={styles.appName}>{t('register.title')}</Text>
          <Text style={styles.tagline}>{t('register.subtitle')}</Text>
        </View>

        <View style={styles.stepIndicator}>
          <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]} />
          <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
          <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]} />
          <View style={[styles.stepLine, step >= 3 && styles.stepLineActive]} />
          <View style={[styles.stepDot, step >= 3 && styles.stepDotActive]} />
        </View>

        {step === 1 && (
          <View style={styles.formContainer}>
            <View style={styles.field}>
              <Text style={styles.label}>{t('register.nameLabel') || 'পুরো নাম'}</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder={t('register.namePlaceholder')}
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>{t('register.phoneLabel') || 'ফোন নম্বর'}</Text>
              <View style={styles.phoneRow}>
                <View style={styles.countryCode}>
                  <Text style={styles.countryCodeText}>+88</Text>
                </View>
                <TextInput
                  style={[styles.input, styles.phoneInput]}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder={t('register.phonePlaceholder')}
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="phone-pad"
                  maxLength={11}
                />
              </View>
            </View>
          </View>
        )}

        {step === 2 && (
          <View style={styles.formContainer}>
            <View style={styles.field}>
              <Text style={styles.label}>{t('register.passwordLabel') || 'পাসওয়ার্ড'}</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder={t('register.passwordPlaceholder')}
                placeholderTextColor={Colors.textMuted}
                secureTextEntry
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>{t('register.confirmPasswordLabel') || 'পাসওয়ার্ড নিশ্চিত করুন'}</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder={t('register.confirmPasswordPlaceholder')}
                placeholderTextColor={Colors.textMuted}
                secureTextEntry
              />
            </View>
          </View>
        )}

        {step === 3 && (
          <View style={styles.formContainer}>
            <View style={styles.field}>
              <Text style={styles.label}>{t('register.bloodGroupLabel') || 'রক্তের গ্রুপ'}</Text>
              <View style={styles.bloodGroupGrid}>
                {BLOOD_GROUPS.map((group) => (
                  <TouchableOpacity
                    key={group.value}
                    style={[
                      styles.bloodGroupCard,
                      selectedBloodGroup === group.value && styles.bloodGroupSelected,
                    ]}
                    onPress={() => setSelectedBloodGroup(group.value)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.bloodGroupLabel,
                        selectedBloodGroup === group.value && styles.bloodGroupLabelSelected,
                      ]}
                    >
                      {group.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        <View style={styles.buttonRow}>
          {step > 1 && (
            <Button
              title="Back"
              variant="outline"
              onPress={handleBack}
              style={{ flex: 1, marginRight: 8 }}
            />
          )}
          <Button
            title={step === 3 ? t('register.button') : "Next"}
            onPress={step === 3 ? handleRegister : handleNext}
            loading={loading}
            style={{ flex: 2 }}
          />
        </View>

        <TouchableOpacity
          onPress={() => router.push('/(auth)/login')}
          style={styles.loginLink}
        >
          <Text style={styles.loginText}>
            {t('register.haveAccount')}{' '}
            <Text style={styles.loginTextHighlight}>{t('register.loginLink')}</Text>
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
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFEAEA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 3,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  logo: {
    fontSize: 40,
  },
  appName: {
    color: Colors.primary,
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 8,
  },
  tagline: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.border,
  },
  stepDotActive: {
    backgroundColor: Colors.primary,
    transform: [{ scale: 1.2 }],
  },
  stepLine: {
    width: 40,
    height: 3,
    backgroundColor: Colors.border,
    marginHorizontal: 4,
  },
  stepLineActive: {
    backgroundColor: Colors.primary,
  },
  formContainer: {
    height: 220,
    justifyContent: 'center',
  },
  field: {
    marginBottom: 16,
  },
  label: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    marginLeft: 4,
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
  phoneRow: {
    flexDirection: 'row',
    gap: 8,
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
  phoneInput: {
    flex: 1,
  },
  bloodGroupGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  bloodGroupCard: {
    width: '22%',
    aspectRatio: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  bloodGroupSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  bloodGroupLabel: {
    color: Colors.textSecondary,
    fontSize: 18,
    fontWeight: '700',
  },
  bloodGroupLabelSelected: {
    color: '#FFFFFF',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  loginLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  loginText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  loginTextHighlight: {
    color: Colors.primary,
    fontWeight: '600',
  },
});
