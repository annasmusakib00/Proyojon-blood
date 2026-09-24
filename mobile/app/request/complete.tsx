import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Button } from '../../components/ui/Button';

export default function CompleteScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🎉</Text>
      <Text style={styles.title}>Donation Successful!</Text>
      <Text style={styles.subtitle}>
        Thank you for using Proyojon.{'\n'}A life has been saved today.
      </Text>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          The donor has been awarded their Hero Badge and is now in a 4-month
          rest period.
        </Text>
      </View>

      <Button
        title="Back to Home"
        onPress={() => router.replace('/(tabs)/dashboard')}
        style={{ marginTop: 32, minWidth: 200 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  icon: {
    fontSize: 72,
    marginBottom: 20,
  },
  title: {
    color: Colors.primary,
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  infoBox: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.success,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoText: {
    color: Colors.text,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
});
