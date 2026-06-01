import { MockAPI } from '@api/mock.client';
import { Recommendation, PreClosureCalculation } from '@/types/health.types';
import { Loan } from '@/types/loan.types';

export const RecommendationService = {
  getAll: async (): Promise<Recommendation[]> => {
    const res = await MockAPI.analytics.getRecommendations();
    return res.data;
  },

  calculatePreClosure: (loan: Loan): PreClosureCalculation => {
    const monthlyRate = loan.interestRate / 100 / 12;
    const remainingMonths = Math.ceil(loan.outstandingAmount / loan.emiAmount);
    const remainingInterest = loan.emiAmount * remainingMonths - loan.outstandingAmount;
    const chargeAmount = (loan.outstandingAmount * loan.forecloseCharges) / 100;
    const totalPayable = loan.outstandingAmount + chargeAmount;
    const netSavings = Math.max(0, remainingInterest - chargeAmount);

    return {
      loanId: loan.id,
      outstandingAmount: loan.outstandingAmount,
      forecloseCharges: loan.forecloseCharges,
      forecloseChargeAmount: chargeAmount,
      totalPayable,
      interestSaved: remainingInterest,
      netSavings,
      remainingEMIs: remainingMonths,
      remainingInterest,
    };

    void monthlyRate; // used indirectly
  },

  buildSnowballOrder: (loans: Loan[]): Loan[] =>
    [...loans].sort((a, b) => a.outstandingAmount - b.outstandingAmount),

  buildAvalancheOrder: (loans: Loan[]): Loan[] =>
    [...loans].sort((a, b) => b.interestRate - a.interestRate),

  estimateAvalancheSavings: (loans: Loan[], monthlyExtra: number): number => {
    const sorted = RecommendationService.buildAvalancheOrder(loans);
    let totalSavings = 0;
    for (const loan of sorted) {
      const monthlyRate = loan.interestRate / 100 / 12;
      const standardInterest = loan.emiAmount * loan.tenureMonths - loan.principalAmount;
      const newPayment = loan.emiAmount + monthlyExtra;
      const newTenure = -Math.log(1 - (loan.outstandingAmount * monthlyRate) / newPayment) / Math.log(1 + monthlyRate);
      const newInterest = newPayment * newTenure - loan.outstandingAmount;
      totalSavings += Math.max(0, standardInterest - newInterest);
    }
    return Math.round(totalSavings);
  },
};
