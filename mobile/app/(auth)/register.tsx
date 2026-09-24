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
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { BLOOD_GROUPS } from '../../constants/bloodGroups';
import { Button } from '../../components/ui/Button';
import * as authService from '../../services/auth';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || name.trim().length < 2) {
      Alert.alert('Error', 'Please enter your full name (at least 2 characters)');
      return;
    }
    if (!/^01[3-9]\d{8}$/.test(phone)) {
      Alert.alert('Error', 'Please enter a valid Bangladeshi phone number');
      return;
    }
    if (!selectedBloodGroup) {
      Alert.alert('Error', 'Please select your blood group');
      return;
    }

    setLoading(true);
    try {
      await authService.register(name.trim(), phone, selectedBloodGroup);
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>🩸</Text>
          <Text style={styles.appName}>প্রয়োজন</Text>
          <Text style={styles.tagline}>Save lives, one donation at a time</Text>
        </View>

        {/* Name Input */}
        <View style={styles.field}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor={Colors.textMuted}
            autoCapitalize="words"
          />
        </View>

        {/* Phone Input */}
        <View style={styles.field}>
          <Text style={styles.label}>Phone Number</Text>
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
        </View>

        {/* Blood Group Selector */}
        <View style={styles.field}>
          <Text style={styles.label}>Blood Group</Text>
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
                    selectedBloodGroup === group.value &&
                      styles.bloodGroupLabelSelected,
                  ]}
                >
                  {group.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Register Button */}
        <Button
          title="Register & Get OTP"
          onPress={handleRegister}
          loading={loading}
          style={{ marginTop: 16 }}
        />

        {/* Login Link */}
        <TouchableOpacity
          onPress={() => router.push('/(auth)/login')}
          style={styles.loginLink}
        >
          <Text style={styles.loginText}>
            Already have an account?{' '}
            <Text style={styles.loginTextHighlight}>Log in</Text>
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
    fontSize: 32,
    fontWeight: '900',
  },
  tagline: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
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
