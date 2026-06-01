import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { useTheme } from '@theme/ThemeProvider';
import { textVariants } from '@theme/typography';
import { spacing } from '@theme/spacing';

export default function NotFoundScreen() {
  const { theme } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[textVariants.displayMedium, { color: theme.colors.textPrimary }]}>404</Text>
      <Text style={[textVariants.bodyLarge, { color: theme.colors.textSecondary, marginTop: spacing[2] }]}>
        Screen not found
      </Text>
      <Link href="/" style={{ marginTop: spacing[6] }}>
        <Text style={[textVariants.labelLarge, { color: theme.colors.primary }]}>Go Home</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
