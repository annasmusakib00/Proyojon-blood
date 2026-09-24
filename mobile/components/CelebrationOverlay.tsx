import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions } from 'react-native';
import { Colors } from '../constants/colors';

const { width, height } = Dimensions.get('window');

interface CelebrationOverlayProps {
  visible: boolean;
  donorName?: string;
  onDismiss: () => void;
}

export function CelebrationOverlay({ visible, donorName, onDismiss }: CelebrationOverlayProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const particles = useRef(
    Array.from({ length: 20 }, () => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      opacity: new Animated.Value(1),
      rotation: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    if (!visible) return;

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }),
    ]).start();

    particles.forEach((particle) => {
      const randomX = (Math.random() - 0.5) * width;
      const randomY = -(Math.random() * height * 0.6);
      Animated.parallel([
        Animated.timing(particle.x, { toValue: randomX, duration: 2000 + Math.random() * 1000, useNativeDriver: true }),
        Animated.timing(particle.y, { toValue: randomY, duration: 2000 + Math.random() * 1000, useNativeDriver: true }),
        Animated.timing(particle.opacity, { toValue: 0, duration: 2500, useNativeDriver: true }),
        Animated.timing(particle.rotation, { toValue: Math.random() * 720 - 360, duration: 2500, useNativeDriver: true }),
      ]).start();
    });

    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [visible, fadeAnim, scaleAnim, particles, onDismiss]);

  if (!visible) return null;

  const confettiColors = ['#DC2626', '#FFD700', '#059669', '#2563EB', '#D97706', '#7C3AED'];

  return (
    <TouchableOpacity style={styles.container} activeOpacity={1} onPress={onDismiss}>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        {particles.map((particle, i) => (
          <Animated.View
            key={i}
            style={[
              styles.particle,
              {
                backgroundColor: confettiColors[i % confettiColors.length],
                transform: [
                  { translateX: particle.x },
                  { translateY: particle.y },
                  { rotate: particle.rotation.interpolate({ inputRange: [-360, 360], outputRange: ['-360deg', '360deg'] }) },
                ],
                opacity: particle.opacity,
              },
            ]}
          />
        ))}

        <Animated.View style={[styles.content, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.trophyIcon}>🏆</Text>
          <Text style={styles.title}>Hero Badge Earned!</Text>
          {donorName && <Text style={styles.subtitle}>Thank you, {donorName}!</Text>}
          <Text style={styles.message}>
            You've just saved a life. You are now a Hero.{'\n'}Enjoy your well-deserved 4-month rest period.
          </Text>
          <Text style={styles.tapHint}>Tap anywhere to continue</Text>
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFillObject, zIndex: 1000 },
  overlay: { flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.95)', alignItems: 'center', justifyContent: 'center' },
  particle: { position: 'absolute', width: 12, height: 12, borderRadius: 2, top: '60%', left: '50%' },
  content: { alignItems: 'center', paddingHorizontal: 40 },
  trophyIcon: { fontSize: 80, marginBottom: 20 },
  title: { color: Colors.primary, fontSize: 32, fontWeight: '900', textAlign: 'center', marginBottom: 8 },
  subtitle: { color: Colors.text, fontSize: 20, fontWeight: '600', marginBottom: 16 },
  message: { color: Colors.textSecondary, fontSize: 16, textAlign: 'center', lineHeight: 24, marginBottom: 32 },
  tapHint: { color: Colors.textMuted, fontSize: 13 },
});
