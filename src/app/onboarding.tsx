import React, { useState, useRef } from 'react';
import { View, Text, FlatList, Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { StorageService } from '@services/storage.service';
import { STORAGE_KEYS } from '@constants/app.constants';
import { useTheme } from '@theme/ThemeProvider';
import { textVariants } from '@theme/typography';
import { spacing, borderRadius } from '@theme/spacing';
import GradientButton from '@components/ui/GradientButton';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    icon: 'wallet' as const,
    title: 'Track All Your EMIs',
    subtitle: 'Get a unified view of all your loans and never miss a payment with smart reminders.',
    gradient: ['#7C3AED', '#06B6D4'] as string[],
  },
  {
    id: '2',
    icon: 'bulb' as const,
    title: 'AI-Powered Insights',
    subtitle: 'Receive intelligent recommendations to reduce debt faster and save thousands in interest.',
    gradient: ['#06B6D4', '#10B981'] as string[],
  },
  {
    id: '3',
    icon: 'trending-up' as const,
    title: 'Financial Health Score',
    subtitle: 'Track your debt health score and get actionable steps to improve your financial wellness.',
    gradient: ['#10B981', '#7C3AED'] as string[],
  },
];

export default function OnboardingScreen() {
  const { theme, isDark } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (activeIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    } else {
      handleGetStarted();
    }
  };

  const handleGetStarted = async () => {
    await StorageService.set(STORAGE_KEYS.ONBOARDING_DONE, true);
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={isDark ? ['#0A0A0F', '#0F0F1A'] : ['#F0F2FF', '#EDE9FE']}
        style={StyleSheet.absoluteFill}
      />

      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={({ item, index }) => (
          <View style={[styles.slide, { width }]}>
            <MotiView
              from={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 15, delay: 200 }}
              style={styles.iconContainer}
            >
              <LinearGradient colors={item.gradient as [string, string]} style={styles.iconGradient}>
                <Ionicons name={item.icon} size={60} color="#fff" />
              </LinearGradient>
            </MotiView>
            <MotiView from={{ opacity: 0, translateY: 30 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 300 }}>
              <Text style={[textVariants.displaySmall, styles.slideTitle, { color: theme.colors.textPrimary }]}>
                {item.title}
              </Text>
              <Text style={[textVariants.bodyLarge, styles.slideSubtitle, { color: theme.colors.textSecondary }]}>
                {item.subtitle}
              </Text>
            </MotiView>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />

      <View style={styles.footer}>
        <View style={styles.indicators}>
          {slides.map((_, i) => (
            <MotiView
              key={i}
              animate={{ width: i === activeIndex ? 24 : 8, opacity: i === activeIndex ? 1 : 0.4 }}
              transition={{ type: 'spring', damping: 20 }}
              style={[styles.indicator, { backgroundColor: theme.colors.primary }]}
            />
          ))}
        </View>
        <GradientButton
          title={activeIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          onPress={handleNext}
          style={styles.btn}
        />
        {activeIndex < slides.length - 1 && (
          <TouchableOpacity onPress={handleGetStarted} style={styles.skipBtn}>
            <Text style={[textVariants.labelMedium, { color: theme.colors.textSecondary }]}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  slide: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  iconContainer: { marginBottom: 48 },
  iconGradient: { width: 140, height: 140, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  slideTitle: { textAlign: 'center', marginBottom: spacing[4] },
  slideSubtitle: { textAlign: 'center', lineHeight: 26 },
  footer: { paddingHorizontal: spacing[6], paddingBottom: 48, gap: spacing[4] },
  indicators: { flexDirection: 'row', justifyContent: 'center', gap: spacing[2] },
  indicator: { height: 8, borderRadius: 4 },
  btn: {},
  skipBtn: { alignSelf: 'center', paddingVertical: spacing[2] },
});
