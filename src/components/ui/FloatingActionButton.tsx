import React, { memo } from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme } from '@theme/ThemeProvider';
import { useHaptics } from '@hooks/useHaptics';
import { shadow } from '@theme/spacing';

interface FABProps {
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  gradient?: string[];
  style?: ViewStyle;
  size?: number;
}

const FAB = memo<FABProps>(({ icon = 'add', onPress, gradient, style, size = 56 }) => {
  const { theme } = useTheme();
  const haptics = useHaptics();
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePressIn = () => { scale.value = withSpring(0.9, { damping: 15 }); };
  const handlePressOut = () => { scale.value = withSpring(1, { damping: 15 }); };
  const handlePress = () => { haptics.medium(); onPress(); };

  return (
    <Animated.View style={[{ width: size, height: size, borderRadius: size / 2 }, shadow.purple, animStyle, style]}>
      <TouchableOpacity
        style={[styles.fab, { width: size, height: size, borderRadius: size / 2 }]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <LinearGradient
          colors={(gradient ?? theme.gradients.primary) as [string, string]}
          style={[styles.gradient, { borderRadius: size / 2 }]}
        >
          <Ionicons name={icon} size={size * 0.42} color={theme.colors.textPrimary} />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  fab: { overflow: 'hidden' },
  gradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

FAB.displayName = 'FloatingActionButton';
export default FAB;
