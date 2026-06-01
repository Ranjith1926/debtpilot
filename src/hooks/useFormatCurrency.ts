import { useCallback } from 'react';
import { CURRENCY } from '@constants/app.constants';

export const useFormatCurrency = () => {
  const format = useCallback((amount: number, compact = false): string => {
    if (compact) {
      if (amount >= 10000000) return `${CURRENCY.SYMBOL}${(amount / 10000000).toFixed(1)}Cr`;
      if (amount >= 100000) return `${CURRENCY.SYMBOL}${(amount / 100000).toFixed(1)}L`;
      if (amount >= 1000) return `${CURRENCY.SYMBOL}${(amount / 1000).toFixed(1)}K`;
    }
    return new Intl.NumberFormat(CURRENCY.LOCALE, {
      style: 'currency',
      currency: CURRENCY.CODE,
      maximumFractionDigits: 0,
    }).format(amount);
  }, []);

  const formatCompact = useCallback((amount: number) => format(amount, true), [format]);

  return { format, formatCompact };
};
