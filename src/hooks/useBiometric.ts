import { useState, useEffect, useCallback } from 'react';
import { BiometricService } from '@services/biometric.service';

export const useBiometric = () => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    BiometricService.isAvailable().then(setIsAvailable);
  }, []);

  const authenticate = useCallback(async (reason?: string) => {
    setIsLoading(true);
    try {
      const result = await BiometricService.authenticate(reason);
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isAvailable, isLoading, authenticate };
};
