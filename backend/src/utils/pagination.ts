import { PAGINATION } from '@/config/constants';
import type { PaginationMeta, PaginationQuery } from '@/types';

export function parsePaginationQuery(searchParams: URLSearchParams): Required<PaginationQuery> {
  const page = Math.max(1, parseInt(searchParams.get('page') || `${PAGINATION.DEFAULT_PAGE}`, 10));
  const limit = Math.min(
    PAGINATION.MAX_LIMIT,
    Math.max(1, parseInt(searchParams.get('limit') || `${PAGINATION.DEFAULT_LIMIT}`, 10)),
  );
  return { page, limit };
}

export function buildPaginationMeta(total: number, page: number, limit: number): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

export function getPrismaSkipTake(page: number, limit: number): { skip: number; take: number } {
  return { skip: (page - 1) * limit, take: limit };
}
