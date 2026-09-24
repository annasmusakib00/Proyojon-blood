import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Vibration } from 'react-native';
import { Colors } from '../constants/colors';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

interface DonorAlertProps {
  requestId: string;
  bloodGroup: string;
  bagsNeeded: number;
  hospitalName: string;
  conveyanceAmount: number;
  onAccept: () => void;
  onProxy: () => void;
  onDecline: () => void;
}

export function DonorAlert({
  requestId,
  bloodGroup,
  bagsNeeded,
  hospitalName,
  conveyanceAmount,
  onAccept,
  onProxy,
  onDecline,
}: DonorAlertProps) {
  useEffect(() => {
    Vibration.vibrate([0, 500, 200, 500, 200, 500], true);
    return () => Vibration.cancel();
  }, []);

  const bloodGroupDisplay = bloodGroup
    .replace('_POS', '+')
    .replace('_NEG', '−');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.urgentIcon}>🚨</Text>
        <Text style={styles.urgentText}>EMERGENCY</Text>
        <Text style={styles.subtitle}>Blood Needed Urgently</Text>
      </View>

      <Card style={styles.detailsCard}>
        <View style={styles.bloodGroupRow}>
          <View style={styles.bloodGroupBadge}>
            <Text style={styles.bloodGroupText}>{bloodGroupDisplay}</Text>
          </View>
          <View style={styles.bagsInfo}>
            <Text style={styles.bagsCount}>{bagsNeeded}</Text>
            <Text style={styles.bagsLabel}>bags needed</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>🏥</Text>
          <View>
            <Text style={styles.infoLabel}>Hospital</Text>
            <Text style={styles.infoValue}>{hospitalName}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>💰</Text>
          <View>
            <Text style={styles.infoLabel}>Conveyance Allowance</Text>
            <Text style={styles.infoValue}>{conveyanceAmount} BDT</Text>
          </View>
        </View>
      </Card>

      <View style={styles.actions}>
        <Button title="✅ Accept (Going myself)" onPress={onAccept} />
        <Button title="🤝 Manage Proxy" onPress={onProxy} variant="secondary" style={{ marginTop: 12 }} />
        <Button title="Decline" onPress={onDecline} variant="danger" style={{ marginTop: 12 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  urgentIcon: { fontSize: 48, marginBottom: 12 },
  urgentText: { color: Colors.primary, fontSize: 28, fontWeight: '900', letterSpacing: 4 },
  subtitle: { color: Colors.textSecondary, fontSize: 16, marginTop: 4 },
  detailsCard: { marginBottom: 24 },
  bloodGroupRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24, marginBottom: 16 },
  bloodGroupBadge: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primaryGhost, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: Colors.primary },
  bloodGroupText: { color: Colors.primary, fontSize: 28, fontWeight: '900' },
  bagsInfo: { alignItems: 'center' },
  bagsCount: { color: Colors.text, fontSize: 48, fontWeight: '800' },
  bagsLabel: { color: Colors.textSecondary, fontSize: 14 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  infoIcon: { fontSize: 20, marginTop: 2 },
  infoLabel: { color: Colors.textSecondary, fontSize: 12 },
  infoValue: { color: Colors.text, fontSize: 16, fontWeight: '600' },
  actions: {},
});
