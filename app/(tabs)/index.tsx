// app/(tabs)/index.tsx
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { StyleSheet, View, FlatList, RefreshControl, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HeaderComponent from '@/components/Header';
import BreakingNews from '@/components/BreakingNews';
import CategoryChips from '@/components/CategoryChips';
import ArticleCard from '@/components/ArticleCard';

import { NewsDataType } from '@/types';
import { useNewsTop } from '@/hooks/useNewsTop';
import { fetchHeadlines } from '@/services/newsAPI';

import { explain } from '@/utils/formatApiError';
import ErrorState from '@/components/ErrorState';
import { useAppTheme } from '@/providers/ThemeProvider'; 

const CATEGORIES = [
  'all','business','tech','sports','entertainment','science','world','health',
];

export default function Page() {

  const { theme } = useAppTheme(); // 👈 lấy màu từ theme

  const [breaking, setBreaking] = useState<NewsDataType[]>([]);
  const [breakingError, setBreakingError] = useState<unknown>(null);
  const [cat, setCat] = useState<'all' | string>('all');

  const {
    items, loading, refreshing = loading as boolean, loadMore, refresh, end,
  } = useNewsTop(cat === 'all' ? undefined : (cat as string));

  const loadBreaking = useCallback(async () => {
    try {
      setBreakingError(null);
      const { items } = await fetchHeadlines({ language: 'en', headlinesPerCategory: 3 });
      setBreaking(items.slice(0, 10));
    } catch (e) {
      setBreaking([]);
      setBreakingError(e);
    }
  }, []);

  useEffect(() => { loadBreaking(); }, [loadBreaking]);

  const usedKeys = useMemo(() => {
    const s = new Set<string>();
    breaking.forEach(b => s.add(String(b.article_id || b.link)));
    return s;
  }, [breaking]);

  const feed = useMemo(
    () => items.filter(a => !usedKeys.has(String(a.article_id || a.link))),
    [items, usedKeys]
  );

  const onRefresh = useCallback(async () => {
    await Promise.allSettled([refresh(), loadBreaking()]);
  }, [refresh, loadBreaking]);

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <FlatList
        data={feed}
        keyExtractor={(it, idx) => `${it.article_id || it.link || 'noid'}:${idx}`}
        renderItem={({ item }) => (
          <ArticleCard item={item} onPress={() => console.log('open', item.link)} />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        refreshControl={<RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} />}
        onEndReachedThreshold={0.4}
        onEndReached={() => !end && loadMore()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}

        ListHeaderComponent={
          <View>
            <HeaderComponent />

            {breakingError ? (
              <ErrorState
                title={explain(breakingError).title}
                message={explain(breakingError).message}
                onRetry={loadBreaking}
              />
            ) : (
              <BreakingNews newsList={breaking} loading={!breaking.length} />
            )}

            <View style={{ height: 12 }} />
            <CategoryChips
              data={CATEGORIES}
              selectedKey={cat}
              onChange={(_, key) => setCat(String(key) as any)}
              itemGap={8}
            />

            {/* Tiêu đề */}
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Recommendation
            </Text>
            {/* đệm cố định dưới tiêu đề để tránh layout “giật” */}
            <View style={{ height: 8 }} />
          </View>
        }

        /* 👇 Luôn render container giữ chỗ (minHeight), chỉ ẩn/hiện text.
              Như vậy khi loading <-> empty không thay đổi layout nên hết nhấp nháy */
        ListEmptyComponent={
          <View style={{ padding: 16, minHeight: 48, justifyContent: 'center' }}>
            {!loading && (
              <Text style={{ color: theme.textSecondary }}>
                Nothing to display
              </Text>
            )}
          </View>
        }

        ListFooterComponent={<View style={{ height: 24 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
  },
});
