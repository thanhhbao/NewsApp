// components/CategoryChips.tsx
import React from 'react';
import { FlatList, Pressable, Text, View, StyleSheet } from 'react-native';

type Props = {
  categories: string[];
  value: string;                 // category đang chọn
  onChange: (c: string) => void;
};

export default function CategoryChips({ categories, value, onChange }: Props) {
  return (
    <FlatList
      data={categories}
      keyExtractor={(c) => c}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
      renderItem={({ item }) => {
        const active = item === value;
        return (
          <Pressable onPress={() => onChange(item)} style={[s.chip, active && s.chipActive]}>
            <Text style={[s.chipText, active && s.chipTextActive]}>{item}</Text>
          </Pressable>
        );
      }}
    />
  );
}
const s = StyleSheet.create({
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: '#eef2f7' },
  chipActive: { backgroundColor: '#cd2c10ff' },
  chipText: { color: '#334155', fontWeight: '600', textTransform: 'capitalize' },
  chipTextActive: { color: 'white' },
});
