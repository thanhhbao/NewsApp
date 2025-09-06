// components/ArticleCard.tsx
import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { NewsDataType } from '@/types';

type Props = { item: NewsDataType; onPress?: () => void };
export default function ArticleCard({ item, onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={s.card}>
      <Image source={{ uri: item.image_url || 'https://via.placeholder.com/640x360?text=No+Image' }} style={s.img} />
      <View style={{ flex: 1 }}>
        <Text numberOfLines={2} style={s.title}>{item.title}</Text>
        <Text style={s.meta}>{item.source_name}</Text>
      </View>
    </Pressable>
  );
}
const s = StyleSheet.create({
  card: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingVertical: 10, alignItems: 'center' },
  img: { width: 112, height: 72, borderRadius: 8, backgroundColor: '#eee' },
  title: { fontWeight: '700', color: '#0f172a' },
  meta: { color: '#6b7280', marginTop: 4 },
});
