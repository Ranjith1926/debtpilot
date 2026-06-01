import { NextResponse } from 'next/server';
import type { ApiResponse, PaginationMeta } from '@/types';

export function successResponse<T>(
  data: T,
  message?: string,
  status = 200,
  meta?: PaginationMeta,
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data, message, meta }, { status });
}

export function errorResponse(
  error: string,
  status = 400,
  message?: string,
): NextResponse<ApiResponse> {
  return NextResponse.json({ success: false, error, message }, { status });
}

export function createdResponse<T>(data: T, message = 'Created successfully'): NextResponse<ApiResponse<T>> {
  return successResponse(data, message, 201);
}

export function unauthorizedResponse(message = 'Unauthorized'): NextResponse<ApiResponse> {
  return errorResponse(message, 401);
}

export function forbiddenResponse(message = 'Forbidden'): NextResponse<ApiResponse> {
  return errorResponse(message, 403);
}

export function notFoundResponse(message = 'Resource not found'): NextResponse<ApiResponse> {
  return errorResponse(message, 404);
}

export function validationErrorResponse(errors: unknown): NextResponse<ApiResponse> {
  return NextResponse.json({ success: false, error: 'Validation failed', data: errors }, { status: 422 });
}

export function serverErrorResponse(message = 'Internal server error'): NextResponse<ApiResponse> {
  return errorResponse(message, 500);
}
