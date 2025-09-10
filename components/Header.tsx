// components/Header.tsx
import React from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useAppTheme } from '@/providers/ThemeProvider';

function Glass({
  children,
  style,
  alpha,
}: { children: React.ReactNode; style?: any; alpha?: number }) {
  const { theme } = useAppTheme();

  // mặc định: icon nhạt hơn chip
  const baseAlpha =
    alpha ?? (theme.name === 'dark' ? 0.12 : 0.55); // dark đậm hơn, light dịu hơn
  const overlayColor =
    theme.name === 'dark'
      ? `rgba(255,255,255,${baseAlpha})`
      : `rgba(255,255,255,${baseAlpha})`;

  if (Platform.OS === 'ios') {
    return (
      <BlurView intensity={42} tint={theme.blurTint} style={[{ borderRadius: 16, overflow: 'hidden' }, style]}>
        {/* overlay để không bị quá trong */}
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: overlayColor }]} />
        {children}
      </BlurView>
    );
  }

  // Android: không blur thật, dùng màu mờ
  return (
    <View
      style={[
        {
          borderRadius: 16,
          overflow: 'hidden',
          backgroundColor: overlayColor, // tăng độ đặc
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
          <Glass
  alpha={theme.name === 'dark' ? 0.14 : 0.50}
  style={[styles.iconBtn, { borderWidth: 1, borderColor: theme.hairline }]}
>
  <Pressable style={styles.pressFill} onPress={() => {}}>
    <Ionicons name="menu" size={22} color={theme.text} />
  </Pressable>
</Glass>

          <View style={styles.rightGroup}>
            {/* Chip nhiệt độ */}
            <Glass
  alpha={theme.name === 'dark' ? 0.18 : 0.60}
  style={[styles.chip, { borderWidth: 1, borderColor: theme.hairline, borderRadius: 20 }]}
>
  <Pressable style={[styles.row, styles.chipPad]} onPress={() => {}}>
    <Ionicons name="sunny-outline" size={16} color="#F59E0B" />
    <Text style={[styles.chipText, { color: theme.text }]}>25°C</Text>
    <Ionicons name="chevron-down" size={16} color={theme.textSecondary} />
  </Pressable>
</Glass>

            {/* Chuông */}

<Glass
  alpha={theme.name === 'dark' ? 0.14 : 0.50}
  style={[styles.iconBtn, { borderWidth: 1, borderColor: theme.hairline }]}
>
  <Pressable style={styles.pressFill} onPress={() => {}}>
    <Ionicons name="notifications-outline" size={22} color={theme.text} />
    <View style={[styles.glowDot, { borderColor: theme.name === 'dark' ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.9)' }]} />
  </Pressable>
</Glass>
          </View>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
                <View
                  style={[
                    styles.glassSearchBar,
                    {
                      backgroundColor: theme.name === 'dark'
                        ? 'rgba(30,41,59,0.55)'
                        : 'rgba(255,255,255,0.7)',
                      borderColor: theme.hairline,
                      shadowOpacity: theme.name === 'dark' ? 0.04 : 0.08,
                    },
                  ]}
                >
                  <Ionicons
                    name="search-outline"
                    size={20}
                    color={theme.textSecondary}
                    style={styles.searchIcon}
                  />
                  <TextInput
                    placeholder="Discover the latest news..."
                    style={[styles.searchInput, { color: theme.text }]}
                    placeholderTextColor={theme.textSecondary}
                  />
                  <Pressable
                    style={[
                      styles.filterBtn,
                      {
                        backgroundColor:
                          theme.name === 'dark'
                            ? 'rgba(255,255,255,0.08)'
                            : 'rgba(255,255,255,0.5)',
                        borderColor: theme.hairline,
                      },
                    ]}
                  >
                    <Ionicons name="options-outline" size={18} color={theme.textSecondary} />
                  </Pressable>
                </View>
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
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    alignItems: 'center',
  },
  glassSearchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 6,
  },
  filterBtn: {
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    marginLeft: 8,
  },
   searchIcon: { marginRight: 12 },
  searchInput: { flex: 1, fontSize: 16, fontWeight: '500' },
});
