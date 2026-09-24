import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors } from '../../constants/colors';

interface BadgeProps {
  type: 'HERO' | 'ORGANIZER';
  size?: 'small' | 'large';
}

export function Badge({ type, size = 'small' }: BadgeProps) {
  const glowAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.3,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [glowAnim]);

  const icon = type === 'HERO' ? '🏆' : '🤝';
  const label = type === 'HERO' ? 'Hero' : 'Organizer';
  const badgeColor = type === 'HERO' ? '#FFD700' : '#4CAF50';
  const isLarge = size === 'large';

  return (
    <View style={[styles.container, isLarge && styles.containerLarge]}>
      <Animated.View
        style={[
          styles.glow,
          {
            opacity: glowAnim,
            backgroundColor: badgeColor,
          },
        ]}
      />
      <View
        style={[
          styles.badge,
          isLarge && styles.badgeLarge,
          { borderColor: badgeColor },
        ]}
      >
        <Text style={[styles.icon, isLarge && styles.iconLarge]}>{icon}</Text>
        <Text style={[styles.label, isLarge && styles.labelLarge]}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerLarge: {
    marginVertical: 8,
  },
  glow: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    zIndex: -1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    gap: 4,
  },
  badgeLarge: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 24,
    gap: 8,
  },
  icon: {
    fontSize: 14,
  },
  iconLarge: {
    fontSize: 24,
  },
  label: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  labelLarge: {
    fontSize: 18,
  },
});
