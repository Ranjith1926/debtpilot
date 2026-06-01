import React, { createContext, useContext, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@store/index';
import { toggleTheme, setTheme } from '@store/slices/theme.slice';
import { createTheme, AppTheme } from './index';

interface ThemeContextValue {
  theme: AppTheme;
  isDark: boolean;
  toggleTheme: () => void;
  setDarkMode: (dark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const isDark = useSelector((state: RootState) => state.theme.isDark);
  const theme = createTheme(isDark);

  const handleToggle = useCallback(() => dispatch(toggleTheme()), [dispatch]);
  const handleSetDark = useCallback((dark: boolean) => dispatch(setTheme(dark)), [dispatch]);

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme: handleToggle, setDarkMode: handleSetDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
};
