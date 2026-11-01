/**
 * Simple in-memory API cache with TTL.
 * Prevents redundant network requests when navigating between pages.
 */
const cache = new Map();
const DEFAULT_TTL = 60_000; // 60 seconds

export const apiCache = {
  get(key) {
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
      cache.delete(key);
      return null;
    }
    return entry.data;
  },

  set(key, data, ttl = DEFAULT_TTL) {
    cache.set(key, { data, expiry: Date.now() + ttl });
  },

  invalidate(pattern) {
    for (const key of cache.keys()) {
      if (key.includes(pattern)) cache.delete(key);
    }
  },

  clear() {
    cache.clear();
  }
};

/** Fetch helper with cache support */
export async function cachedFetch(key, fetcher, ttl = DEFAULT_TTL) {
  const cached = apiCache.get(key);
  if (cached !== null) return cached;
  const data = await fetcher();
  apiCache.set(key, data, ttl);
  return data;
}

