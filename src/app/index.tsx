import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { useAppSelector } from '@store/hooks';
import { StorageService } from '@services/storage.service';
import { STORAGE_KEYS } from '@constants/app.constants';
import { textVariants } from '@theme/typography';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  useEffect(() => {
    const timer = setTimeout(async () => {
      const onboardingDone = await StorageService.get<boolean>(STORAGE_KEYS.ONBOARDING_DONE);
      if (!onboardingDone) {
        router.replace('/onboarding');
      } else if (isAuthenticated) {
        router.replace('/(tabs)/dashboard');
      } else {
        router.replace('/(auth)/login');
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0A0A0F', '#0F0F1A', '#141420']} style={StyleSheet.absoluteFill} />
      {/* Background orbs */}
      <MotiView
        from={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 0.3, scale: 1 }}
        transition={{ type: 'timing', duration: 1500 }}
        style={styles.orb1}
      />
      <MotiView
        from={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 0.2, scale: 1 }}
        transition={{ type: 'timing', duration: 1800, delay: 200 }}
        style={styles.orb2}
      />

      <View style={styles.content}>
        <MotiView
          from={{ scale: 0, rotate: '180deg' }}
          animate={{ scale: 1, rotate: '0deg' }}
          transition={{ type: 'spring', damping: 15, stiffness: 100 }}
          style={styles.logoContainer}
        >
          <LinearGradient
            colors={['#7C3AED', '#06B6D4']}
            style={styles.logoGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.logoText}>DP</Text>
          </LinearGradient>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 400, type: 'spring' }}
        >
          <Text style={[textVariants.displaySmall, styles.title]}>DebtPilot</Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 600, type: 'spring' }}
        >
          <Text style={[textVariants.bodyMedium, styles.subtitle]}>
            Your intelligent debt management companion
          </Text>
        </MotiView>
      </View>

      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 1000 }}
        style={styles.footer}
      >
        <View style={styles.dots}>
          {[0, 1, 2].map((i) => (
            <MotiView
              key={i}
              from={{ scale: 0.6, opacity: 0.4 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ loop: true, type: 'timing', duration: 600, delay: i * 200 }}
              style={[styles.dot, i === 1 && styles.dotActive]}
            />
          ))}
        </View>
        <Text style={[textVariants.caption, styles.poweredBy]}>Powered by AI • Secured by Default</Text>
      </MotiView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  logoContainer: { marginBottom: 24 },
  logoGradient: { width: 88, height: 88, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: 36, fontWeight: '900', color: '#fff', letterSpacing: -1 },
  title: { color: '#fff', textAlign: 'center', letterSpacing: -0.5 },
  subtitle: { color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: 8 },
  orb1: { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: '#7C3AED', top: -50, right: -80 },
  orb2: { position: 'absolute', width: 250, height: 250, borderRadius: 125, backgroundColor: '#06B6D4', bottom: 100, left: -60 },
  footer: { paddingBottom: 48, alignItems: 'center', gap: 12 },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.25)' },
  dotActive: { width: 20, backgroundColor: '#7C3AED' },
  poweredBy: { color: 'rgba(255,255,255,0.3)' },
});
