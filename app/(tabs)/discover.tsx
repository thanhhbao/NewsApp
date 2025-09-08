import React, { useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  ActivityIndicator,
  ColorValue
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Ionicons } from '@expo/vector-icons';

import { fetchHeadlines, fetchTop } from '@/services/newsAPI';
import { NewsDataType } from '@/types';

// ---------- screen width ----------
const { width } = Dimensions.get('window');

// ---------------- Helpers ----------------
const STOPWORDS = new Set([
  'the','and','with','from','this','that','have','will','your','ours','news','breaking',
  'latest','for','into','over','after','about','amid','more','than','near','new'
]);


function faviconFrom(url?: string) {
  try {
    if (!url) return 'https://www.google.com/s2/favicons?domain=example.com&sz=64';
    const { hostname } = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
  } catch {
    return 'https://www.google.com/s2/favicons?domain=example.com&sz=64';
  }
}

function dedupeById(arr: NewsDataType[]) {
  const seen = new Set<string>();
  return arr.filter(it => {
    const id = it.article_id || it.link || '';
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

function topN<T extends string>(arr: T[], n: number) {
  const map = new Map<T, number>();
  for (const k of arr) map.set(k, (map.get(k) || 0) + 1);
  return [...map.entries()].sort((a,b) => b[1]-a[1]).slice(0, n).map(([k]) => k);
}

function timeAgo(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso).getTime();
  const diff = Math.max(0, Date.now() - d);
  const h = Math.floor(diff / 36e5);
  if (h < 1) return 'just now';
  if (h < 24) return `${h}h ago`;
  const dday = Math.floor(h / 24);
  return `${dday}d ago`;
}

const CAT_EMOJI: Record<string, string> = {
  technology: '💻',
  tech: '💻',
  business: '💼',
  health: '🏥',
  sports: '⚽',
  entertainment: '🎬',
  science: '🔬',
  world: '🌍',
  general: '📰',
};

// ---- layout constants (ONE place only) ----
// Kích thước lưới
const SIDE = 16;
const GAP = 12;
const COLS = 2;
const CARD_W = Math.floor((width - SIDE * 2 - GAP * (COLS - 1)) / COLS);
const CARD_H = 130;

// Gradient theo danh mục (có thể chỉnh màu cho hợp brand)
type Gradient = readonly [ColorValue, ColorValue, ...ColorValue[]];

const CATEGORY_CONFIG: Record<
  string,
  { colors: Gradient; icon: keyof typeof Ionicons.glyphMap; emoji?: string }
> = {
  general:       { colors: ['#E9F1FF', '#DDE7FF', '#D7E2FF'] as const, icon: 'newspaper-outline' },
  business:      { colors: ['#FFE9D6', '#FFDCC2', '#FFD2B1'] as const, icon: 'briefcase-outline' },
  sports:        { colors: ['#DAF7E9', '#CFF2E1', '#C4EDD9'] as const, icon: 'trophy-outline' },
  entertainment: { colors: ['#F3E8FF', '#EAD9FF', '#E3CDFF'] as const, icon: 'film-outline' },
  tech:          { colors: ['#E6EEFF', '#DCE8FF', '#D4E1FF'] as const, icon: 'laptop-outline' },
  science:       { colors: ['#EAF1FF', '#E1EBFF', '#D9E5FF'] as const, icon: 'flask-outline' },
  health:        { colors: ['#E7FFF5', '#D9FBEF', '#CCF6E9'] as const, icon: 'medkit-outline' },
  politics:      { colors: ['#EEF0F6', '#E5E7EE', '#DDE0E8'] as const, icon: 'podium-outline' },
};

function normalizeKey(name: string) {
  const k = name.toLowerCase();
  if (k.includes('entertain')) return 'entertainment';
  if (k.includes('sport')) return 'sports';
  return k;
}

type CategoryTileProps = {
  title: string;
  subtitle: string;    // ví dụ: "4 bài"
  onPress: () => void;
};

function CategoryTile({ title, subtitle, onPress }: CategoryTileProps) {
  const key = normalizeKey(title);
  const cfg = CATEGORY_CONFIG[key] ?? CATEGORY_CONFIG.general;

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={{ width: CARD_W }}>
      <LinearGradient
        colors={cfg.colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.tile}
      >
        {/* highlight mờ ở góc trên */}
        <View style={styles.tileHighlight} />

        {/* nội dung trái */}
        <View style={styles.tileLeft}>
          <View style={styles.tileIconWrap}>
            <Ionicons name={cfg.icon} size={22} color="#4B5563" />
          </View>
          <View style={{ flex: 1 }}>
            <Text numberOfLines={1} style={styles.tileTitle}>{title}</Text>
            <Text style={styles.tileSub}>{subtitle}</Text>
          </View>
        </View>

        {/* nút mũi tên */}
        <View style={styles.arrowChip}>
          <Ionicons name="arrow-forward" size={16} color="#111827" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}



// ---------------- Screen ----------------
type SourceUI = {
  id: string;
  name: string;
  logo: string;
  category?: string;
  count: number;
};

const Page = () => {
  const { top: safeTop } = useSafeAreaInsets();

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<NewsDataType[]>([]);
  const [followedSources, setFollowedSources] = useState<string[]>([]);

  useEffect(() => {
  (async () => {
    setLoading(true);
    try {
      const [head, top1, top2] = await Promise.all([
        fetchHeadlines({ language: 'en', headlinesPerCategory: 3 }),
        fetchTop({ language: 'en', limit: 3, page: 1 }),
        fetchTop({ language: 'en', limit: 3, page: 2 }),
      ]);

      const merged = dedupeById([
        ...head.items,
        ...top1.items,
        ...top2.items,
      ]);
      setItems(merged);   // ✅ chỉ set 1 lần
    } catch (e) {
      console.warn('Discover fetch error:', e);
    } finally {
      setLoading(false);
    }
  })();
}, []);


  // ---------- Derived UI data ----------
  const TRENDING_TOPICS = useMemo(() => {
    const kws: string[] = items.flatMap(a => a.keywords || []);
    if (kws.length < 8) {
      items.forEach(a => {
        a.title.split(/\s+/).forEach(w => {
          const t = w.replace(/[^\p{L}\p{N}-]/gu, '').toLowerCase();
          if (t.length > 3 && !STOPWORDS.has(t)) kws.push(t);
        });
      });
    }
    return topN(kws, 12).map(s => s[0].toUpperCase() + s.slice(1));
  }, [items]);

  const HOT_CATEGORIES = useMemo(() => {
    const cnt = new Map<string, number>();
    for (const a of items) {
      const cats = a.category || ['general'];
      for (const c of cats) {
        const k = String(c).toLowerCase();
        cnt.set(k, (cnt.get(k) || 0) + 1);
      }
    }
    return [...cnt.entries()]
      .sort((a,b) => b[1]-a[1])
      .slice(0, 6)
      .map(([name, num], i) => ({
        id: `${name}:${i}`,
        name: name[0].toUpperCase() + name.slice(1),
        count: `${num} bài`,
        icon: CAT_EMOJI[name] || '📰',
      }));
  }, [items]);

  const TRENDING_ARTICLES = useMemo(() => {
    const sorted = [...items].sort(
      (a,b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
    );
    return sorted.slice(0, 8).map(a => ({
      id: a.article_id || a.link,
      title: a.title,
      source: a.source_name,
      time: timeAgo(a.pubDate),
      trend: 'TRENDING',
      image: a.image_url || 'https://via.placeholder.com/80x60/E2E8F0/64748B?text=News',
    }));
  }, [items]);

  const POPULAR_SOURCES: SourceUI[] = useMemo(() => {
    const map = new Map<string, SourceUI>();
    for (const a of items) {
      const id = a.source_url || a.source_name || a.link;
      if (!id) continue;
      const cur = map.get(id) || {
        id,
        name: a.source_name || 'Unknown',
        logo: faviconFrom(a.source_url),
        category: (a.category && a.category[0]) || 'News',
        count: 0,
      };
      cur.count += 1;
      map.set(id, cur);
    }
    return [...map.values()].sort((a,b) => b.count - a.count).slice(0, 6);
  }, [items]);

  const toggleFollow = (sourceId: string) => {
    setFollowedSources(prev =>
      prev.includes(sourceId) ? prev.filter(id => id !== sourceId) : [...prev, sourceId]
    );
  };

  // ---------- UI ----------
  return (
    <View style={[styles.container, { paddingTop: safeTop }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton}>
          <View style={styles.menuLine} />
          <View style={styles.menuLine} />
          <View style={styles.menuLine} />
        </TouchableOpacity>

        <View style={styles.weatherContainer}>
          <Text style={styles.weatherIcon}>☀️</Text>
          <Text style={styles.weatherText}>25°C</Text>
          <Text style={styles.weatherArrow}>▼</Text>
        </View>

        <TouchableOpacity style={styles.notificationButton}>
          <Text style={styles.notificationIcon}>🔔</Text>
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <Text style={styles.searchPlaceholder}>Khám phá chủ đề, nguồn tin...</Text>
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterIcon}>☰</Text>
          </TouchableOpacity>
        </View>

        {/* Trending Topics */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Xu hướng</Text>
            {loading ? <ActivityIndicator size="small" /> : null}
          </View>

          <View style={styles.trendingContainer}>
            <FlatList
              data={TRENDING_TOPICS}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.trendingChip}>
                  <Text style={styles.trendingChipText}>#{item}</Text>
                </TouchableOpacity>
              )}
              horizontal
              keyExtractor={(item, idx) => `${item}:${idx}`}
              showsHorizontalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
              contentContainerStyle={styles.trendingList}
              ListEmptyComponent={
                <Text style={styles.loadingText}>{loading ? 'Đang tải...' : 'Không có dữ liệu'}</Text>
              }
            />
          </View>
        </View>

        {/* Hot Categories (grid 2 cột) */}
       
  <View style={styles.section}>
  <View style={styles.sectionRow}>
    <Text style={styles.sectionTitle}>Danh mục nổi bật</Text>
  </View>

  <FlatList
    data={HOT_CATEGORIES}                           // [{id,name,count}, ...] từ useMemo cũ của bạn
    keyExtractor={(it) => String(it.id)}
    numColumns={COLS}
    columnWrapperStyle={{ paddingHorizontal: SIDE, gap: GAP }}
    contentContainerStyle={{ rowGap: GAP }}
    scrollEnabled={false}
    renderItem={({ item }) => (
      <CategoryTile
        title={item.name}
        subtitle={item.count}
        onPress={() => console.log('open category:', item.name)}
      />
    )}
  />
</View>



        {/* Trending Articles */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Đang thịnh hành</Text>
          </View>

          {TRENDING_ARTICLES.length === 0 && (
            <Text style={styles.loadingText}>{loading ? 'Đang tải...' : '—'}</Text>
          )}

          {TRENDING_ARTICLES.map((article, idx) => (
            <TouchableOpacity key={`${article.id}:${idx}`} style={styles.articleCard}>
              <Image source={{ uri: article.image }} style={styles.articleImage} />
              <View style={styles.articleContent}>
                <View style={styles.articleHeader}>
                  <View style={[styles.trendBadge, { backgroundColor: '#F59E0B' }]}>
                    <Text style={styles.trendBadgeText}>{article.trend}</Text>
                  </View>
                  <Text style={styles.readersCount}>{article.time}</Text>
                </View>
                <Text style={styles.articleTitle} numberOfLines={2}>
                  {article.title}
                </Text>
                <View style={styles.articleMeta}>
                  <Text style={styles.articleSource}>{article.source}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Popular Sources */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Nguồn tin phổ biến</Text>
          </View>

          {POPULAR_SOURCES.length === 0 && (
            <Text style={styles.loadingText}>{loading ? 'Đang tải...' : '—'}</Text>
          )}

          {POPULAR_SOURCES.map((source, idx) => (
            <View key={`${source.id}:${idx}`} style={styles.sourceCard}>
              <Image source={{ uri: source.logo }} style={styles.sourceLogo} />
              <View style={styles.sourceInfo}>
                <View style={styles.sourceHeader}>
                  <Text style={styles.sourceName}>{source.name}</Text>
                </View>
                <Text style={styles.sourceCategory}>{source.category}</Text>
                <Text style={styles.sourceSubscribers}>{source.count} bài gần đây</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.followBtn,
                  followedSources.includes(source.id) && styles.followingBtn
                ]}
                onPress={() => toggleFollow(source.id)}
              >
                <Text
                  style={[
                    styles.followBtnText,
                    followedSources.includes(source.id) && styles.followingBtnText
                  ]}
                >
                  {followedSources.includes(source.id) ? 'Đang theo dõi' : 'Theo dõi'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

export default Page;

// ---------------- Styles ----------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#F3F4F6',
  },
  menuButton: { padding: 8 },
  menuLine: { width: 20, height: 2, backgroundColor: '#374151', marginVertical: 2 },
  weatherContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#E5E7EB',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
  },
  weatherIcon: { fontSize: 16, marginRight: 4 },
  weatherText: { fontSize: 14, fontWeight: '500', color: '#374151', marginRight: 4 },
  weatherArrow: { fontSize: 10, color: '#6B7280' },
  notificationButton: { position: 'relative', padding: 8 },
  notificationIcon: { fontSize: 20 },
  notificationBadge: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, backgroundColor: '#EF4444', borderRadius: 4 },

  content: { flex: 1, paddingHorizontal: 16 },

  searchContainer: { flexDirection: 'row', marginVertical: 16, gap: 12 },
  searchInputContainer: {
    flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
    paddingHorizontal: 16, paddingVertical: 12, borderRadius: 25, borderWidth: 1, borderColor: '#E5E7EB',
  },
  searchIcon: { fontSize: 16, marginRight: 8, color: '#9CA3AF' },
  searchPlaceholder: { fontSize: 16, color: '#9CA3AF' },
  filterButton: {
    backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 12,
    borderRadius: 25, borderWidth: 1, borderColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center',
  },
  filterIcon: { fontSize: 16, color: '#6B7280' },

  section: { marginBottom: 24 },
  sectionRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  loadingText: { fontSize: 14, color: '#6B7280' },

  trendingContainer: { marginTop: 8 },
  trendingList: { paddingRight: 16 },
  trendingChip: {
    backgroundColor: '#FFFFFF', paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 18, borderWidth: 1, borderColor: '#E5E7EB',
    shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 1,
  },
  trendingChipText: { fontSize: 14, color: '#374151', fontWeight: '500' },

  // ---- Hot categories (glass cards) ----
  tile: {
    height: CARD_H,
    borderRadius: 20,
    padding: 14,
    overflow: 'hidden',
    justifyContent: 'space-between',
    // shadow
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  tileHighlight: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.35)',
    opacity: 0.6,
  },
  tileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tileIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  tileSub: {
    marginTop: 2,
    fontSize: 13,
    color: '#4B5563',
  },
  arrowChip: {
    alignSelf: 'flex-end',
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },



  // ---- Articles ----
  articleCard: {
    flexDirection: 'row', backgroundColor: '#FFFFFF',
    padding: 12, borderRadius: 10, marginBottom: 10, alignItems: 'flex-start',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 2,
  },
  articleImage: { width: 84, height: 64, borderRadius: 8, marginRight: 12, backgroundColor: '#F3F4F6' },
  articleContent: { flex: 1 },
  articleHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  trendBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, backgroundColor: '#F59E0B' },
  trendBadgeText: { fontSize: 10, fontWeight: '700', color: '#FFFFFF' },
  readersCount: { fontSize: 12, color: '#6B7280' },
  articleTitle: { fontSize: 15, fontWeight: '600', color: '#111827', lineHeight: 20, marginBottom: 6 },
  articleMeta: { flexDirection: 'row', alignItems: 'center' },
  articleSource: { fontSize: 12, color: '#6B7280', marginRight: 8 },

  // ---- Sources ----
  sourceCard: {
    flexDirection: 'row', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 10, marginBottom: 10, alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 2,
  },
  sourceLogo: { width: 40, height: 40, borderRadius: 20, marginRight: 12, backgroundColor: '#F3F4F6' },
  sourceInfo: { flex: 1 },
  sourceHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  sourceName: { fontSize: 16, fontWeight: '600', color: '#111827', marginRight: 4 },
  sourceCategory: { fontSize: 13, color: '#6B7280', marginBottom: 2 },
  sourceSubscribers: { fontSize: 12, color: '#9CA3AF' },
  followBtn: { backgroundColor: '#EF4444', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 16 },
  followingBtn: { backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#D1D5DB' },
  followBtnText: { fontSize: 12, fontWeight: '600', color: '#FFFFFF' },
  followingBtnText: { color: '#6B7280' },

  bottomSpacing: { height: 24 },
});
