import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onPress) onPress();
  };

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={isDisabled}
        activeOpacity={0.8}
        style={[
          styles.primaryWrapper,
          isDisabled && styles.disabledPrimary,
          style,
        ]}
      >
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.primaryButton}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <Text style={[styles.primaryText, textStyle]}>{title}</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.secondaryButton,
        variant === 'danger' && styles.dangerButton,
        variant === 'outline' && styles.outlineButton,
        isDisabled && styles.disabledSecondary,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'danger' ? Colors.error : Colors.primary}
          size="small"
        />
      ) : (
        <Text
          style={[
            styles.secondaryText,
            variant === 'danger' && styles.dangerText,
            variant === 'outline' && styles.outlineText,
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  primaryWrapper: {
    borderRadius: 14,
  },
  primaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
    
    // 3D Pushable effect
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.25)',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.1)',
    borderRightWidth: 1,
    borderRightColor: Colors.primaryDark,
    borderBottomWidth: 5,
    borderBottomColor: '#7F1D1D',
  },
  disabledPrimary: {
    opacity: 0.6,
    borderBottomWidth: 1, // Look pushed down
    transform: [{ translateY: 4 }], // Physically moved down
    shadowOpacity: 0.1,
    elevation: 2,
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  secondaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: Colors.surfaceLight,
    
    // 3D effect
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    borderBottomWidth: 4,
    borderBottomColor: 'rgba(0,0,0,0.4)',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.05)',
    borderRightWidth: 1,
    borderRightColor: 'rgba(0,0,0,0.2)',
  },
  dangerButton: {
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    borderTopColor: 'rgba(220, 38, 38, 0.3)',
    borderBottomColor: 'rgba(220, 38, 38, 0.6)',
  },
  disabledSecondary: {
    opacity: 0.6,
    borderBottomWidth: 1,
    transform: [{ translateY: 3 }],
  },
  secondaryText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  dangerText: {
    color: Colors.error,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderTopColor: Colors.border,
    borderBottomColor: Colors.border,
    borderBottomWidth: 1,
  },
  outlineText: {
    color: Colors.textSecondary,
    fontWeight: '700',
  },
});
