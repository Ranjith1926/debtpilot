import { CURRENCY } from '@constants/app.constants';

export const formatCurrency = (amount: number, compact = false): string => {
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
};

export const formatDate = (dateStr: string, options?: Intl.DateTimeFormatOptions): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', options ?? { day: 'numeric', month: 'short', year: 'numeric' });
};

export const formatDateShort = (dateStr: string): string =>
  formatDate(dateStr, { day: 'numeric', month: 'short' });

export const daysUntil = (dateStr: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

export const formatPercentage = (value: number, decimals = 1): string =>
  `${value.toFixed(decimals)}%`;

export const formatOrdinal = (n: number): string => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

export const maskAccountNumber = (accountNumber: string): string => {
  const parts = accountNumber.split('****');
  if (parts.length === 2) return `****${parts[1]}`;
  return `****${accountNumber.slice(-4)}`;
};
