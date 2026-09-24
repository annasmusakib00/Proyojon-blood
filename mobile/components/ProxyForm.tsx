import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';

interface ProxyFormProps {
  visible: boolean;
  onSubmit: (proxyName: string, proxyPhone: string) => void;
  onClose: () => void;
  loading?: boolean;
}

/**
 * Form to submit a proxy donor's name and phone number.
 * Validates Bangladeshi phone number format.
 */
export function ProxyForm({
  visible,
  onSubmit,
  onClose,
  loading = false,
}: ProxyFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    const phoneRegex = /^01[3-9]\d{8}$/;
    if (!phoneRegex.test(phone)) {
      newErrors.phone = 'Enter a valid Bangladeshi phone number (e.g. 01712345678)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(name.trim(), phone);
      setName('');
      setPhone('');
      setErrors({});
    }
  };

  return (
    <Modal visible={visible} onClose={onClose} title="🤝 Arrange Proxy Donor">
      <View style={styles.content}>
        <Text style={styles.description}>
          Enter the details of someone who can donate on your behalf.
        </Text>

        <View style={styles.field}>
          <Text style={styles.label}>Proxy Donor's Name</Text>
          <TextInput
            style={[styles.input, errors.name ? styles.inputError : null]}
            value={name}
            onChangeText={setName}
            placeholder="Full name"
            placeholderTextColor={Colors.textMuted}
          />
          {errors.name && <Text style={styles.error}>{errors.name}</Text>}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={[styles.input, errors.phone ? styles.inputError : null]}
            value={phone}
            onChangeText={setPhone}
            placeholder="01XXXXXXXXX"
            placeholderTextColor={Colors.textMuted}
            keyboardType="phone-pad"
            maxLength={11}
          />
          {errors.phone && <Text style={styles.error}>{errors.phone}</Text>}
        </View>

        <Button
          title="Submit Proxy"
          onPress={handleSubmit}
          loading={loading}
          style={{ marginTop: 8 }}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
  },
  description: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  field: {
    gap: 6,
  },
  label: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: Colors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputError: {
    borderColor: Colors.error,
  },
  error: {
    color: Colors.error,
    fontSize: 12,
  },
});
