import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LoanService } from '@services/loan.service';
import { QUERY_KEYS } from '@constants/app.constants';
import { AddLoanPayload } from '@/types/loan.types';

export const useLoans = () => {
  return useQuery({
    queryKey: QUERY_KEYS.LOANS,
    queryFn: LoanService.getLoans,
    staleTime: 5 * 60 * 1000,
  });
};

export const useLoanDetail = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.LOAN_DETAIL(id),
    queryFn: () => LoanService.getLoanById(id),
    enabled: !!id,
  });
};

export const useLoanSummary = () => {
  return useQuery({
    queryKey: [...QUERY_KEYS.LOANS, 'summary'],
    queryFn: LoanService.getLoanSummary,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpcomingEMIs = () => {
  return useQuery({
    queryKey: QUERY_KEYS.EMIS,
    queryFn: LoanService.getUpcomingEMIs,
    staleTime: 2 * 60 * 1000,
  });
};

export const useAddLoan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddLoanPayload) => LoanService.addLoan(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LOANS });
    },
  });
};
