import { useEffect, useState, useCallback, useRef } from 'react';
import { fetchTop } from '@/services/newsAPI';
import { NewsDataType } from '@/types';

const uniqById = (arr: NewsDataType[]) => {
  const seen = new Set<string>();
  return arr.filter(it => {
    const id = it.article_id || it.link || '';
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
};

export function useNewsTop(category?: string) {
  const [items, setItems] = useState<NewsDataType[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [end, setEnd] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const mounted = useRef(true);
  useEffect(() => () => { mounted.current = false; }, []);

  const load = useCallback(async (reset = false) => {
    if (loading || (end && !reset)) return;
    reset ? setRefreshing(true) : setLoading(true);
    setError(null);

    try {
      if (reset) setEnd(false);
      const { items: data } = await fetchTop({
        language: 'en',
        limit: 20,
        page: reset ? 1 : page,
        categories: category ? [category as any] : undefined,
      });
      if (!mounted.current) return;
      setItems(prev => uniqById(reset ? data : [...prev, ...data]));
      setPage(p => (reset ? 2 : p + 1));
      if (!data.length) setEnd(true);
    } catch (e) {
      if (!mounted.current) return;
      setError(e);
    } finally {
      if (!mounted.current) return;
      reset ? setRefreshing(false) : setLoading(false);
    }
  }, [loading, end, page, category]);

  useEffect(() => {
    setItems([]); setPage(1); setEnd(false);
    load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  return { items, loading, refreshing, end, error, loadMore: () => load(false), refresh: () => load(true) };
}
