import { MockAPI } from '@api/mock.client';
import { AddLoanPayload } from '@/types/loan.types';

export class LoanService {
  static async getLoans() {
    const response = await MockAPI.loans.getAll();
    return response;
  }

  static async getLoanById(id: string) {
    const response = await MockAPI.loans.getById(id);
    return response.data;
  }

  static async getLoanSummary() {
    const response = await MockAPI.loans.getSummary();
    return response.data;
  }

  static async addLoan(payload: AddLoanPayload) {
    const response = await MockAPI.loans.create(payload);
    return response.data;
  }

  static async getUpcomingEMIs() {
    const response = await MockAPI.emis.getUpcoming();
    return response;
  }

  static async getEMIHistory() {
    const response = await MockAPI.emis.getHistory();
    return response;
  }
}
