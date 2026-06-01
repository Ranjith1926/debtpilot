import type { NextRequest } from 'next/server';
import type { AuthenticatedUser } from './auth.types';

export interface AuthenticatedRequest extends NextRequest {
  user?: AuthenticatedUser;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface DashboardData {
  totalLoans: number;
  activeLoans: number;
  totalOutstanding: number;
  monthlyEmi: number;
  healthScore: number;
  healthLabel: string;
  upcomingEmis: unknown[];
  recentPayments: unknown[];
  debtToIncomeRatio?: number;
}
