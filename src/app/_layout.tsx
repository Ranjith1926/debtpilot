import React, { useEffect, useRef } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { store } from '@store/index';
import { ThemeProvider, useTheme } from '@theme/ThemeProvider';
import { useAppSelector } from '@store/hooks';
import { FCMService } from '@services/fcm.service';
import '../localization/i18n';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2, staleTime: 5 * 60 * 1000 },
    mutations: { retry: 0 },
  },
});

function RootLayoutInner() {
  const { isDark } = useTheme();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const fcmRegistered = useRef(false);

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    if (isAuthenticated && !fcmRegistered.current) {
      fcmRegistered.current = true;
      FCMService.registerDeviceToken();
    }
    if (!isAuthenticated) {
      fcmRegistered.current = false;
    }
  }, [isAuthenticated]);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ animation: 'fade' }} />
        <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
        <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="loan/[id]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="loan/add" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="ai-insights" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="reminders" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="notifications" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="settings" options={{ animation: 'slide_from_right' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <RootLayoutInner />
          </ThemeProvider>
        </QueryClientProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
