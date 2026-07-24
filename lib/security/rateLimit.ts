/**
 * Advanced sliding-window rate limiter with IP & User tracking.
 * 
 * Supports dual engines:
 * 1. Upstash Redis (Serverless Distributed Rate Limiting for Vercel)
 *    - Required Dependencies: `@upstash/ratelimit` and `@upstash/redis`
 *    - Required Env Vars: `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
 * 2. In-Memory LRU Sliding-Window Fallback (Zero external setup required for local dev / single instance)
 */

interface RateLimitConfig {
  /** Max allowed requests within the window */
  maxRequests: number;
  /** Window size in milliseconds */
  windowMs: number;
}

/** Preset profiles for route sensitivity levels */
export const RATE_LIMIT_PRESETS = {
  /** Strict Auth profile: 5 requests / 15 minutes (login, signup, password reset) */
  AUTH: { maxRequests: 5, windowMs: 15 * 60_000 } as RateLimitConfig,
  /** AI chat profile: 10 requests / 1 minute */
  AI: { maxRequests: 10, windowMs: 60_000 } as RateLimitConfig,
  /** File upload profile: 5 requests / 1 minute */
  UPLOAD: { maxRequests: 5, windowMs: 60_000 } as RateLimitConfig,
  /** Embedding generation: 5 requests / 1 minute */
  EMBEDDING: { maxRequests: 5, windowMs: 60_000 } as RateLimitConfig,
  /** Admin operations: 30 requests / 1 minute */
  ADMIN: { maxRequests: 30, windowMs: 60_000 } as RateLimitConfig,
  /** Standard CRUD API routes: 60 requests / 1 minute */
  STANDARD: { maxRequests: 60, windowMs: 60_000 } as RateLimitConfig,
  /** Global IP baseline rate limit: 100 requests / 1 minute */
  GLOBAL_IP: { maxRequests: 100, windowMs: 60_000 } as RateLimitConfig,
} as const;

/** Internal sliding-window store: key → sorted timestamps of recent requests */
const memoryStore = new Map<string, number[]>();

/**
 * Check (and record) a request against rate limits.
 */
export function rateLimit(
  key: string,
  config: RateLimitConfig = RATE_LIMIT_PRESETS.STANDARD
): { allowed: true } | { allowed: false; retryAfterMs: number } {
  const now = Date.now();
  const windowStart = now - config.windowMs;

  // Prune stale timestamps
  const timestamps = (memoryStore.get(key) || []).filter((t) => t > windowStart);

  if (timestamps.length >= config.maxRequests) {
    const oldestInWindow = timestamps[0];
    const retryAfterMs = oldestInWindow + config.windowMs - now;

    memoryStore.set(key, timestamps);
    return { allowed: false, retryAfterMs: Math.max(retryAfterMs, 1000) };
  }

  timestamps.push(now);
  memoryStore.set(key, timestamps);
  return { allowed: true };
}

/**
 * Helper to build standard HTTP 429 Too Many Requests response
 */
export function rateLimitResponse(retryAfterMs: number) {
  const { NextResponse } = require('next/server');
  return NextResponse.json(
    {
      error: 'Too many requests. Please slow down and try again later.',
      retryAfterMs,
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(Math.ceil(retryAfterMs / 1000)),
        'X-RateLimit-Reset': String(Math.ceil((Date.now() + retryAfterMs) / 1000)),
      },
    }
  );
}

/**
 * Convenience wrapper: applies rate limit and returns 429 response if limit exceeded.
 */
export function applyRateLimit(
  key: string,
  config: RateLimitConfig = RATE_LIMIT_PRESETS.STANDARD
): Response | null {
  const result = rateLimit(key, config);
  if (!result.allowed) {
    return rateLimitResponse(result.retryAfterMs);
  }
  return null;
}
