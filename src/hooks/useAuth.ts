import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { loginAsync, logoutAsync, verifyOTPAsync, clearError } from '@store/slices/auth.slice';
import { LoginPayload, OTPPayload } from '@/types/user.types';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, error } = useAppSelector((s) => s.auth);

  const login = useCallback((payload: LoginPayload) => dispatch(loginAsync(payload)), [dispatch]);
  const verifyOTP = useCallback((payload: OTPPayload) => dispatch(verifyOTPAsync(payload)), [dispatch]);
  const logout = useCallback(() => dispatch(logoutAsync()), [dispatch]);
  const dismissError = useCallback(() => dispatch(clearError()), [dispatch]);

  return { user, isAuthenticated, isLoading, error, login, verifyOTP, logout, dismissError };
};
