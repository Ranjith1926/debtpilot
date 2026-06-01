import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { EMI, EMIStatus } from '@/types/loan.types';
import { MockAPI } from '@api/mock.client';

interface EMIState {
  items: EMI[];
  upcoming: EMI[];
  history: EMI[];
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;
  lastSynced: string | null;
  pendingActions: PendingAction[];
}

interface PendingAction {
  id: string;
  type: 'mark_paid' | 'add' | 'delete';
  payload: unknown;
  createdAt: string;
}

const initialState: EMIState = {
  items: [],
  upcoming: [],
  history: [],
  isLoading: false,
  isMutating: false,
  error: null,
  lastSynced: null,
  pendingActions: [],
};

// ─── Async Thunks ──────────────────────────────────────────────────────────

export const fetchUpcomingEMIs = createAsyncThunk(
  'emi/fetchUpcoming',
  async (_, { rejectWithValue }) => {
    try {
      const res = await MockAPI.emis.getUpcoming();
      return res.data;
    } catch (e: unknown) {
      return rejectWithValue(e instanceof Error ? e.message : 'Failed to fetch EMIs');
    }
  },
);

export const fetchEMIHistory = createAsyncThunk(
  'emi/fetchHistory',
  async (_, { rejectWithValue }) => {
    try {
      const res = await MockAPI.emis.getHistory();
      return res.data;
    } catch (e: unknown) {
      return rejectWithValue(e instanceof Error ? e.message : 'Failed to fetch history');
    }
  },
);

export const markEMIAsPaid = createAsyncThunk(
  'emi/markPaid',
  async ({ emiId, paidAmount, paymentMethod }: { emiId: string; paidAmount: number; paymentMethod?: string }, { rejectWithValue }) => {
    try {
      // Optimistic — in real app would call API
      return { emiId, paidAmount, paidDate: new Date().toISOString().split('T')[0] };
    } catch (e: unknown) {
      return rejectWithValue(e instanceof Error ? e.message : 'Failed to mark as paid');
    }
  },
);

// ─── Slice ──────────────────────────────────────────────────────────────────

const emiSlice = createSlice({
  name: 'emi',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    setEMIs: (state, action: PayloadAction<EMI[]>) => { state.items = action.payload; },
    addPendingAction: (state, action: PayloadAction<PendingAction>) => {
      state.pendingActions.push(action.payload);
    },
    clearPendingActions: (state) => { state.pendingActions = []; },
    updateEMIStatus: (state, action: PayloadAction<{ emiId: string; status: EMIStatus; paidAmount?: number }>) => {
      const idx = state.upcoming.findIndex((e) => e.id === action.payload.emiId);
      if (idx !== -1) {
        state.upcoming[idx].status = action.payload.status;
        if (action.payload.paidAmount) state.upcoming[idx].paidAmount = action.payload.paidAmount;
      }
    },
    addEMI: (state, action: PayloadAction<EMI>) => {
      state.upcoming.push(action.payload);
      state.upcoming.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    },
    removeEMI: (state, action: PayloadAction<string>) => {
      state.upcoming = state.upcoming.filter((e) => e.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUpcomingEMIs.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchUpcomingEMIs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.upcoming = action.payload;
        state.lastSynced = new Date().toISOString();
      })
      .addCase(fetchUpcomingEMIs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchEMIHistory.fulfilled, (state, action) => {
        state.history = action.payload.filter((e) => e.status === 'paid');
      })
      .addCase(markEMIAsPaid.pending, (state) => { state.isMutating = true; })
      .addCase(markEMIAsPaid.fulfilled, (state, action) => {
        state.isMutating = false;
        const { emiId, paidAmount, paidDate } = action.payload;
        const idx = state.upcoming.findIndex((e) => e.id === emiId);
        if (idx !== -1) {
          state.upcoming[idx].status = 'paid';
          state.upcoming[idx].paidAmount = paidAmount;
          state.upcoming[idx].paidDate = paidDate;
        }
      })
      .addCase(markEMIAsPaid.rejected, (state, action) => {
        state.isMutating = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setEMIs, addPendingAction, clearPendingActions, updateEMIStatus, addEMI, removeEMI } = emiSlice.actions;
export default emiSlice.reducer;
