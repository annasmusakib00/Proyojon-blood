import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/colors';
import { Button } from './ui/Button';

interface JourneyTrackerProps {
  currentStatus: 'MATCHED' | 'IN_PROGRESS' | 'ARRIVED';
  onStartJourney: () => void;
  onReachedHospital: () => void;
  loading?: boolean;
}

/**
 * Sequential journey tracker UI for the donor.
 * Two steps: Start Journey → Reached Hospital.
 */
export function JourneyTracker({
  currentStatus,
  onStartJourney,
  onReachedHospital,
  loading = false,
}: JourneyTrackerProps) {
  const steps = [
    {
      key: 'start',
      label: 'Start Journey',
      icon: '🚗',
      completed: currentStatus === 'IN_PROGRESS' || currentStatus === 'ARRIVED',
      active: currentStatus === 'MATCHED',
    },
    {
      key: 'arrived',
      label: 'Reached Hospital',
      icon: '🏥',
      completed: currentStatus === 'ARRIVED',
      active: currentStatus === 'IN_PROGRESS',
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Journey</Text>

      <View style={styles.stepsContainer}>
        {steps.map((step, index) => (
          <View key={step.key} style={styles.stepRow}>
            {/* Step indicator */}
            <View style={styles.indicatorColumn}>
              <View
                style={[
                  styles.dot,
                  step.completed && styles.dotCompleted,
                  step.active && styles.dotActive,
                ]}
              >
                {step.completed ? (
                  <Text style={styles.checkmark}>✓</Text>
                ) : (
                  <Text style={styles.stepIcon}>{step.icon}</Text>
                )}
              </View>
              {index < steps.length - 1 && (
                <View
                  style={[
                    styles.line,
                    step.completed && styles.lineCompleted,
                  ]}
                />
              )}
            </View>

            {/* Step content */}
            <View style={styles.stepContent}>
              <Text
                style={[
                  styles.stepLabel,
                  step.completed && styles.stepLabelCompleted,
                ]}
              >
                {step.label}
              </Text>
              {step.completed && (
                <Text style={styles.stepDone}>Completed ✅</Text>
              )}
            </View>
          </View>
        ))}
      </View>

      {/* Action button */}
      {currentStatus === 'MATCHED' && (
        <Button
          title="🚗 Start Journey"
          onPress={onStartJourney}
          loading={loading}
          style={{ marginTop: 20 }}
        />
      )}
      {currentStatus === 'IN_PROGRESS' && (
        <Button
          title="🏥 Reached Hospital"
          onPress={onReachedHospital}
          loading={loading}
          style={{ marginTop: 20 }}
        />
      )}
      {currentStatus === 'ARRIVED' && (
        <View style={styles.waitingBox}>
          <Text style={styles.waitingText}>
            ⏳ Waiting for requester to confirm donation...
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
  },
  stepsContainer: {
    paddingLeft: 4,
  },
  stepRow: {
    flexDirection: 'row',
    minHeight: 60,
  },
  indicatorColumn: {
    alignItems: 'center',
    width: 40,
  },
  dot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotCompleted: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  dotActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryDark,
  },
  checkmark: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  stepIcon: {
    fontSize: 16,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.border,
    minHeight: 24,
  },
  lineCompleted: {
    backgroundColor: Colors.success,
  },
  stepContent: {
    flex: 1,
    paddingLeft: 12,
    paddingTop: 6,
  },
  stepLabel: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  stepLabelCompleted: {
    color: Colors.success,
  },
  stepDone: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  waitingBox: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    alignItems: 'center',
  },
  waitingText: {
    color: Colors.warning,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});
