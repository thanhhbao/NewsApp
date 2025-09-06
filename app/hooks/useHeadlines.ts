// hooks/useNewsTop.ts
import { useEffect, useState, useCallback } from 'react';

import { NewsDataType } from '@/types';
import { fetchTop } from '../services/newsAPI';

export function useNewsTop(category?: string) {
  const [items, setItems] = useState<NewsDataType[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [end, setEnd] = useState(false);

  const load = useCallback(async (reset = false) => {
    if (loading || (end && !reset)) return;
    setLoading(true);
    try {
      const { items: data } = await fetchTop({
        language: 'en',
        limit: 20,
        page: reset ? 1 : page,
        categories: category ? [category as any] : undefined,
      });
      setItems((prev) => (reset ? data : [...prev, ...data]));
      setPage((p) => (reset ? 2 : p + 1));
      if (!data.length) setEnd(true);
    } finally {
      setLoading(false);
    }
  }, [loading, end, page, category]);

  useEffect(() => { load(true); }, [category]); // reload khi đổi category
  return { items, loading, loadMore: () => load(), refresh: () => load(true), end };
}
