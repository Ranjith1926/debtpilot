import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Reminder } from '@/types/analytics.types';
import { MockAPI } from '@api/mock.client';

interface ReminderState {
  items: Reminder[];
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: 'emi_due' | 'overdue' | 'payment_success' | 'insight' | 'system';
  relatedLoanId?: string;
  relatedEMIId?: string;
  isRead: boolean;
  createdAt: string;
  scheduledFor?: string;
}

const initialState: ReminderState = {
  items: [],
  notifications: [],
  unreadCount: 3,
  isLoading: false,
  error: null,
};

// ─── Thunks ─────────────────────────────────────────────────────────────────

export const fetchReminders = createAsyncThunk('reminder/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await MockAPI.reminders.getAll();
    return res.data;
  } catch (e: unknown) {
    return rejectWithValue(e instanceof Error ? e.message : 'Failed to fetch reminders');
  }
});

// ─── Slice ──────────────────────────────────────────────────────────────────

const reminderSlice = createSlice({
  name: 'reminder',
  initialState,
  reducers: {
    addReminder: (state, action: PayloadAction<Reminder>) => {
      state.items.push(action.payload);
    },
    updateReminder: (state, action: PayloadAction<Reminder>) => {
      const idx = state.items.findIndex((r) => r.id === action.payload.id);
      if (idx !== -1) state.items[idx] = action.payload;
    },
    toggleReminder: (state, action: PayloadAction<string>) => {
      const idx = state.items.findIndex((r) => r.id === action.payload);
      if (idx !== -1) state.items[idx].isActive = !state.items[idx].isActive;
    },
    deleteReminder: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((r) => r.id !== action.payload);
    },
    addNotification: (state, action: PayloadAction<AppNotification>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) state.unreadCount += 1;
    },
    markNotificationRead: (state, action: PayloadAction<string>) => {
      const idx = state.notifications.findIndex((n) => n.id === action.payload);
      if (idx !== -1 && !state.notifications[idx].isRead) {
        state.notifications[idx].isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllNotificationsRead: (state) => {
      state.notifications = state.notifications.map((n) => ({ ...n, isRead: true }));
      state.unreadCount = 0;
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReminders.pending, (state) => { state.isLoading = true; })
      .addCase(fetchReminders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchReminders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  addReminder, updateReminder, toggleReminder, deleteReminder,
  addNotification, markNotificationRead, markAllNotificationsRead,
  clearNotifications, setUnreadCount,
} = reminderSlice.actions;
export default reminderSlice.reducer;
