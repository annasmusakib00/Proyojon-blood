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
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { BLOOD_GROUPS } from '../../constants/bloodGroups';
import { BD_DIVISIONS, getLocaleLabel } from '../../constants/locations';
import { Button } from '../../components/ui/Button';
import { Feather } from '@expo/vector-icons';
import * as authService from '../../services/auth';
import { t } from '../../utils/i18n';
import { useLocaleStore } from '../../stores/localeStore';

export default function RegisterScreen() {
  const router = useRouter();
  const { locale } = useLocaleStore();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedUpazila, setSelectedUpazila] = useState('');
  const [loading, setLoading] = useState(false);

  const currentDivision = BD_DIVISIONS.find((d) => d.value === selectedDivision);
  const currentDistrict = currentDivision?.districts.find((d) => d.value === selectedDistrict);

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
    } else if (step === 3) {
      if (!selectedBloodGroup) {
        Alert.alert('Error', 'Please select your blood group');
        return;
      }
      setStep(4);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleRegister = async () => {
    if (!selectedDivision || !selectedDistrict || !selectedUpazila) {
      Alert.alert('Error', 'Please select your current division, district and upazila');
      return;
    }

    setLoading(true);
    try {
      const locationText = `${selectedUpazila}, ${selectedDistrict}, ${selectedDivision}`;
      await authService.register(name.trim(), phone, selectedBloodGroup, password, locationText);
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
      <ScrollView contentContainerStyle={styles.contentScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.logo}>🩸</Text>
          <Text style={styles.appName} numberOfLines={1} adjustsFontSizeToFit>{t('register.title')}</Text>
          <Text style={styles.tagline}>{t('register.subtitle')}</Text>
        </View>

        <View style={styles.stepIndicator}>
          <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]} />
          <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
          <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]} />
          <View style={[styles.stepLine, step >= 3 && styles.stepLineActive]} />
          <View style={[styles.stepDot, step >= 3 && styles.stepDotActive]} />
          <View style={[styles.stepLine, step >= 4 && styles.stepLineActive]} />
          <View style={[styles.stepDot, step >= 4 && styles.stepDotActive]} />
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
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={password}
                  onChangeText={setPassword}
                  placeholder={t('register.passwordPlaceholder')}
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry={!showPassword}
                  textContentType="newPassword"
                  autoComplete="password-new"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  <Feather name={showPassword ? 'eye' : 'eye-off'} size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>{t('register.confirmPasswordLabel') || 'পাসওয়ার্ড নিশ্চিত করুন'}</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder={t('register.confirmPasswordPlaceholder')}
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry={!showConfirmPassword}
                  textContentType="newPassword"
                  autoComplete="password-new"
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                  <Feather name={showConfirmPassword ? 'eye' : 'eye-off'} size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
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

        {step === 4 && (
          <View style={styles.formContainer}>
            <View style={styles.field}>
              <Text style={styles.label}>বর্তমান বিভাগ</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                {BD_DIVISIONS.map((div) => (
                  <TouchableOpacity
                    key={div.value}
                    style={[styles.filterChip, selectedDivision === div.value && styles.filterChipActive]}
                    onPress={() => {
                      setSelectedDivision(div.value);
                      setSelectedDistrict('');
                      setSelectedUpazila('');
                    }}
                  >
                    <Text style={[styles.filterChipText, selectedDivision === div.value && styles.filterChipTextActive]}>
                      {getLocaleLabel(locale, div)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {currentDivision && (
              <View style={styles.field}>
                <Text style={styles.label}>বর্তমান জেলা</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                  {currentDivision.districts.map((dist) => (
                    <TouchableOpacity
                      key={dist.value}
                      style={[styles.filterChip, selectedDistrict === dist.value && styles.filterChipActive]}
                      onPress={() => {
                        setSelectedDistrict(dist.value);
                        setSelectedUpazila('');
                      }}
                    >
                      <Text style={[styles.filterChipText, selectedDistrict === dist.value && styles.filterChipTextActive]}>
                        {getLocaleLabel(locale, dist)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {currentDistrict && (
              <View style={styles.field}>
                <Text style={styles.label}>বর্তমান উপজেলা</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                  {currentDistrict.upazilas.map((upa) => (
                    <TouchableOpacity
                      key={upa.value}
                      style={[styles.filterChip, selectedUpazila === upa.value && styles.filterChipActive]}
                      onPress={() => setSelectedUpazila(upa.value)}
                    >
                      <Text style={[styles.filterChipText, selectedUpazila === upa.value && styles.filterChipTextActive]}>
                        {getLocaleLabel(locale, upa)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
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
            title={step === 4 ? t('register.button') : "Next"}
            onPress={step === 4 ? handleRegister : handleNext}
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentScroll: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    fontSize: 56,
    marginBottom: 16,
  },
  appName: {
    color: Colors.text,
    fontSize: 26,
    fontWeight: '900',
    marginBottom: 8,
    textAlign: 'center',
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
    backgroundColor: Colors.surfaceLight,
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
    backgroundColor: Colors.surfaceLight,
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
  passwordContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: Colors.text,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 16,
  },
  bloodGroupGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  bloodGroupCard: {
    width: '22%',
    aspectRatio: 1,
    backgroundColor: Colors.surfaceLight,
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
  filterScroll: { marginBottom: 6 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20,
    backgroundColor: Colors.surfaceLight, marginRight: 8,
    borderWidth: 1, borderColor: Colors.border,
  },
  filterChipActive: { backgroundColor: Colors.primaryGhost, borderColor: Colors.primary },
  filterChipText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  filterChipTextActive: { color: Colors.primary, fontWeight: '700' },
});
