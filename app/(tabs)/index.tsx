// app/(tabs)/index.tsx
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, FlatList, RefreshControl, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HeaderComponent from '@/components/Header';
import BreakingNews from '@/components/BreakingNews';
import CategoryChips from '@/components/CategoryChips';
import ArticleCard from '@/components/ArticleCard';

import { NewsDataType } from '@/types';
import { useNewsTop } from '@/hooks/useNewsTop';           // ✅ đúng hook
import { fetchHeadlines } from '@/services/newsAPI';

const CATEGORIES = [
  'all',
  'business',
  'tech',
  'sports',
  'entertainment',
  'science',
  'world',
  'health',
];

export default function Page() {
  const { top: safeTop } = useSafeAreaInsets();
  const [breaking, setBreaking] = useState<NewsDataType[]>([]);
  const [cat, setCat] = useState<'all' | string>('all');

  // ✅ dùng custom hook theo category
  const {
    items,
    loading,
    refreshing = loading as boolean,   // nếu hook của bạn chưa có 'refreshing'
    loadMore,
    refresh,
    end,
  } = useNewsTop(cat === 'all' ? undefined : (cat as string));

  // ✅ fetch headlines cho BreakingNews (carousel)
  useEffect(() => {
    (async () => {
      try {
        const { items } = await fetchHeadlines({
          language: 'en',
          headlinesPerCategory: 3,
        });
        setBreaking(items.slice(0, 10));
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  return (
    <View style={[styles.container, { paddingTop: safeTop }]}>
      <FlatList
        data={items}
        keyExtractor={(it, idx) => `${it.article_id || it.link || 'noid'}:${idx}`} // ✅ tránh trùng key
        renderItem={({ item }) => (
          <ArticleCard
            item={item}
            onPress={() => {
              // TODO: điều hướng sang trang chi tiết
              console.log('open', item.link);
            }}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        refreshControl={
          <RefreshControl refreshing={!!refreshing} onRefresh={refresh} />
        }
        onEndReachedThreshold={0.4}
        onEndReached={() => !end && loadMore()}
        ListHeaderComponent={
          <View>
            <HeaderComponent />

            <BreakingNews newsList={breaking} loading={!breaking.length} />

            <View style={{ height: 12 }} />
            <CategoryChips
              data={CATEGORIES}                 // ✅ dùng CATEGORIES
              selectedKey={cat}                 // ✅ state hiện tại
              onChange={(_, key) => setCat(String(key) as any)} // ✅ cập nhật state
              itemGap={8}
            />
            <View style={{ height: 8 }} />

            <Text
              style={{
                fontSize: 18,
                fontWeight: '700',
                paddingHorizontal: 16,
                marginTop: 8,
              }}
            >
              Tin mới hôm nay
            </Text>
          </View>
        }
        ListFooterComponent={<View style={{ height: 24 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
});
