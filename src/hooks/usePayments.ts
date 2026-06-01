import { useQuery } from '@tanstack/react-query';
import { PaymentService } from '@services/payment.service';
import { QUERY_KEYS } from '@constants/app.constants';

export const usePaymentHistory = () =>
  useQuery({
    queryKey: QUERY_KEYS.PAYMENTS,
    queryFn: PaymentService.getHistory,
    staleTime: 5 * 60 * 1000,
  });

export const usePaymentsByLoan = (loanId: string) =>
  useQuery({
    queryKey: [...QUERY_KEYS.PAYMENTS, loanId],
    queryFn: () => PaymentService.getByLoan(loanId),
    enabled: !!loanId,
    staleTime: 5 * 60 * 1000,
  });

export const usePaymentSummary = () =>
  useQuery({
    queryKey: [...QUERY_KEYS.PAYMENTS, 'summary'],
    queryFn: PaymentService.getSummary,
    staleTime: 10 * 60 * 1000,
  });
