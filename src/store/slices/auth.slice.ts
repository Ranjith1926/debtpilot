import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, LoginPayload, RegisterPayload, OTPPayload } from '@/types/user.types';
import { AuthService } from '@services/auth.service';

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const loginAsync = createAsyncThunk('auth/login', async (payload: LoginPayload, { rejectWithValue }) => {
  try {
    return await AuthService.login(payload);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Login failed';
    return rejectWithValue(msg);
  }
});

export const registerAsync = createAsyncThunk('auth/register', async (payload: RegisterPayload, { rejectWithValue }) => {
  try {
    return await AuthService.register(payload);
  } catch (error: unknown) {
    return rejectWithValue(error instanceof Error ? error.message : 'Registration failed');
  }
});

export const verifyOTPAsync = createAsyncThunk('auth/verifyOTP', async (payload: OTPPayload, { rejectWithValue }) => {
  try {
    return await AuthService.verifyOTP(payload);
  } catch (error: unknown) {
    return rejectWithValue(error instanceof Error ? error.message : 'OTP verification failed');
  }
});

export const logoutAsync = createAsyncThunk('auth/logout', async () => {
  await AuthService.logout();
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    setUser: (state, action: PayloadAction<AuthState['user']>) => { state.user = action.payload; },
    setAuthenticated: (state, action: PayloadAction<boolean>) => { state.isAuthenticated = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAsync.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.tokens.accessToken;
        state.refreshToken = action.payload.tokens.refreshToken;
        state.isAuthenticated = true;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(registerAsync.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(registerAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.tokens.accessToken;
        state.refreshToken = action.payload.tokens.refreshToken;
        state.isAuthenticated = true;
      })
      .addCase(registerAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(logoutAsync.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export const { clearError, setUser, setAuthenticated } = authSlice.actions;
export default authSlice.reducer;
