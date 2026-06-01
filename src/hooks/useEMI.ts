import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { fetchUpcomingEMIs, fetchEMIHistory, markEMIAsPaid, updateEMIStatus, addEMI, removeEMI, clearError } from '@store/slices/emi.slice';
import { updateLoanAfterPayment } from '@store/slices/loan.slice';
import { EMI } from '@/types/loan.types';

export const useEMI = () => {
  const dispatch = useAppDispatch();
  const { upcoming, history, isLoading, isMutating, error } = useAppSelector((s) => s.emi);

  const loadUpcoming = useCallback(() => dispatch(fetchUpcomingEMIs()), [dispatch]);
  const loadHistory = useCallback(() => dispatch(fetchEMIHistory()), [dispatch]);

  const markPaid = useCallback(
    async (emiId: string, paidAmount: number, paymentMethod: string, loanId: string) => {
      const result = await dispatch(markEMIAsPaid({ emiId, paidAmount, paymentMethod }));
      if (markEMIAsPaid.fulfilled.match(result)) {
        dispatch(updateLoanAfterPayment({ loanId, paidAmount }));
        // Optimistically move EMI to history in Redux state
        dispatch(updateEMIStatus({ emiId, status: 'paid', paidAmount }));
      }
      return result;
    },
    [dispatch]
  );

  const createEMI = useCallback((payload: EMI) => dispatch(addEMI(payload)), [dispatch]);
  const deleteEMI = useCallback((emiId: string) => dispatch(removeEMI(emiId)), [dispatch]);
  const dismissError = useCallback(() => dispatch(clearError()), [dispatch]);

  const overdueEMIs = upcoming.filter((e) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(e.dueDate) < today && e.status !== 'paid';
  });

  const dueSoonEMIs = upcoming.filter((e) => {
    const today = new Date();
    const cutoff = new Date(today.getTime() + 7 * 86400000);
    const due = new Date(e.dueDate);
    return due >= today && due <= cutoff && e.status !== 'paid';
  });

  const nextDueEMI = [...upcoming]
    .filter((e) => e.status !== 'paid')
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0] ?? null;

  const totalUpcomingAmount = upcoming.reduce((s, e) => s + e.amount, 0);
  const totalPaidThisMonth = history
    .filter((e) => e.status === 'paid' && new Date(e.dueDate).getMonth() === new Date().getMonth())
    .reduce((s, e) => s + (e.paidAmount ?? e.amount), 0);

  return {
    upcoming,
    history,
    overdueEMIs,
    dueSoonEMIs,
    nextDueEMI,
    totalUpcomingAmount,
    totalPaidThisMonth,
    isLoading,
    isMarkingPaid: isMutating,
    error,
    loadUpcoming,
    loadHistory,
    markPaid,
    createEMI,
    deleteEMI,
    dismissError,
  };
};
