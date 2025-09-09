// components/Chips.tsx
import { useAppTheme } from '@/providers/ThemeProvider';
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

  const { theme } = useAppTheme();

const renderItem = useCallback(
  ({ item }: { item: T; index: number }) => {
    const k = keyFn(item);
    const active = selectedKey === k;

    return (
      <Pressable
        onPress={() => onChange?.(item, k)}
        style={[
          styles.chip,
          // dùng màu theo theme thay vì màu cứng
          {
            backgroundColor: active ? theme.tint : theme.card,
            borderColor: theme.hairline,
          },
          chipStyle,
          active && styles.chipActive,      // nếu bạn có thêm hiệu ứng (scale, shadow…)
          active && chipActiveStyle,
          // ❗ bỏ hack marginLeft cho item đầu — hãy padding ở contentContainerStyle của FlatList
        ]}
        android_ripple={{
          color: theme.name === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)',
          borderless: false,
        }}
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      >
        <Text
          style={[
            styles.chipText,
            // màu chữ theo theme
            { color: active ? '#fff' : theme.text },
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
  [
    onChange,
    selectedKey,
    chipStyle,
    chipActiveStyle,
    chipTextStyle,
    chipTextActiveStyle,
    keyFn,
    labelFn,
    theme, // nhớ thêm theme vào deps để đổi màu khi toggle dark/light
  ]
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
  borderRadius: 18,
  borderWidth: StyleSheet.hairlineWidth,
  marginRight: 8,
},
chipText: { fontSize: 15, fontWeight: '700' },

  chipActive: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  chipTextActive: {
    color: '#DC2626',
  },
});
