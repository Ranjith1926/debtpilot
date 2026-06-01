import React, { memo } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { MotiView } from 'moti';
import { useTheme } from '@theme/ThemeProvider';
import { textVariants } from '@theme/typography';
import { spacing } from '@theme/spacing';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

const LoadingOverlay = memo<LoadingOverlayProps>(({ visible, message }) => {
  const { theme } = useTheme();
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
      <MotiView
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={[styles.card, { backgroundColor: theme.colors.backgroundSecondary }]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
        {message && (
          <Text style={[textVariants.bodyMedium, { color: theme.colors.textSecondary, marginTop: spacing[3] }]}>
            {message}
          </Text>
        )}
      </MotiView>
    </View>
  );
});

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', zIndex: 999 },
  card: { padding: spacing[8], borderRadius: 20, alignItems: 'center', gap: spacing[2] },
});

LoadingOverlay.displayName = 'LoadingOverlay';
export default LoadingOverlay;
