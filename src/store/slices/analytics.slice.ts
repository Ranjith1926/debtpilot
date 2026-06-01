import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { MonthlyData, LoanDistribution, AIInsight } from '@/types/analytics.types';
import { FinancialHealthScore, Recommendation } from '@/types/health.types';
import { MockAPI } from '@api/mock.client';

interface AnalyticsState {
  monthlyData: MonthlyData[];
  distribution: LoanDistribution[];
  insights: AIInsight[];
  healthScore: FinancialHealthScore | null;
  recommendations: Recommendation[];
  isLoading: boolean;
  isLoadingHealth: boolean;
  isLoadingInsights: boolean;
  error: string | null;
  lastComputed: string | null;
}

const initialState: AnalyticsState = {
  monthlyData: [],
  distribution: [],
  insights: [],
  healthScore: null,
  recommendations: [],
  isLoading: false,
  isLoadingHealth: false,
  isLoadingInsights: false,
  error: null,
  lastComputed: null,
};

// ─── Thunks ─────────────────────────────────────────────────────────────────

export const fetchAnalytics = createAsyncThunk('analytics/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const [monthly, dist, insights] = await Promise.all([
      MockAPI.analytics.getMonthly(),
      MockAPI.analytics.getDistribution(),
      MockAPI.insights.getAll(),
    ]);
    return { monthly: monthly.data, dist: dist.data, insights: insights.data };
  } catch (e: unknown) {
    return rejectWithValue(e instanceof Error ? e.message : 'Failed to load analytics');
  }
});

export const fetchMonthlyData = createAsyncThunk('analytics/monthly', async (_, { rejectWithValue }) => {
  try {
    return (await MockAPI.analytics.getMonthly()).data;
  } catch (e: unknown) {
    return rejectWithValue(e instanceof Error ? e.message : 'Failed to fetch monthly data');
  }
});

export const fetchDistribution = createAsyncThunk('analytics/distribution', async (_, { rejectWithValue }) => {
  try {
    return (await MockAPI.analytics.getDistribution()).data;
  } catch (e: unknown) {
    return rejectWithValue(e instanceof Error ? e.message : 'Failed to fetch distribution');
  }
});

export const fetchInsights = createAsyncThunk('analytics/insights', async (_, { rejectWithValue }) => {
  try {
    return (await MockAPI.insights.getAll()).data;
  } catch (e: unknown) {
    return rejectWithValue(e instanceof Error ? e.message : 'Failed to fetch insights');
  }
});

export const fetchHealthScore = createAsyncThunk('analytics/health', async (_, { rejectWithValue }) => {
  try {
    return (await MockAPI.analytics.getHealthScore()).data;
  } catch (e: unknown) {
    return rejectWithValue(e instanceof Error ? e.message : 'Failed to fetch health score');
  }
});

export const fetchRecommendations = createAsyncThunk('analytics/recommendations', async (_, { rejectWithValue }) => {
  try {
    return (await MockAPI.analytics.getRecommendations()).data;
  } catch (e: unknown) {
    return rejectWithValue(e instanceof Error ? e.message : 'Failed to fetch recommendations');
  }
});

export const markInsightRead = createAsyncThunk('analytics/markRead', async (insightId: string) => insightId);
export const markAllInsightsRead = createAsyncThunk('analytics/markAllRead', async () => true);

// ─── Slice ──────────────────────────────────────────────────────────────────

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalytics.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.monthlyData = action.payload.monthly;
        state.distribution = action.payload.dist;
        state.insights = action.payload.insights;
        state.lastComputed = new Date().toISOString();
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchMonthlyData.fulfilled, (state, action) => {
        state.monthlyData = action.payload as MonthlyData[];
      })
      .addCase(fetchDistribution.fulfilled, (state, action) => {
        state.distribution = action.payload as LoanDistribution[];
      })
      .addCase(fetchInsights.pending, (state) => { state.isLoadingInsights = true; })
      .addCase(fetchInsights.fulfilled, (state, action) => {
        state.isLoadingInsights = false;
        state.insights = action.payload as AIInsight[];
      })
      .addCase(fetchInsights.rejected, (state, action) => {
        state.isLoadingInsights = false;
        state.error = action.payload as string;
      })
      .addCase(fetchHealthScore.pending, (state) => { state.isLoadingHealth = true; })
      .addCase(fetchHealthScore.fulfilled, (state, action) => {
        state.isLoadingHealth = false;
        state.healthScore = action.payload as FinancialHealthScore;
      })
      .addCase(fetchHealthScore.rejected, (state, action) => {
        state.isLoadingHealth = false;
        state.error = action.payload as string;
      })
      .addCase(fetchRecommendations.fulfilled, (state, action) => {
        state.recommendations = action.payload as Recommendation[];
      })
      .addCase(markInsightRead.fulfilled, (state, action) => {
        const idx = state.insights.findIndex((i) => i.id === action.payload);
        if (idx !== -1) state.insights[idx].isRead = true;
      })
      .addCase(markAllInsightsRead.fulfilled, (state) => {
        state.insights = state.insights.map((i) => ({ ...i, isRead: true }));
      });
  },
});

export const { clearError } = analyticsSlice.actions;
export default analyticsSlice.reducer;
