import React, { memo, useRef, useState } from 'react';
import { View, TextInput, StyleSheet, Pressable, Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withTiming, withSpring } from 'react-native-reanimated';
import { useTheme } from '@theme/ThemeProvider';
import { textVariants } from '@theme/typography';
import { spacing, borderRadius } from '@theme/spacing';

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (otp: string) => void;
  error?: boolean;
}

const OTPBox = memo<{ digit: string; isFocused: boolean; hasError: boolean }>(({ digit, isFocused, hasError }) => {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  React.useEffect(() => {
    if (digit) {
      scale.value = withSequence(withSpring(1.15, { damping: 8 }), withSpring(1, { damping: 8 }));
    }
  }, [digit]);

  const borderColor = hasError
    ? theme.colors.error
    : isFocused
    ? theme.colors.primary
    : digit
    ? theme.colors.borderStrong
    : theme.colors.border;

  return (
    <Animated.View
      style={[
        styles.box,
        { backgroundColor: theme.colors.surface, borderColor, borderWidth: isFocused ? 1.5 : 1 },
        animStyle,
      ]}
    >
      <Text style={[textVariants.headlineMedium, { color: theme.colors.textPrimary }]}>
        {digit ? '•' : ''}
      </Text>
      {isFocused && !digit && <View style={[styles.cursor, { backgroundColor: theme.colors.primary }]} />}
    </Animated.View>
  );
});

const OTPInput = memo<OTPInputProps>(({ length = 6, value, onChange, error }) => {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const inputRef = useRef<TextInput>(null);
  const digits = value.split('').concat(Array(length).fill('')).slice(0, length);

  const handleChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, length);
    onChange(cleaned);
    setFocusedIndex(Math.min(cleaned.length, length - 1));
  };

  return (
    <Pressable style={styles.container} onPress={() => inputRef.current?.focus()}>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        keyboardType="numeric"
        maxLength={length}
        style={styles.hiddenInput}
        onFocus={() => setFocusedIndex(Math.min(value.length, length - 1))}
        onBlur={() => setFocusedIndex(-1)}
      />
      <View style={styles.boxes}>
        {digits.map((digit, i) => (
          <OTPBox key={i} digit={digit} isFocused={focusedIndex === i} hasError={!!error} />
        ))}
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  hiddenInput: { position: 'absolute', opacity: 0, height: 0 },
  boxes: { flexDirection: 'row', gap: spacing[2] },
  box: { width: 48, height: 56, borderRadius: borderRadius.lg, alignItems: 'center', justifyContent: 'center' },
  cursor: { width: 2, height: 24, borderRadius: 1 },
});

OTPInput.displayName = 'OTPInput';
export default OTPInput;
