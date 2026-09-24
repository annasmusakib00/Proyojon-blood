import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Colors } from '../constants/colors';

interface RadarAnimationProps {
  message?: string;
}

export function RadarAnimation({
  message = 'Searching for donors nearby...',
}: RadarAnimationProps) {
  const pulse1 = useRef(new Animated.Value(0)).current;
  const pulse2 = useRef(new Animated.Value(0)).current;
  const pulse3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createPulse = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1, duration: 2000, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      );

    createPulse(pulse1, 0).start();
    createPulse(pulse2, 600).start();
    createPulse(pulse3, 1200).start();
  }, [pulse1, pulse2, pulse3]);

  const renderRing = (anim: Animated.Value) => {
    const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 2.5] });
    const opacity = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.5, 0.2, 0] });
    return (
      <Animated.View style={[styles.ring, { transform: [{ scale }], opacity }]} />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.radarContainer}>
        {renderRing(pulse1)}
        {renderRing(pulse2)}
        {renderRing(pulse3)}
        <View style={styles.centerDot}>
          <Text style={styles.dropIcon}>🩸</Text>
        </View>
      </View>
      <Text style={styles.message}>{message}</Text>
      <Text style={styles.subMessage}>Notifying donors within 5 km radius</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  radarContainer: { width: 250, height: 250, alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  ring: { position: 'absolute', width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: Colors.primary, backgroundColor: Colors.primaryGhost },
  centerDot: { width: 60, height: 60, borderRadius: 30, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', shadowColor: Colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 10 },
  dropIcon: { fontSize: 28 },
  message: { color: Colors.text, fontSize: 18, fontWeight: '600', marginBottom: 8 },
  subMessage: { color: Colors.textSecondary, fontSize: 14 },
});
