import { useEffect, useState } from "react";
import { api } from "~/api/api";
import type { Paginated } from "~/api/types";

type Options<T> = {
  limit?: number;
  fetchDelay?: number;
  keyFn?: (item: T) => number | string;
};

export function usePaginatedList<T>(endpoint: string, opts: Options<T> = {}) {
  const { limit = 10, fetchDelay = 0, keyFn = ((it: any) => it.id) as (item: T) => number | string } = opts;

  const [items, setItems] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [offset, setOffset] = useState(0);

  const load = async (currentOffset: number) => {
    try {
      setIsLoading(true);

      if (currentOffset > 0 && fetchDelay > 0) {
        await new Promise((r) => setTimeout(r, fetchDelay));
      }

      const res = await api.get(`${endpoint}?after=${currentOffset}&limit=${limit}`).json<Paginated<T>>();

      setHasMore(res?.pagination?.hasNext ?? false);
      const nextItems = res?.data ?? [];

      setItems((prev) => {
        if (!prev.length) return nextItems;
        const map = new Map<number | string, T>();
        prev.forEach((it) => map.set(keyFn(it), it));
        nextItems.forEach((it) => map.set(keyFn(it), it));
        return Array.from(map.values());
      });
    } catch (err) {
      // swallow — caller can add error handling if needed
      // eslint-disable-next-line no-console
      console.error("usePaginatedList error", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load(offset);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onLoadMore = () => {
    const next = offset + limit;
    setOffset(next);
    load(next);
  };

  return { items, hasMore, isLoading, onLoadMore };
}
