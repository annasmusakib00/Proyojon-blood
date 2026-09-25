import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
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
import { useLocaleStore } from '../../stores/localeStore';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('');
  const [loading, setLoading] = useState(false);

  const { locale } = useLocaleStore();

  const handleRegister = async () => {
    if (!name.trim() || name.trim().length < 2) {
      Alert.alert('Error', 'Please enter your full name (at least 2 characters)');
      return;
    }
    if (!/^01[3-9]\d{8}$/.test(phone)) {
      Alert.alert('Error', 'Please enter a valid Bangladeshi phone number');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.logo}>🩸</Text>
          <Text style={styles.appName}>{t('register.title')}</Text>
          <Text style={styles.tagline}>{t('register.subtitle')}</Text>
        </View>

        <View style={styles.field}>
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

        <View style={styles.field}>
          <Text style={styles.label}>{t('register.passwordLabel')}</Text>
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
          <Text style={styles.label}>{t('register.confirmPasswordLabel')}</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder={t('register.confirmPasswordPlaceholder')}
            placeholderTextColor={Colors.textMuted}
            secureTextEntry
          />
        </View>

        <View style={styles.field}>
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

        <Button
          title={t('register.button')}
          onPress={handleRegister}
          loading={loading}
          style={{ marginTop: 16 }}
        />

        <TouchableOpacity
          onPress={() => router.push('/(auth)/login')}
          style={styles.loginLink}
        >
          <Text style={styles.loginText}>
            {t('register.haveAccount')}{' '}
            <Text style={styles.loginTextHighlight}>{t('register.loginLink')}</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 56,
    marginBottom: 12,
  },
  appName: {
    color: Colors.primary,
    fontSize: 28,
    fontWeight: '900',
  },
  tagline: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  field: {
    marginBottom: 16,
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
    marginTop: 10,
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
  loginLink: {
    marginTop: 20,
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
