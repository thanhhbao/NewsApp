// app/(tabs)/saved.tsx
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  FlatList,
  Pressable,
  Alert,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import CategoryChips from '@/components/CategoryChips';
import { Colors } from '@/constants/Colors';
import { NewsDataType } from '@/types';
import { cateColor } from '@/constants/CateColors';
import { useAppTheme } from '@/providers/ThemeProvider';

const STORAGE_KEY = '@saved_articles';
const FALLBACK_IMG = 'https://via.placeholder.com/600x400/EEF2F7/94A3B8?text=News';

type SavedArticle = Pick<
  NewsDataType,
  'article_id' | 'link' | 'title' | 'image_url' | 'category' | 'creator' | 'pubDate' | 'source_name'
> & {
  savedAt: string; // ISO
};

const FILTERS = ['all', 'recent', 'sports', 'education', 'world', 'politics'] as const;
type FilterKey = typeof FILTERS[number];

export default function SavedScreen() {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();

  const [view, setView] = useState<'list' | 'grid'>('list');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [items, setItems] = useState<SavedArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // ---- load từ AsyncStorage
  const loadSaved = useCallback(async () => {
    setLoading(true);
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const arr: SavedArticle[] = raw ? JSON.parse(raw) : [];
      arr.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
      setItems(arr);
    } catch (e) {
      console.warn('load saved error', e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // lần đầu
  useEffect(() => {
    loadSaved();
  }, [loadSaved]);

  // quay lại màn hình thì reload (nếu vừa lưu/xoá ở màn khác)
  useFocusEffect(useCallback(() => { loadSaved(); }, [loadSaved]));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSaved();
    setRefreshing(false);
  }, [loadSaved]);

  // ---- helpers
  const isRecent = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    return diff / 86400000 < 2; // today + yesterday
  };

  const data = useMemo(() => {
    if (filter === 'all') return items;
    if (filter === 'recent') return items.filter(i => isRecent(i.savedAt));
    // map education -> science do API
    const token = filter === 'education' ? 'science' : filter;
    return items.filter(i => (i.category?.[0] || 'general').toLowerCase().includes(token));
  }, [items, filter]);

  const removeItem = async (id: string) => {
    const next = items.filter(i => String(i.article_id || i.link) !== id);
    setItems(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const confirmRemove = (id: string) => {
    Alert.alert('Remove from Saved', 'Remove this article from your saved list?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeItem(id) },
    ]);
  };

  // ---- renderers
  const renderList = ({ item }: { item: SavedArticle }) => {
    const id = String(item.article_id || item.link);
    const cat = (item.category?.[0] || 'general').toLowerCase();
    const clr = cateColor(cat);

    const author = (Array.isArray(item.creator) && item.creator[0]) || item.source_name || 'Unknown';
    const dateStr = new Date(item.pubDate || Date.now()).toLocaleDateString('en-US', {
      month: 'short', day: '2-digit', year: 'numeric',
    });

    return (
      <Pressable style={[styles.rowCard, { backgroundColor: theme.card }]} onPress={() => console.log('open saved', item.link)}>
        {/* cover + pill */}
        <View style={[styles.rowCoverWrap, { backgroundColor: theme.name === 'dark' ? '#1f2937' : '#E5E7EB' }]}>
          <Image source={{ uri: item.image_url || FALLBACK_IMG }} style={styles.rowCover} />
          <View style={[styles.pill, { backgroundColor: clr.tint + 'E6', borderColor: clr.border }]}>
            <Text style={[styles.pillText, { color: clr.text }]}>{cat}</Text>
          </View>
        </View>

        {/* body */}
        <View style={styles.rowBody}>
          <Text numberOfLines={2} style={[styles.title, { color: theme.text }]}>{item.title}</Text>

          <View style={styles.metaLine}>
            <View style={[styles.avatar, { backgroundColor: Colors.tabIconSelected }]}>
              <Text style={styles.avatarTxt}>{author.charAt(0).toUpperCase()}</Text>
            </View>
            <Text style={[styles.metaTxt, { color: theme.textSecondary }]}>{author}</Text>
            <Text style={[styles.metaDot, { color: theme.textSecondary }]}>•</Text>
            <Text style={[styles.metaFaded, { color: theme.textSecondary }]}>{dateStr}</Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity onPress={() => confirmRemove(id)} style={styles.actionBtn}>
              <Text style={[styles.actionTxt, { color: '#EF4444' }]}>Remove</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.savedNote, { color: theme.textSecondary }]}>
            Saved {new Date(item.savedAt).toLocaleString()}
          </Text>
        </View>
      </Pressable>
    );
  };

  const renderGrid = ({ item }: { item: SavedArticle }) => {
    const id = String(item.article_id || item.link);
    const cat = (item.category?.[0] || 'general').toLowerCase();
    const clr = cateColor(cat);

    return (
      <Pressable style={[styles.gridCard, { backgroundColor: theme.card }]} onPress={() => console.log('open saved', item.link)}>
        <View style={[styles.gridCoverWrap, { backgroundColor: theme.name === 'dark' ? '#1f2937' : '#E5E7EB' }]}>
          <Image source={{ uri: item.image_url || FALLBACK_IMG }} style={styles.gridCover} />
          <View style={[styles.pill, { right: 8, bottom: 8, backgroundColor: clr.tint + 'E6', borderColor: clr.border }]}>
            <Text style={[styles.pillText, { color: clr.text }]}>{cat}</Text>
          </View>
          <TouchableOpacity style={styles.removeChip} onPress={() => confirmRemove(id)}>
            <Text style={styles.removeChipTxt}>×</Text>
          </TouchableOpacity>
        </View>
        <View style={{ padding: 12 }}>
          <Text numberOfLines={2} style={[styles.gridTitle, { color: theme.text }]}>{item.title}</Text>
          <Text style={[styles.gridSaved, { color: theme.textSecondary }]}>
            Saved {new Date(item.savedAt).toLocaleDateString()}
          </Text>
        </View>
      </Pressable>
    );
  };

  const bottomPad = insets.bottom + 96;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <FlatList
        data={data}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        numColumns={view === 'grid' ? 2 : 1}
        key={view}
        renderItem={view === 'grid' ? renderGrid : renderList}
        keyExtractor={(it) => String(it.article_id || it.link)}
        ItemSeparatorComponent={view === 'grid' ? undefined : () => <View style={{ height: 12 }} />}
        columnWrapperStyle={view === 'grid' ? { gap: 12, paddingHorizontal: 16 } : undefined}
        contentContainerStyle={{ paddingBottom: bottomPad }}
        ListHeaderComponent={
          <View>
            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.pageTitle, { color: theme.text }]}>Saved</Text>
              <Text style={[styles.pageSub, { color: theme.textSecondary }]}>{items.length} saved articles</Text>
            </View>

            {/* View toggle */}
            <View style={styles.toggleRow}>
              <View style={[styles.toggle, { backgroundColor: theme.name === 'dark' ? 'rgba(255,255,255,0.08)' : '#E5E7EB' }]}>
                <TouchableOpacity
                  onPress={() => setView('list')}
                  style={[styles.toggleBtn, view === 'list' && { backgroundColor: Colors.tabIconSelected }]}
                >
                  <Text style={[styles.toggleTxt, { color: theme.textSecondary }, view === 'list' && styles.toggleTxtActive]}>≡</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setView('grid')}
                  style={[styles.toggleBtn, view === 'grid' && { backgroundColor: Colors.tabIconSelected }]}
                >
                  <Text style={[styles.toggleTxt, { color: theme.textSecondary }, view === 'grid' && styles.toggleTxtActive]}>⊞</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Filters */}
            <CategoryChips
              data={[...FILTERS] as string[]}
              selectedKey={filter}
              onChange={(_, key) => setFilter(key as FilterKey)}
              itemGap={8}
              style={{ marginBottom: 12}}
            />
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No articles saved yet</Text>
              <Text style={[styles.emptyTxt, { color: theme.textSecondary }]}>Save articles to read later.</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

