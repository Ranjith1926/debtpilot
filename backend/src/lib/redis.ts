import { Redis } from '@upstash/redis';

// Derive REST credentials from the existing REDIS_URL
// rediss://default:TOKEN@HOST:PORT -> https://HOST + TOKEN
function parseUpstashCredentials(): { url: string; token: string } {
  const raw = process.env.REDIS_URL ?? '';
  const hostMatch = raw.match(/@([^:@]+):\d+/);
  const tokenMatch = raw.match(/\/\/[^:]+:([^@]+)@/);
  if (hostMatch && tokenMatch) {
    return {
      url: `https://${hostMatch[1]}`,
      token: tokenMatch[1],
    };
  }
  return {
    url: process.env.UPSTASH_REDIS_REST_URL ?? '',
    token: process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.REDIS_PASSWORD ?? '',
  };
}

const { url, token } = parseUpstashCredentials();

const redis = new Redis({ url, token });

export { redis };

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const value = await redis.get<T>(key);
    return value ?? null;
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
  try {
    await redis.set(key, value, { ex: ttlSeconds });
  } catch {
    // Cache failure is non-fatal
  }
}

export async function cacheDel(...keys: string[]): Promise<void> {
  try {
    if (keys.length > 0) await redis.del(...keys);
  } catch {
    // Cache failure is non-fatal
  }
}

export async function cacheDelPattern(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) await redis.del(...keys);
  } catch {
    // Cache failure is non-fatal
  }
}

export default redis;
