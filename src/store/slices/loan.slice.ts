import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Loan, LoanSummary, AddLoanPayload } from '@/types/loan.types';
import { MockAPI } from '@api/mock.client';
import { calculateEMI } from '@utils/financial.calculators';

interface LoanState {
  items: Loan[];
  summary: LoanSummary | null;
  selectedLoanId: string | null;
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;
  lastSynced: string | null;
  filters: { type: string; status: string; search: string };
}

const initialState: LoanState = {
  items: [],
  summary: null,
  selectedLoanId: null,
  isLoading: false,
  isMutating: false,
  error: null,
  lastSynced: null,
  filters: { type: 'all', status: 'all', search: '' },
};

// ─── Async Thunks ──────────────────────────────────────────────────────────

export const fetchLoans = createAsyncThunk('loan/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await MockAPI.loans.getAll();
    return res.data;
  } catch (e: unknown) {
    return rejectWithValue(e instanceof Error ? e.message : 'Failed to fetch loans');
  }
});

export const fetchLoanSummary = createAsyncThunk('loan/fetchSummary', async (_, { rejectWithValue }) => {
  try {
    return await MockAPI.loans.getSummary().then((r) => r.data);
  } catch (e: unknown) {
    return rejectWithValue(e instanceof Error ? e.message : 'Failed to fetch summary');
  }
});

export const addLoan = createAsyncThunk(
  'loan/add',
  async (payload: AddLoanPayload, { rejectWithValue }) => {
    try {
      const emiAmount = calculateEMI(payload.principalAmount, payload.interestRate, payload.tenureMonths);
      const startDate = new Date(payload.startDate);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + payload.tenureMonths);

      const newLoan: Loan = {
        id: `loan_${Date.now()}`,
        userId: 'usr_001',
        lenderName: payload.lenderName,
        type: payload.type,
        status: 'active',
        principalAmount: payload.principalAmount,
        outstandingAmount: payload.principalAmount,
        interestRate: payload.interestRate,
        tenureMonths: payload.tenureMonths,
        startDate: payload.startDate,
        endDate: endDate.toISOString().split('T')[0],
        emiAmount,
        emiDueDate: payload.emiDueDate,
        totalPaid: 0,
        totalInterestPaid: 0,
        nextEMIDate: startDate.toISOString().split('T')[0],
        accountNumber: payload.accountNumber ?? `ACCT****${Math.floor(1000 + Math.random() * 9000)}`,
        prepaymentAllowed: payload.prepaymentAllowed ?? true,
        forecloseCharges: 2,
      };
      return newLoan;
    } catch (e: unknown) {
      return rejectWithValue(e instanceof Error ? e.message : 'Failed to add loan');
    }
  },
);

export const updateLoanAfterPayment = createAsyncThunk(
  'loan/updateAfterPayment',
  async ({ loanId, paidAmount }: { loanId: string; paidAmount: number }, { getState, rejectWithValue }) => {
    try {
      return { loanId, paidAmount };
    } catch (e: unknown) {
      return rejectWithValue(e instanceof Error ? e.message : 'Failed to update loan');
    }
  },
);

export const deleteLoan = createAsyncThunk(
  'loan/delete',
  async (loanId: string, { rejectWithValue }) => {
    try {
      return loanId;
    } catch (e: unknown) {
      return rejectWithValue(e instanceof Error ? e.message : 'Failed to delete loan');
    }
  },
);

// ─── Slice ──────────────────────────────────────────────────────────────────

const loanSlice = createSlice({
  name: 'loan',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    selectLoan: (state, action: PayloadAction<string | null>) => {
      state.selectedLoanId = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<LoanState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = { type: 'all', status: 'all', search: '' };
    },
    updateLoanLocally: (state, action: PayloadAction<Partial<Loan> & { id: string }>) => {
      const idx = state.items.findIndex((l) => l.id === action.payload.id);
      if (idx !== -1) state.items[idx] = { ...state.items[idx], ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLoans.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchLoans.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
        state.lastSynced = new Date().toISOString();
      })
      .addCase(fetchLoans.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchLoanSummary.fulfilled, (state, action) => {
        state.summary = action.payload;
      })
      .addCase(addLoan.pending, (state) => { state.isMutating = true; })
      .addCase(addLoan.fulfilled, (state, action) => {
        state.isMutating = false;
        state.items.push(action.payload);
        // Recompute summary totals locally
        if (state.summary) {
          state.summary.totalLoans += 1;
          state.summary.activeLoans += 1;
          state.summary.totalOutstanding += action.payload.principalAmount;
          state.summary.totalEMIPerMonth += action.payload.emiAmount;
        }
      })
      .addCase(addLoan.rejected, (state, action) => {
        state.isMutating = false;
        state.error = action.payload as string;
      })
      .addCase(deleteLoan.fulfilled, (state, action) => {
        const loan = state.items.find((l) => l.id === action.payload);
        if (loan && state.summary) {
          state.summary.totalLoans -= 1;
          state.summary.activeLoans -= 1;
          state.summary.totalOutstanding -= loan.outstandingAmount;
          state.summary.totalEMIPerMonth -= loan.emiAmount;
        }
        state.items = state.items.filter((l) => l.id !== action.payload);
      })
      .addCase(updateLoanAfterPayment.fulfilled, (state, action) => {
        const { loanId, paidAmount } = action.payload;
        const idx = state.items.findIndex((l) => l.id === loanId);
        if (idx !== -1) {
          const loan = state.items[idx];
          const r = loan.interestRate / (12 * 100);
          const interestPortion = Math.round(loan.outstandingAmount * r);
          const principalPortion = paidAmount - interestPortion;
          state.items[idx].outstandingAmount = Math.max(0, loan.outstandingAmount - principalPortion);
          state.items[idx].totalPaid += paidAmount;
          state.items[idx].totalInterestPaid += interestPortion;
          state.items[idx].lastPaymentDate = new Date().toISOString().split('T')[0];
          state.items[idx].lastPaymentAmount = paidAmount;
          if (state.summary) state.summary.totalOutstanding -= principalPortion;
        }
      });
  },
});

export const { clearError, selectLoan, setFilters, resetFilters, updateLoanLocally } = loanSlice.actions;
export default loanSlice.reducer;
