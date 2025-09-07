type Key = string;

const memory = new Map<Key, { count: number; resetAt: number }>();

export function rateLimit(key: Key, windowMs = 60_000, limit = 20) {
  const now = Date.now();
  const entry = memory.get(key);
  if (!entry || entry.resetAt < now) {
    memory.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }
  if (entry.count >= limit) {
    return { success: false, remaining: 0, retryAfter: Math.ceil((entry.resetAt - now) / 1000) } as const;
  }
  entry.count += 1;
  return { success: true, remaining: limit - entry.count } as const;
}

