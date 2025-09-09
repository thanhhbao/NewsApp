// components/Header.tsx
import React from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useAppTheme } from '@/providers/ThemeProvider';

function Glass({ children, style }: { children: React.ReactNode; style?: any }) {
  const { theme } = useAppTheme();
  // iOS: Blur thật, Android: nền trong mờ
  if (Platform.OS === 'ios') {
    return (
      <BlurView intensity={28} tint={theme.blurTint} style={[{ borderRadius: 16, overflow: 'hidden' }, style]}>
        {children}
      </BlurView>
    );
  }
  return (
    <View
      style={[
        {
          borderRadius: 16,
          backgroundColor: theme.card, // mờ nhẹ từ theme
          overflow: 'hidden',
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export default function Header() {
  const { top } = useSafeAreaInsets();
  const { theme } = useAppTheme();

  return (
    <>
      {/* Header trong suốt + hairline dưới */}
      <View style={[styles.headerContainer, { paddingTop: top, borderBottomColor: theme.hairline }]}>
        <View style={[styles.header, { paddingTop: 10 }]}>
          {/* Menu */}
          <Glass style={[styles.iconBtn, { borderWidth: StyleSheet.hairlineWidth, borderColor: theme.hairline }]}>
            <Pressable style={styles.pressFill} onPress={() => {}}>
              <Ionicons name="menu" size={22} color={theme.text} />
            </Pressable>
          </Glass>

          <View style={styles.rightGroup}>
            {/* Chip nhiệt độ */}
            <Glass
              style={[
                styles.chip,
                { borderWidth: StyleSheet.hairlineWidth, borderColor: theme.hairline, borderRadius: 20 },
              ]}
            >
              <Pressable style={[styles.row, styles.chipPad]} onPress={() => {}}>
                <Ionicons name="sunny-outline" size={16} color="#F59E0B" />
                <Text style={[styles.chipText, { color: theme.text }]}>25°C</Text>
                <Ionicons name="chevron-down" size={16} color={theme.textSecondary} />
              </Pressable>
            </Glass>

            {/* Chuông + chấm đỏ */}
            <Glass style={[styles.iconBtn, { borderWidth: StyleSheet.hairlineWidth, borderColor: theme.hairline }]}>
              <Pressable style={styles.pressFill} onPress={() => {}}>
                <Ionicons name="notifications-outline" size={22} color={theme.text} />
                <View style={[styles.glowDot, { borderColor: theme.card }]} />
              </Pressable>
            </Glass>
          </View>
        </View>
      </View>

      {/* Search */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 14, backgroundColor: theme.bg }}>
        <Glass style={{ borderWidth: StyleSheet.hairlineWidth, borderColor: theme.hairline, borderRadius: 16 }}>
          <View style={[styles.row, { paddingHorizontal: 14, paddingVertical: 10 }]}>
            <Ionicons name="search-outline" size={20} color={theme.textSecondary} style={{ marginRight: 10 }} />
            <TextInput
              placeholder="Discover the latest news..."
              placeholderTextColor={theme.textSecondary}
              style={[styles.input, { color: theme.text }]}
            />
            <Pressable style={[styles.iconMini, { borderColor: theme.hairline, backgroundColor: theme.card }]}>
              <Ionicons name="options-outline" size={18} color={theme.textSecondary} />
            </Pressable>
          </View>
        </Glass>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    borderBottomWidth: StyleSheet.hairlineWidth, // hairline mảnh theo theme
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  rightGroup: { flexDirection: 'row', alignItems: 'center', columnGap: 10 },
  row: { flexDirection: 'row', alignItems: 'center' },

  iconBtn: { width: 44, height: 44 },
  pressFill: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  chip: {},
  chipPad: { paddingHorizontal: 14, paddingVertical: 8, columnGap: 8 },
  chipText: { fontWeight: '700', fontSize: 14 },

  input: { flex: 1, fontSize: 16, fontWeight: '500' },
  iconMini: {
    padding: 8,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginLeft: 8,
  },

  glowDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 4,
    elevation: 2,
  },
});
