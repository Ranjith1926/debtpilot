import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@theme/ThemeProvider';
import { textVariants } from '@theme/typography';
import { borderRadius } from '@theme/spacing';

type IconName = keyof typeof Ionicons.glyphMap;

interface TabIconProps {
  name: IconName;
  outlineName: IconName;
  focused: boolean;
  label: string;
}

const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 82 : 62;

const TabIcon = ({ name, outlineName, focused, label }: TabIconProps) => {
  const { theme } = useTheme();
  return (
    <View style={styles.tabIcon}>
      {focused ? (
        <LinearGradient colors={['#7C3AED', '#06B6D4']} style={styles.activeIconBg}>
          <Ionicons name={name} size={18} color="#fff" />
        </LinearGradient>
      ) : (
        <View style={styles.inactiveIconBg}>
          <Ionicons name={outlineName} size={20} color={theme.colors.tabInactive} />
        </View>
      )}
      <Text
        numberOfLines={1}
        style={[textVariants.labelSmall, {
          color: focused ? theme.colors.primary : theme.colors.tabInactive,
          fontSize: 10,
          marginTop: 3,
        }]}
      >
        {label}
      </Text>
    </View>
  );
};

export default function TabsLayout() {
  const { theme, isDark } = useTheme();

  const tabBarBg = isDark ? 'rgba(10,10,15,0.97)' : 'rgba(255,255,255,0.97)';
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: TAB_BAR_HEIGHT,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: borderColor,
          elevation: 0,
          backgroundColor: 'transparent',
        },
        tabBarBackground: () => (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: tabBarBg }]}>
            {Platform.OS === 'ios' && (
              <BlurView
                intensity={80}
                tint={isDark ? 'dark' : 'light'}
                style={StyleSheet.absoluteFill}
              />
            )}
            <View style={[StyleSheet.absoluteFill, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: borderColor }]} />
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="home" outlineName="home-outline" focused={focused} label="Home" />
          ),
        }}
      />
      <Tabs.Screen
        name="loans"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="card" outlineName="card-outline" focused={focused} label="Loans" />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="bar-chart" outlineName="bar-chart-outline" focused={focused} label="Analytics" />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="person" outlineName="person-outline" focused={focused} label="Profile" />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIcon: { alignItems: 'center', justifyContent: 'center', paddingTop: 6, width: 64 },
  activeIconBg: { width: 42, height: 28, borderRadius: borderRadius.lg, alignItems: 'center', justifyContent: 'center' },
  inactiveIconBg: { width: 42, height: 28, alignItems: 'center', justifyContent: 'center' },
});
