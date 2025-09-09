import { Colors } from '@/constants/Colors';
import { cateColor } from '@/constants/CateColors';
import CategoryChips from '@/components/CategoryChips';
import { fetchHeadlines, fetchTop, NewsCategory } from '@/services/newsAPI';
import { NewsDataType } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  FlatList,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/providers/ThemeProvider';

/* =================== Tabs & mapping =================== */
const CATEGORIES = ['all', 'politics', 'sports', 'education', 'world'] as const;
type TabValue = typeof CATEGORIES[number];

const TAB_TO_API: Partial<Record<TabValue, NewsCategory>> = {
  politics: 'politics',
  sports: 'sports',
  world: 'world',
  education: 'science', // TheNewsAPI không có education
};

const FALLBACK_IMG =
  'https://via.placeholder.com/600x400/EEF2F7/94A3B8?text=News';

type UiNews = {
  id: string;
  category: string;
  title: string;
  author: string;
  date: string;
  image: string;
};

const uniqueById = <T extends { article_id?: string; link?: string }>(arr: T[]) => {
  const seen = new Set<string>();
  return arr.filter((a) => {
    const k = String(a.article_id || a.link || '');
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};

const DiscoverScreen = () => {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();

  const [selected, setSelected] = useState<TabValue>('all');
  const [loading, setLoading] = useState(false);
  const [apiItems, setApiItems] = useState<NewsDataType[]>([]);

  // tải dữ liệu khi đổi tab
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const cat = TAB_TO_API[selected];
        const { items } = await fetchTop({
          language: 'en',
          limit: 20,
          ...(cat ? { categories: [cat] } : {}),
        });
        if (!cancelled) setApiItems(items);
      } catch {
        try {
          const { items } = await fetchHeadlines({
            language: 'en',
            headlinesPerCategory: 5,
          });
          const cat = TAB_TO_API[selected];
          const filtered = cat
            ? items.filter((a) =>
                (a.category || []).some((c) =>
                  String(c).toLowerCase().includes(String(cat))
                )
              )
            : items;
          if (!cancelled) setApiItems(filtered);
        } catch {
          if (!cancelled) setApiItems([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selected]);

  // map về UI + lọc chắc chắn + loại trùng
  const news: UiNews[] = useMemo(() => {
    const token = selected === 'all' ? null : selected;
    const filtered = token
      ? apiItems.filter((a) =>
          (a.category || []).some((c) =>
            String(c).toLowerCase().includes(token)
          )
        )
      : apiItems;

    const clean = uniqueById(filtered);

    return clean.map((a) => ({
      id: String(a.article_id ?? a.link),
      category: (a.category?.[0] || 'General').toLowerCase(),
      title: a.title,
      author:
        (Array.isArray(a.creator) && a.creator[0]) || a.source_name || 'Unknown',
      date: new Date(a.pubDate || Date.now()).toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      }),
      image: a.image_url || FALLBACK_IMG,
    }));
  }, [apiItems, selected]);

  const renderNewsItem = ({ item }: { item: UiNews }) => {
    const clr = cateColor(item.category); // { tint, text, border }
    return (
      <TouchableOpacity style={[styles.newsItem, { backgroundColor: theme.card }]} activeOpacity={0.85}>
        <View style={[styles.imageWrap, { backgroundColor: theme.name === 'dark' ? '#1f2937' : '#ddd' }]}>
          <Image source={{ uri: item.image }} style={styles.newsImage} />
          {/* category pill góc phải-dưới (nền đậm, chữ trắng) */}
          <View
            style={[
              styles.catPill,
              { backgroundColor: `${clr.tint}E6`, borderColor: clr.border },
            ]}
          >
            <Text style={[styles.catPillText, { color: clr.text }]}>
              {item.category}
            </Text>
          </View>
        </View>
        <View style={styles.newsContent}>
          <Text style={[styles.newsTitle, { color: theme.text }]} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.authorInfo}>
            <View style={[styles.authorAvatar, { backgroundColor: Colors.tabIconSelected }]}>
              <Text style={styles.avatarText}>
                {(item.author || 'A').charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={[styles.authorName, { color: theme.textSecondary }]}>{item.author}</Text>
            <Text style={[styles.dateText, { color: theme.textSecondary }]}>• {item.date}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const bottomPad = insets.bottom + 96; // tránh bị TabBar nổi đè

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPad }}
      >
        {/* Header đơn giản */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Discover</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            News from all around the world
          </Text>
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

        {/* CategoryChips thống nhất với Home */}
        <CategoryChips
          data={[...CATEGORIES] as unknown as string[]}   // tránh lỗi readonly tuple
          selectedKey={selected}
          onChange={(_, key) => setSelected(key as TabValue)}
          itemGap={8}
          style={{ marginBottom: 10 }}
        />

        {/* News List */}
        <View style={[styles.newsList, { paddingHorizontal: 20 }]}>
          {loading && news.length === 0 ? (
            <Text style={{ color: theme.textSecondary, paddingVertical: 8 }}>Loading…</Text>
          ) : null}
          <FlatList
            data={news}
            keyExtractor={(it) => it.id}
            renderItem={renderNewsItem}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={
              !loading ? (
                <Text style={{ color: theme.textSecondary }}>No data available</Text>
              ) : null
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DiscoverScreen;

/* =================== Styles =================== */
const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },

  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  title: { fontSize: 32, fontWeight: 'bold' },
  subtitle: { fontSize: 16 },

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

  newsList: { paddingBottom: 20 },

  newsItem: {
    flexDirection: 'row',
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  imageWrap: { width: 120, height: 120, overflow: 'hidden' },
  newsImage: { width: '100%', height: '100%' },

  catPill: {
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
  catPillText: { fontSize: 12, fontWeight: '700', textTransform: 'lowercase' },

  newsContent: { flex: 1, padding: 12, justifyContent: 'space-between' },
  newsTitle: { fontSize: 16, fontWeight: 'bold', lineHeight: 22 },
  authorInfo: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  authorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  avatarText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  authorName: { fontSize: 14, marginRight: 5 },
  dateText: { fontSize: 14 },
});
