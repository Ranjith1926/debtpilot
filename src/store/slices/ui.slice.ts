import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  isLoading: boolean;
  loadingMessage: string;
  toastMessage: string | null;
  toastType: 'success' | 'error' | 'warning' | 'info';
  notificationCount: number;
}

const initialState: UIState = {
  isLoading: false,
  loadingMessage: '',
  toastMessage: null,
  toastType: 'info',
  notificationCount: 3,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    showLoading: (state, action: PayloadAction<string | undefined>) => {
      state.isLoading = true;
      state.loadingMessage = action.payload ?? 'Loading...';
    },
    hideLoading: (state) => { state.isLoading = false; state.loadingMessage = ''; },
    showToast: (state, action: PayloadAction<{ message: string; type?: UIState['toastType'] }>) => {
      state.toastMessage = action.payload.message;
      state.toastType = action.payload.type ?? 'info';
    },
    clearToast: (state) => { state.toastMessage = null; },
    setNotificationCount: (state, action: PayloadAction<number>) => {
      state.notificationCount = action.payload;
    },
    decrementNotificationCount: (state) => {
      if (state.notificationCount > 0) state.notificationCount -= 1;
    },
  },
});

export const { showLoading, hideLoading, showToast, clearToast, setNotificationCount, decrementNotificationCount } = uiSlice.actions;
export default uiSlice.reducer;
