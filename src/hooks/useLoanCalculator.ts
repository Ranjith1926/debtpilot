import { useState, useMemo, useCallback } from 'react';
import {
  calculateEMI, getEMIBreakdown, generateAmortization,
  calculatePrepaymentImpact, maxLoanAmount, EMIBreakdown, AmortizationRow,
} from '@utils/financial.calculators';

interface CalculatorState {
  principal: number;
  annualRate: number;
  tenureMonths: number;
}

interface LoanCalculatorResult {
  state: CalculatorState;
  breakdown: EMIBreakdown;
  amortization: AmortizationRow[];
  setPrincipal: (v: number) => void;
  setAnnualRate: (v: number) => void;
  setTenureMonths: (v: number) => void;
  reset: () => void;
  computePrepayment: (prepayAmount: number) => ReturnType<typeof calculatePrepaymentImpact>;
  computeMaxLoan: (income: number, existingEMIs: number, tenure?: number) => number;
}

const DEFAULT: CalculatorState = { principal: 1000000, annualRate: 9.5, tenureMonths: 60 };

export const useLoanCalculator = (initial?: Partial<CalculatorState>): LoanCalculatorResult => {
  const [state, setState] = useState<CalculatorState>({ ...DEFAULT, ...initial });

  const breakdown = useMemo(
    () => getEMIBreakdown(state.principal, state.annualRate, state.tenureMonths),
    [state],
  );

  const amortization = useMemo(
    () => generateAmortization(state.principal, state.annualRate, state.tenureMonths, new Date()),
    [state],
  );

  const setPrincipal = useCallback((v: number) => setState((s) => ({ ...s, principal: v })), []);
  const setAnnualRate = useCallback((v: number) => setState((s) => ({ ...s, annualRate: v })), []);
  const setTenureMonths = useCallback((v: number) => setState((s) => ({ ...s, tenureMonths: v })), []);
  const reset = useCallback(() => setState({ ...DEFAULT, ...initial }), [initial]);

  const computePrepayment = useCallback(
    (prepayAmount: number) =>
      calculatePrepaymentImpact(state.principal, state.annualRate, state.tenureMonths, prepayAmount),
    [state],
  );

  const computeMaxLoan = useCallback(
    (income: number, existingEMIs: number, tenure = state.tenureMonths) =>
      maxLoanAmount(income, existingEMIs, state.annualRate, tenure),
    [state],
  );

  return { state, breakdown, amortization, setPrincipal, setAnnualRate, setTenureMonths, reset, computePrepayment, computeMaxLoan };
};
