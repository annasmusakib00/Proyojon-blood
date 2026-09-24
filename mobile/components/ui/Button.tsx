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
import { Colors } from '../../constants/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
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

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
        style={[
          styles.primaryButton,
          isDisabled && styles.disabledPrimary,
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" size="small" />
        ) : (
          <Text style={[styles.primaryText, textStyle]}>{title}</Text>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.secondaryButton,
        variant === 'danger' && styles.dangerButton,
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
  primaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  disabledPrimary: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  secondaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryGhost,
  },
  dangerButton: {
    borderColor: Colors.error,
    backgroundColor: 'rgba(220, 38, 38, 0.05)',
  },
  disabledSecondary: {
    opacity: 0.5,
    borderColor: Colors.textMuted,
  },
  secondaryText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  dangerText: {
    color: Colors.error,
  },
});
