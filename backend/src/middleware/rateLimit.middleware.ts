import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { redis } from '@/lib/redis';
import { env } from '@/config/env';
import { CACHE_KEYS } from '@/config/constants';

export interface RateLimitOptions {
  max?: number;
  windowMs?: number;
  keyPrefix?: string;
}

export async function rateLimit(
  req: NextRequest,
  options: RateLimitOptions = {},
): Promise<NextResponse | null> {
  const max = options.max ?? env.RATE_LIMIT_MAX;
  const windowMs = options.windowMs ?? env.RATE_LIMIT_WINDOW_MS;
  const windowSeconds = Math.ceil(windowMs / 1000);

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1';

  const key = options.keyPrefix
    ? `rate_limit:${options.keyPrefix}:${ip}`
    : CACHE_KEYS.RATE_LIMIT(ip);

  try {
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, windowSeconds);

    const ttl = await redis.ttl(key);

    if (count > max) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(max),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Date.now() + ttl * 1000),
            'Retry-After': String(ttl),
          },
        },
      );
    }

    return null;
  } catch {
    return null;
  }
}
