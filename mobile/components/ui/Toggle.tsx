import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, View, StyleSheet, Animated } from 'react-native';
import { Colors } from '../../constants/colors';

interface ToggleProps {
  value: boolean;
  onToggle: (newValue: boolean) => void;
  disabled?: boolean;
}

/**
 * Custom toggle switch for "Available to Donate".
 * Red = available, Gray = unavailable. Smooth color transition.
 */
export function Toggle({ value, onToggle, disabled = false }: ToggleProps) {
  const translateX = useRef(new Animated.Value(value ? 24 : 0)).current;
  const bgColor = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: value ? 24 : 0,
        useNativeDriver: true,
        bounciness: 8,
      }),
      Animated.timing(bgColor, {
        toValue: value ? 1 : 0,
        duration: 250,
        useNativeDriver: false,
      }),
    ]).start();
  }, [value, translateX, bgColor]);

  const backgroundColor = bgColor.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.unavailable, Colors.primary],
  });

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => !disabled && onToggle(!value)}
      disabled={disabled}
      style={[styles.wrapper, disabled && styles.disabled]}
    >
      <Animated.View style={[styles.track, { backgroundColor }]}>
        <Animated.View
          style={[
            styles.thumb,
            { transform: [{ translateX }] },
          ]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'flex-start',
  },
  disabled: {
    opacity: 0.5,
  },
  track: {
    width: 52,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});
