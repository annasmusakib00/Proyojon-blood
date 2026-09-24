import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Colors } from '../constants/colors';

interface ConveyanceAgreementProps {
  visible: boolean;
  amount: number;
  onAccept: () => void;
  onClose: () => void;
}

export function ConveyanceAgreement({
  visible,
  amount,
  onAccept,
  onClose,
}: ConveyanceAgreementProps) {
  return (
    <Modal visible={visible} onClose={onClose} title="Conveyance Agreement">
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>🤝</Text>
      </View>
      
      <Text style={styles.message}>
        By proceeding, you agree to pay the donor a conveyance allowance of{' '}
        <Text style={styles.amount}>৳{amount}</Text> upon their arrival at the
        hospital.
      </Text>
      
      <View style={styles.warningBox}>
        <Text style={styles.warningIcon}>⚠️</Text>
        <Text style={styles.warningText}>
          This ensures donors can travel quickly during emergencies without
          financial hesitation.
        </Text>
      </View>

      <View style={styles.actions}>
        <Button
          title="I Agree & Request Blood"
          onPress={onAccept}
          style={{ marginBottom: 12 }}
        />
        <Button
          title="Cancel"
          onPress={onClose}
          variant="secondary"
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 48,
  },
  message: {
    color: Colors.text,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  amount: {
    color: Colors.primary,
    fontWeight: '800',
    fontSize: 18,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceLight,
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  warningIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  warningText: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  actions: {
    marginTop: 8,
  },
});
