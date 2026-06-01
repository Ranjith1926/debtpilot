import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/auth.slice';
import themeReducer from './slices/theme.slice';
import uiReducer from './slices/ui.slice';
import emiReducer from './slices/emi.slice';
import loanReducer from './slices/loan.slice';
import analyticsReducer from './slices/analytics.slice';
import reminderReducer from './slices/reminder.slice';
import settingsReducer from './slices/settings.slice';

const rootReducer = combineReducers({
  auth: authReducer,
  theme: themeReducer,
  ui: uiReducer,
  emi: emiReducer,
  loan: loanReducer,
  analytics: analyticsReducer,
  reminder: reminderReducer,
  settings: settingsReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredPaths: ['analytics.debtVelocity.estimatedDebtFreeDate'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
