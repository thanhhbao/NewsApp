import React from 'react';
import { View, Text, Image, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { NewsDataType } from '@/types';
import { cateColor } from '@/constants/CateColors';

type Props = {
  item: NewsDataType;
  onPress: () => void;
  style?: ViewStyle;         // cho phép override khi dùng ở carousel
  compact?: boolean;         // ảnh thấp hơn nếu cần
};

export default function ArticleCard({ item, onPress, style, compact }: Props) {
  const cat = (item.category && item.category[0]) || 'general';
  const clr = cateColor(cat);
  const imageHeight = compact ? 150 : 170;

  return (
    <Pressable onPress={onPress} style={[styles.card, style]}>
      <View style={[styles.coverWrap, { height: imageHeight }]}>
        <Image
          source={{ uri: item.image_url || 'https://via.placeholder.com/800x450?text=No+Image' }}
          style={styles.cover}
        />

        {/* gradient tăng tương phản ở đáy ảnh */}
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.55)']}
          style={StyleSheet.absoluteFill}
        />

        {/* category pill – góc phải dưới */}
        <View
          style={[
            styles.badge,
            { backgroundColor: clr.tint + 'E6', borderColor: clr.border },
          ]}
        >
          <Text style={[styles.badgeText, { color: clr.text }]}>{cat}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text numberOfLines={2} style={styles.title}>
          {item.title}
        </Text>
        <Text style={styles.meta}>{item.source_name}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '90%',  
    alignSelf: 'center',     
    borderRadius: 16,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  coverWrap: {
    position: 'relative',
    overflow: 'hidden',
  },
  cover: { width: '100%', height: '100%' },

  // badge ở góc phải-dưới
  badge: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    paddingHorizontal: 10,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // đổ bóng nhẹ để tách khỏi nền
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'lowercase',
    letterSpacing: 0.2,
  },

  body: { padding: 12, gap: 6 },
  title: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  meta: { fontSize: 12, color: '#6b7280' },
});
