import React, { memo, useState, forwardRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useTheme } from '@theme/ThemeProvider';
import { textVariants } from '@theme/typography';
import { spacing, borderRadius } from '@theme/spacing';

interface CustomInputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  isPassword?: boolean;
  isRequired?: boolean;
}

const CustomInput = memo(forwardRef<TextInput, CustomInputProps>(({
  label, error, hint, leftIcon, rightIcon, onRightIconPress,
  containerStyle, isPassword, isRequired, ...props
}, ref) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const borderWidth = useSharedValue(1);

  const animatedBorder = useAnimatedStyle(() => ({
    borderWidth: borderWidth.value,
  }));

  const handleFocus = (e: Parameters<NonNullable<TextInputProps['onFocus']>>[0]) => {
    setIsFocused(true);
    borderWidth.value = withTiming(1.5, { duration: 200 });
    props.onFocus?.(e);
  };

  const handleBlur = (e: Parameters<NonNullable<TextInputProps['onBlur']>>[0]) => {
    setIsFocused(false);
    borderWidth.value = withTiming(1, { duration: 200 });
    props.onBlur?.(e);
  };

  const borderColor = error
    ? theme.colors.error
    : isFocused
    ? theme.colors.primary
    : theme.colors.border;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[textVariants.labelMedium, { color: isFocused ? theme.colors.primary : theme.colors.textSecondary, marginBottom: spacing[1.5] }]}>
          {label}{isRequired && <Text style={{ color: theme.colors.error }}> *</Text>}
        </Text>
      )}
      <Animated.View style={[styles.inputWrapper, { backgroundColor: theme.colors.surface, borderColor }, animatedBorder]}>
        {leftIcon && (
          <Ionicons name={leftIcon} size={20} color={isFocused ? theme.colors.primary : theme.colors.textTertiary} style={styles.leftIcon} />
        )}
        <TextInput
          ref={ref}
          style={[
            textVariants.bodyMedium,
            styles.input,
            { color: theme.colors.textPrimary, flex: 1 },
          ]}
          placeholderTextColor={theme.colors.textTertiary}
          secureTextEntry={isPassword && !showPassword}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
            <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={theme.colors.textTertiary} />
          </TouchableOpacity>
        )}
        {rightIcon && !isPassword && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.eyeBtn}>
            <Ionicons name={rightIcon} size={20} color={theme.colors.textTertiary} />
          </TouchableOpacity>
        )}
      </Animated.View>
      {(error || hint) && (
        <View style={styles.feedback}>
          {error && <Ionicons name="alert-circle" size={12} color={theme.colors.error} />}
          <Text style={[textVariants.caption, { color: error ? theme.colors.error : theme.colors.textTertiary, marginLeft: error ? spacing[1] : 0 }]}>
            {error ?? hint}
          </Text>
        </View>
      )}
    </View>
  );
}));

const styles = StyleSheet.create({
  container: { marginBottom: spacing[4] },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderRadius: borderRadius.lg, borderWidth: 1, paddingHorizontal: spacing[4], minHeight: 52 },
  leftIcon: { marginRight: spacing[2] },
  input: { paddingVertical: spacing[3] },
  eyeBtn: { padding: spacing[1] },
  feedback: { flexDirection: 'row', alignItems: 'center', marginTop: spacing[1] },
});

CustomInput.displayName = 'CustomInput';
export default CustomInput;
