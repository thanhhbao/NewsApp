// components/Chips.tsx
import React, { useMemo, useCallback } from 'react';
import {
  FlatList, View, Text, Pressable,
  StyleSheet, ViewStyle, TextStyle, FlatListProps,
} from 'react-native';

type Key = string | number;

type ChipsProps<T> = {
  data?: T[]; // <- cho phép optional
  selectedKey?: Key;
  onChange?: (item: T, key: Key) => void;
  getKey?: (item: T) => Key;
  getLabel?: (item: T) => string;

  contentContainerStyle?: ViewStyle;
  chipStyle?: ViewStyle;
  chipActiveStyle?: ViewStyle;
  chipTextStyle?: TextStyle;
  chipTextActiveStyle?: TextStyle;

  horizontal?: boolean;
  showsHorizontalScrollIndicator?: boolean;
  itemGap?: number;
} & Omit<
  FlatListProps<T>,
  'data' | 'renderItem' | 'keyExtractor' | 'extraData' | 'contentContainerStyle' | 'horizontal'
>;

function isPrimitive(v: unknown): v is string | number {
  return typeof v === 'string' || typeof v === 'number';
}

function dedupeBy<T>(arr: T[] | undefined, keyFn: (x: T) => Key) {
  if (!arr?.length) return [];
  const seen = new Set<Key>();
  const out: T[] = [];
  for (const x of arr) {
    const k = keyFn(x);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(x);
  }
  return out;
}

export default function Chips<T>({
  data = [], //  default tránh undefined
  selectedKey,
  onChange,
  getKey,
  getLabel,
  contentContainerStyle,
  chipStyle,
  chipActiveStyle,
  chipTextStyle,
  chipTextActiveStyle,
  horizontal = true,
  showsHorizontalScrollIndicator = false,
  itemGap = 8,
  ...rest
}: ChipsProps<T>) {
  const keyFn = useCallback(
    (x: T) => (getKey ? getKey(x) : (isPrimitive(x) ? (x as Key) : JSON.stringify(x))),
    [getKey]
  );
  const labelFn = useCallback(
    (x: T) => (getLabel ? getLabel(x) : (isPrimitive(x) ? String(x) : String(keyFn(x)))),
    [getLabel, keyFn]
  );

  const list = useMemo(() => dedupeBy(data, keyFn), [data, keyFn]);

  const renderItem = useCallback(
    ({ item, index }: { item: T; index: number }) => {
      const k = keyFn(item);
      const active = selectedKey === k;
      return (
        <Pressable
          onPress={() => onChange?.(item, k)}
          style={[
            styles.chip,
            chipStyle,
            active && styles.chipActive,
            active && chipActiveStyle,
            index === 0 && { marginLeft: 0 },
          ]}
          android_ripple={{ color: '#eee' }}
          accessibilityRole="button"
          accessibilityState={{ selected: active }}
          hitSlop={6}
        >
          <Text
            style={[
              styles.chipText,
              chipTextStyle,
              active && styles.chipTextActive,
              active && chipTextActiveStyle,
            ]}
          >
            {labelFn(item)}
          </Text>
        </Pressable>
      );
    },
    [onChange, selectedKey, chipStyle, chipActiveStyle, chipTextStyle, chipTextActiveStyle, keyFn, labelFn]
  );

  return (
    <FlatList
      data={list}
      horizontal={horizontal}
      showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
      keyExtractor={(item, idx) => `${String(keyFn(item))}:${idx}`} //  luôn unique
      renderItem={renderItem}
      ItemSeparatorComponent={() => <View style={{ width: itemGap }} />}
      contentContainerStyle={[{ paddingHorizontal: 16 }, contentContainerStyle]}
      extraData={selectedKey}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  chipActive: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  chipText: {
    color: '#374151',
    fontWeight: '500',
    fontSize: 14,
  },
  chipTextActive: {
    color: '#DC2626',
  },
});
