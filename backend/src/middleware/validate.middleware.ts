import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { ZodSchema, ZodError } from 'zod';
import { validationErrorResponse } from '@/utils/response';

export async function validateBody<T>(
  req: NextRequest,
  schema: ZodSchema<T>,
): Promise<{ data: T; error: null } | { data: null; error: NextResponse }> {
  try {
    const body = await req.json();
    const data = schema.parse(body);
    return { data, error: null };
  } catch (err) {
    if (err instanceof ZodError) {
      return { data: null, error: validationErrorResponse(err.flatten().fieldErrors) };
    }
    if (err instanceof SyntaxError) {
      return { data: null, error: validationErrorResponse({ _: ['Invalid JSON body'] }) };
    }
    return { data: null, error: validationErrorResponse({ _: ['Validation failed'] }) };
  }
}

export function validateQuery<T>(
  searchParams: URLSearchParams,
  schema: ZodSchema<T>,
): { data: T; error: null } | { data: null; error: NextResponse } {
  try {
    const raw: Record<string, string> = {};
    searchParams.forEach((v, k) => { raw[k] = v; });
    const data = schema.parse(raw);
    return { data, error: null };
  } catch (err) {
    if (err instanceof ZodError) {
      return { data: null, error: validationErrorResponse(err.flatten().fieldErrors) };
    }
    return { data: null, error: validationErrorResponse({ _: ['Invalid query parameters'] }) };
  }
}
