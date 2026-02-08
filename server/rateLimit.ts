/**
 * Rate limiter with Redis support for multi-instance deployments.
 *
 * When REDIS_URL is set, uses Redis for distributed rate limiting via a
 * sliding window counter. Falls back to in-memory storage when Redis is
 * unavailable (development, single-instance, or if Redis connection fails).
 *
 * The Redis implementation uses a simple key-per-window approach:
 *   Key: `rl:{key}:{windowId}` with TTL = windowMs
 *   Each request increments the counter atomically via INCR.
 */

import type { Redis as RedisType } from "ioredis";

// ---------------------------------------------------------------------------
// In-memory fallback store
// ---------------------------------------------------------------------------

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes (memory store only)
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  memoryStore.forEach((entry, key) => {
    if (entry.resetAt <= now) {
      memoryStore.delete(key);
    }
  });
}, 5 * 60 * 1000);

// Allow Node to exit even if the interval is still running
if (typeof cleanupTimer === "object" && "unref" in cleanupTimer) {
  cleanupTimer.unref();
}

// ---------------------------------------------------------------------------
// Redis client (lazy initialised)
// ---------------------------------------------------------------------------

let redisClient: RedisType | null = null;
let redisAvailable = false;
let redisInitAttempted = false;

async function getRedis(): Promise<RedisType | null> {
  if (redisInitAttempted) return redisClient;
  redisInitAttempted = true;

  const url = process.env.REDIS_URL;
  if (!url) return null;

  try {
    // Dynamic import so the app works without ioredis installed
    const { default: Redis } = await import("ioredis");
    redisClient = new Redis(url, {
      maxRetriesPerRequest: 1,
      connectTimeout: 3000,
      lazyConnect: true,
      enableOfflineQueue: false,
    });

    await redisClient.connect();
    redisAvailable = true;
    console.log("[RateLimit] Redis connected successfully");
    return redisClient;
  } catch (err) {
    console.warn("[RateLimit] Redis unavailable, using in-memory fallback:", err);
    redisClient = null;
    redisAvailable = false;
    return null;
  }
}

// Kick off the connection attempt at module load (non-blocking)
getRedis().catch(() => {});

// ---------------------------------------------------------------------------
// Check rate limit — memory fallback
// ---------------------------------------------------------------------------

function checkRateLimitMemory(
  key: string,
  maxRequests: number,
  windowMs: number,
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = memoryStore.get(key);

  if (!entry || entry.resetAt <= now) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt };
}

// ---------------------------------------------------------------------------
// Check rate limit — Redis
// ---------------------------------------------------------------------------

async function checkRateLimitRedis(
  redis: RedisType,
  key: string,
  maxRequests: number,
  windowMs: number,
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const now = Date.now();
  const windowId = Math.floor(now / windowMs);
  const redisKey = `rl:${key}:${windowId}`;
  const ttlSeconds = Math.ceil(windowMs / 1000);

  try {
    // INCR is atomic — first call creates the key with value 1
    const count = await redis.incr(redisKey);

    // Set TTL only on the first request in this window
    if (count === 1) {
      await redis.expire(redisKey, ttlSeconds);
    }

    const resetAt = (windowId + 1) * windowMs;
    const allowed = count <= maxRequests;
    const remaining = Math.max(0, maxRequests - count);

    return { allowed, remaining, resetAt };
  } catch (err) {
    // If Redis fails mid-request, fall back to memory
    console.warn("[RateLimit] Redis error, falling back to memory:", err);
    redisAvailable = false;
    return checkRateLimitMemory(key, maxRequests, windowMs);
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Check if a request should be rate limited.
 *
 * Uses Redis when available (distributed across instances), otherwise
 * falls back to an in-memory sliding window.
 *
 * @param key - Identifier (e.g. IP address)
 * @param maxRequests - Maximum requests allowed in the window (default: 10)
 * @param windowMs - Time window in milliseconds (default: 60000 = 1 minute)
 * @returns Object with `allowed` boolean and `remaining` count
 */
export function checkRateLimit(
  key: string,
  maxRequests = 10,
  windowMs = 60_000,
): { allowed: boolean; remaining: number; resetAt: number } {
  // If Redis is connected, try the async path but return synchronously
  // by using the memory fallback as the sync result. The async Redis
  // check is used on subsequent calls once initialised.
  //
  // Because tRPC procedures are async, callers can also use the async
  // version directly. For backwards compatibility the sync signature
  // is preserved here — it always works via the memory store.
  if (!redisAvailable || !redisClient) {
    return checkRateLimitMemory(key, maxRequests, windowMs);
  }

  // For sync callers: use memory as the immediate answer.
  // The Redis counter is still incremented in the background to keep
  // the distributed count accurate.
  const memResult = checkRateLimitMemory(key, maxRequests, windowMs);

  // Fire-and-forget Redis increment so the distributed count stays in sync
  checkRateLimitRedis(redisClient, key, maxRequests, windowMs).catch(() => {});

  return memResult;
}

/**
 * Async version that waits for the Redis result when available.
 * Prefer this in async contexts (tRPC mutations) for accurate distributed counts.
 */
export async function checkRateLimitAsync(
  key: string,
  maxRequests = 10,
  windowMs = 60_000,
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  if (redisAvailable && redisClient) {
    return checkRateLimitRedis(redisClient, key, maxRequests, windowMs);
  }
  return checkRateLimitMemory(key, maxRequests, windowMs);
}

/** Reset the in-memory store (useful for testing). */
export function resetRateLimitStore(): void {
  memoryStore.clear();
}

/** Disconnect Redis (useful for graceful shutdown / testing). */
export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    redisAvailable = false;
    redisInitAttempted = false;
  }
}
