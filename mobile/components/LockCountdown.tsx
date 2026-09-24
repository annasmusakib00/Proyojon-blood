import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { useCountdown } from '../hooks/useCountdown';
import { Card } from './ui/Card';

interface LockCountdownProps {
  lockEndDate: string | Date;
  lockStartDate?: string | Date;
}

/**
 * Displays the remaining lock period with a circular-style countdown.
 * Shows lock start and end dates.
 */
export function LockCountdown({ lockEndDate, lockStartDate }: LockCountdownProps) {
  const { days, hours, minutes, isExpired } = useCountdown(lockEndDate);

  if (isExpired) {
    return (
      <Card style={styles.expiredCard}>
        <Text style={styles.expiredIcon}>🎉</Text>
        <Text style={styles.expiredText}>
          Your rest period is over! Toggle your availability to start receiving
          requests.
        </Text>
      </Card>
    );
  }

  // Calculate progress (assuming 120-day lock)
  const totalDays = 120;
  const elapsed = totalDays - days;
  const progress = Math.min(elapsed / totalDays, 1);

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.lockIcon}>🔒</Text>
        <Text style={styles.title}>Resting Period</Text>
      </View>

      <View style={styles.countdownRow}>
        <View style={styles.timeBox}>
          <Text style={styles.timeValue}>{days}</Text>
          <Text style={styles.timeLabel}>days</Text>
        </View>
        <Text style={styles.timeSeparator}>:</Text>
        <View style={styles.timeBox}>
          <Text style={styles.timeValue}>{hours}</Text>
          <Text style={styles.timeLabel}>hrs</Text>
        </View>
        <Text style={styles.timeSeparator}>:</Text>
        <View style={styles.timeBox}>
          <Text style={styles.timeValue}>{minutes}</Text>
          <Text style={styles.timeLabel}>min</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <View style={styles.datesRow}>
        {lockStartDate && (
          <View>
            <Text style={styles.dateLabel}>Started</Text>
            <Text style={styles.dateValue}>
              {new Date(lockStartDate).toLocaleDateString('en-BD')}
            </Text>
          </View>
        )}
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.dateLabel}>Unlocks on</Text>
          <Text style={styles.dateValue}>
            {new Date(lockEndDate).toLocaleDateString('en-BD')}
          </Text>
        </View>
      </View>

      <Text style={styles.note}>
        You cannot donate or toggle availability during this period.
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lockIcon: {
    fontSize: 20,
  },
  title: {
    color: Colors.locked,
    fontSize: 18,
    fontWeight: '700',
  },
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  timeBox: {
    backgroundColor: Colors.background,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    minWidth: 70,
  },
  timeValue: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: '800',
  },
  timeLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  timeSeparator: {
    color: Colors.textMuted,
    fontSize: 24,
    fontWeight: '700',
  },
  progressTrack: {
    height: 6,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.locked,
    borderRadius: 3,
  },
  datesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateLabel: {
    color: Colors.textMuted,
    fontSize: 11,
  },
  dateValue: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  note: {
    color: Colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  expiredCard: {
    alignItems: 'center',
    gap: 12,
  },
  expiredIcon: {
    fontSize: 40,
  },
  expiredText: {
    color: Colors.success,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
  },
});