/* ================= styles ================= */
const R = 16;

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4 },
  pageTitle: { fontSize: 28, fontWeight: '800' },
  pageSub: { fontSize: 14, marginTop: 4 },

  toggleRow: { paddingHorizontal: 16, paddingVertical: 10, alignItems: 'flex-end' },
  toggle: { flexDirection: 'row', borderRadius: 20, padding: 2 },
  toggleBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 18 },
  toggleTxt: { fontSize: 15, fontWeight: '700' },
  toggleTxtActive: { color: '#fff' },

  // List
  rowCard: {
    flexDirection: 'row',
    marginHorizontal: 16,
    borderRadius: R,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  rowCoverWrap: { width: 120, height: 120, position: 'relative' },
  rowCover: { width: '100%', height: '100%' },
  rowBody: { flex: 1, padding: 12, gap: 6 },
  title: { fontSize: 16, fontWeight: '800', lineHeight: 22 },

  metaLine: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  avatar: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { color: '#fff', fontSize: 10, fontWeight: '800' },
  metaTxt: { fontSize: 12 },
  metaFaded: { fontSize: 12 },
  metaDot: {},

  actions: { flexDirection: 'row', gap: 14, marginTop: 2 },
  actionBtn: { paddingVertical: 2 },
  actionTxt: { fontSize: 12, fontWeight: '700' },

  savedNote: { fontSize: 12 },

  // Grid
  gridCard: {
    width: '48%',
    borderRadius: R,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    marginBottom: 12,
  },
  gridCoverWrap: { width: '100%', height: 120, position: 'relative' },
  gridCover: { width: '100%', height: '100%' },
  gridTitle: { fontSize: 14, fontWeight: '800', lineHeight: 18 },
  gridSaved: { marginTop: 6, fontSize: 11 },

  // category pill (chung)
  pill: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    paddingHorizontal: 10,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillText: { fontSize: 12, fontWeight: '800', textTransform: 'lowercase' },

  // remove chip (grid)
  removeChip: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeChipTxt: { color: '#fff', fontSize: 16, fontWeight: '800', lineHeight: 16 },

  empty: { alignItems: 'center', paddingVertical: 64, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '800' },
  emptyTxt: { fontSize: 14 },
});
