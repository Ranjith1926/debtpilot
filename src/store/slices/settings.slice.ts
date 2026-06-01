import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LanguageCode } from '@localization/i18n';

interface SettingsState {
  language: LanguageCode;
  currency: string;
  monthlyIncome: number;
  biometricEnabled: boolean;
  notificationsEnabled: boolean;
  reminderDaysBefore: number[];
  autoSyncEnabled: boolean;
  analyticsEnabled: boolean;
  onboardingCompleted: boolean;
  pinEnabled: boolean;
  appLockTimeout: number; // minutes
}

const initialState: SettingsState = {
  language: 'en',
  currency: 'INR',
  monthlyIncome: 85000,
  biometricEnabled: true,
  notificationsEnabled: true,
  reminderDaysBefore: [3, 1],
  autoSyncEnabled: true,
  analyticsEnabled: true,
  onboardingCompleted: false,
  pinEnabled: false,
  appLockTimeout: 5,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<LanguageCode>) => {
      state.language = action.payload;
    },
    setMonthlyIncome: (state, action: PayloadAction<number>) => {
      state.monthlyIncome = action.payload;
    },
    toggleBiometric: (state) => { state.biometricEnabled = !state.biometricEnabled; },
    toggleNotifications: (state) => { state.notificationsEnabled = !state.notificationsEnabled; },
    setReminderDays: (state, action: PayloadAction<number[]>) => {
      state.reminderDaysBefore = action.payload;
    },
    toggleAutoSync: (state) => { state.autoSyncEnabled = !state.autoSyncEnabled; },
    toggleAnalytics: (state) => { state.analyticsEnabled = !state.analyticsEnabled; },
    setOnboardingCompleted: (state) => { state.onboardingCompleted = true; },
    togglePin: (state) => { state.pinEnabled = !state.pinEnabled; },
    setAppLockTimeout: (state, action: PayloadAction<number>) => {
      state.appLockTimeout = action.payload;
    },
    updateSettings: (state, action: PayloadAction<Partial<SettingsState>>) => {
      return { ...state, ...action.payload };
    },
    resetSettings: () => initialState,
  },
});

export const {
  setLanguage, setMonthlyIncome, toggleBiometric, toggleNotifications,
  setReminderDays, toggleAutoSync, toggleAnalytics, setOnboardingCompleted,
  togglePin, setAppLockTimeout, updateSettings, resetSettings,
} = settingsSlice.actions;
export default settingsSlice.reducer;
