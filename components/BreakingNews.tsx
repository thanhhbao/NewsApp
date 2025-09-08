// components/BreakingNews.tsx
import React, { useMemo, useRef, useState, useCallback } from 'react';
import { Text, View, StyleSheet, FlatList, Image, Pressable, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { NewsDataType } from '@/types';

type Props = { newsList: NewsDataType[]; loading?: boolean };

const CARD_W = 280;
const GAP = 12;
const SIDE = 16;
const SNAP = CARD_W + GAP; // khoảng cách giữa hai card

export default function BreakingNews({ newsList, loading }: Props) {
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList<NewsDataType>>(null);

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const i = Math.round(x / SNAP);
    if (i !== index) setIndex(i);
  }, [index]);

  const dots = useMemo(() => (
    <View style={styles.dots}>
      {newsList.map((_, i) => (
        <View
          key={i}
          style={[styles.dot, i === index && styles.dotActive]}
        />
      ))}
    </View>
  ), [newsList, index]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Xu hướng</Text>

      <FlatList
  ref={listRef}
  horizontal
  data={newsList}
  keyExtractor={(it, idx) => `${it.article_id || it.link || 'noid'}:${idx}`}  
  renderItem={({ item }) => (
    <Pressable style={styles.card} onPress={() => { /* open link */ }}>
      <Image
        source={{ uri: item.image_url || 'https://via.placeholder.com/800x450?text=No+Image' }}
        style={styles.image}
        resizeMode="cover"
      />
      <Text numberOfLines={2} style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.meta}>{item.source_name}</Text>
    </Pressable>
  )}
  ItemSeparatorComponent={() => <View style={{ width: GAP }} />}
  contentContainerStyle={{ paddingHorizontal: SIDE }}
  showsHorizontalScrollIndicator={false}
  snapToInterval={SNAP}
  decelerationRate="fast"
  snapToAlignment="start"
  overScrollMode="never"
  scrollEventThrottle={16}
  onScroll={onScroll}
  getItemLayout={(_, index) => ({ length: SNAP, offset: SNAP * index, index })}  // ✅
  ListEmptyComponent={
    <View style={{ padding: 16 }}>
      <Text>{loading ? 'Đang tải…' : 'Chưa có dữ liệu'}</Text>
    </View>
  }
/>

      {/* 👇 các chấm ở dưới */}
      {newsList.length > 1 && dots}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 8 },
  title: { fontSize: 20, fontWeight: '700', marginLeft: SIDE, marginBottom: 8 },
  card: {
    width: CARD_W,
    borderRadius: 14,
    backgroundColor: '#fff',
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  image: { width: '100%', height: 150, backgroundColor: '#EEE' },
  cardTitle: { paddingHorizontal: 12, paddingTop: 10, fontWeight: '700', color: '#0f172a' },
  meta: { paddingHorizontal: 12, paddingVertical: 8, color: '#6b7280' },

  // pagination dots
  dots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#d1d5db', marginHorizontal: 4 },
  dotActive: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444' }, // màu đỏ như mẫu
});
