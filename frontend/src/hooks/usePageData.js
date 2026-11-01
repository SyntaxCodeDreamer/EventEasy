import { useState, useEffect, useCallback, useRef } from "react";
import { cachedFetch, apiCache } from "../services/cache";

/**
 * Generic data-fetching hook with:
 *  - In-memory cache (avoids repeat calls when navigating back)
 *  - Deduplication (ignores second call if first is in-flight)
 *  - Manual refresh support
 */
export function usePageData(cacheKey, fetcher, deps = [], ttl) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const inFlight = useRef(false);

  const load = useCallback(
    async (bust = false) => {
      if (!cacheKey) return;
      if (inFlight.current) return;
      inFlight.current = true;
      setLoading(true);
      setError(null);
      try {
        if (bust) apiCache.invalidate(cacheKey);
        const result = await cachedFetch(cacheKey, fetcher, ttl);
        setData(result);
      } catch (err) {
        setError(err.message || "Failed to load data");
        console.error(`[usePageData] ${cacheKey}:`, err);
      } finally {
        setLoading(false);
        inFlight.current = false;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cacheKey, ...deps]
  );

  useEffect(() => {
    load();
  }, [load]);

  const refresh = useCallback(() => load(true), [load]);

  return { data, loading, error, refresh };
}

