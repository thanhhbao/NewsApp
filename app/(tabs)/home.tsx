import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  RefreshControl,
  Text,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  Image,
} from 'react-native';

import HeaderComponent from '@/components/Header';
import CategoryChips from '@/components/CategoryChips';
import ArticleCard from '@/components/ArticleCard';

import { NewsDataType } from '@/types';
import { useNewsTop } from '@/hooks/useNewsTop';
import { fetchHeadlines } from '@/services/newsAPI';

import { explain } from '@/utils/formatApiError';
import ErrorState from '@/components/ErrorState';
import { useAppTheme } from '@/providers/ThemeProvider';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const MAIN_CATEGORIES = [
  { key: 'all', label: 'For You' },
  { key: 'business', label: 'Business' },
  { key: 'sports', label: 'Sports' },
  { key: 'politics', label: 'Politics' },
];

export default function Page() {
  const { theme } = useAppTheme();
  const router = useRouter();

  const [breaking, setBreaking] = useState<NewsDataType[]>([]);
  const [breakingError, setBreakingError] = useState<unknown>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { items, loading, refreshing = loading as boolean, refresh } =
    useNewsTop(selectedCategory === 'all' ? undefined : selectedCategory);

  const loadBreaking = useCallback(async () => {
    try {
      setBreakingError(null);
      const { items } = await fetchHeadlines({
        language: 'en',
        headlinesPerCategory: 10,
      });
      setBreaking(items.slice(0, 10));
    } catch (e) {
      setBreaking([]);
      setBreakingError(e);
    }
  }, []);

  useEffect(() => {
    loadBreaking();
  }, [loadBreaking]);

  const featuredArticle = useMemo(() => breaking[0], [breaking]);
  const otherBreakingNews = useMemo(() => breaking.slice(1, 4), [breaking]);

  const usedKeys = useMemo(() => {
    const s = new Set<string>();
    breaking.forEach((b) => s.add(String(b.article_id || b.link)));
    return s;
  }, [breaking]);

  const feed = useMemo(
    () => items.filter((a) => !usedKeys.has(String(a.article_id || a.link))),
    [items, usedKeys]
  );

  const onRefresh = useCallback(async () => {
    await Promise.allSettled([refresh(), loadBreaking()]);
  }, [refresh, loadBreaking]);

  /* ---------- NAV HELPERS (đặt ở cấp component, KHÔNG lồng trong hàm khác) ---------- */
  const toDetailPayload = (a: NewsDataType) => {
    const author =
      (Array.isArray(a.creator) && a.creator[0]) || a.source_name || 'Unknown';
    const category = (a.category?.[0] || 'general').toLowerCase();
    const publishDateISO = a.pubDate || new Date().toISOString();
    const text =
      (a.content && a.content.trim()) || a.description || a.title || '';
    const words = text.split(/\s+/).filter(Boolean).length;
    const mins = Math.max(1, Math.round(words / 200));
    return {
      id: String(a.article_id || a.link),
      title: a.title,
      author,
      image: a.image_url || 'https://via.placeholder.com/800x450?text=News',
      category,
      publishDate: publishDateISO,
      readTime: `${mins} min read`,
      content: a.content || a.description || '',
    };
  };

  const openDetail = (a: NewsDataType) => {
    const payload = toDetailPayload(a);
    router.push({
      pathname: '/detail' as const,
      params: { article: JSON.stringify(payload) },
    });
  };

  /* ---------- RENDERERS ---------- */
  const renderCategoryTab = ({ item }: { item: typeof MAIN_CATEGORIES[0] }) => {
    const isSelected = selectedCategory === item.key;
    return (
      <TouchableOpacity
        style={[
          styles.categoryTab,
          isSelected && styles.categoryTabSelected,
          { backgroundColor: isSelected ? theme.text : 'transparent' },
        ]}
        onPress={() => setSelectedCategory(item.key)}
      >
        <Text
          style={[
            styles.categoryTabText,
            { color: isSelected ? theme.bg : theme.text },
          ]}
        >
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderFeaturedCard = () => {
    if (!featuredArticle || breakingError) return null;

    return (
      <TouchableOpacity
        style={styles.featuredCard}
        onPress={() => openDetail(featuredArticle)}
      >
        <ImageBackground
          source={{
            uri:
              featuredArticle.image_url ||
              'https://via.placeholder.com/400x250/f0f0f0/999999?text=No+Image',
          }}
          style={styles.featuredImageBg}
          imageStyle={styles.featuredImage}
        >
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>
              {(featuredArticle.category?.[0] || 'Tech').toUpperCase()}
            </Text>
          </View>

          <View style={styles.featuredOverlay}>
            <Text style={styles.featuredTitle} numberOfLines={3}>
              {featuredArticle.title}
            </Text>

            <View style={styles.featuredMeta}>
              <View style={styles.authorContainer}>
                <View style={styles.authorAvatar} />
                <Text style={styles.authorName}>
                  {featuredArticle.source_id || 'Unknown'}
                </Text>
                <Text style={styles.publishDate}>
                  •{' '}
                  {new Date(featuredArticle.pubDate).toLocaleDateString(
                    'en-US',
                    {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    }
                  )}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.paginationDots}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  const renderBreakingNewsItem = ({
    item,
  }: {
    item: NewsDataType;
    index: number;
  }) => (
    <TouchableOpacity
      style={styles.breakingNewsItem}
      onPress={() => openDetail(item)}
    >
      <Image
        source={{
          uri:
            item.image_url ||
            'https://via.placeholder.com/80x80/f0f0f0/999999?text=No+Image',
        }}
        style={styles.breakingNewsImage}
      />
      <View style={styles.breakingNewsContent}>
        <Text
          style={[styles.breakingNewsTitle, { color: theme.text }]}
          numberOfLines={2}
        >
          {item.title}
        </Text>
        <Text
          style={[styles.breakingNewsSource, { color: theme.textSecondary }]}
        >
          {item.source_id} •{' '}
          {new Date(item.pubDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}
        </Text>
      </View>
    </TouchableOpacity>
  );

  /* ---------- UI ---------- */
  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View style={[styles.header]}>
          <HeaderComponent />
        </View>

        <View style={styles.categoryContainer}>
          <FlatList
            data={MAIN_CATEGORIES}
            renderItem={renderCategoryTab}
            keyExtractor={(item) => item.key}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
          />
        </View>

        {/* Featured */}
        {renderFeaturedCard()}

        {/* Breaking News */}
        <View className="breakingNewsSection" style={styles.breakingNewsSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Breaking News
            </Text>
            <TouchableOpacity>
              <Text style={[styles.seeAllText, { color: theme.textSecondary }]}>
                See All
              </Text>
            </TouchableOpacity>
          </View>

          {breakingError ? (
            <ErrorState
              title={explain(breakingError).title}
              message={explain(breakingError).message}
              onRetry={loadBreaking}
            />
          ) : (
            <FlatList
              data={otherBreakingNews}
              renderItem={renderBreakingNewsItem}
              keyExtractor={(item, index) =>
                `breaking-${item.article_id || item.link || index}`
              }
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
            />
          )}
        </View>

        {/* Recommendation */}
        <View style={styles.recommendationSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Recommendation
          </Text>

          {feed.map((item, index) => (
            <View key={`${item.article_id || item.link || 'noid'}:${index}`}>
              <ArticleCard item={item} onPress={() => openDetail(item)} />
              {index < feed.length - 1 && <View style={{ height: 10 }} />}
            </View>
          ))}

          {!loading && feed.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={{ color: theme.textSecondary }}>
                Nothing to display
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

/* ---------------- styles (giữ nguyên từ bản của bạn) ---------------- */
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 0, paddingTop: 0, paddingBottom: 0 },

  categoryContainer: { paddingVertical: 12 },
  categoryList: { paddingHorizontal: 16, columnGap: 10 },

  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  categoryTabSelected: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 3,
  },
  categoryTabText: { fontSize: 14, fontWeight: '700' },

  featuredCard: { marginHorizontal: 16, borderRadius: 16, overflow: 'hidden' },
  featuredImageBg: { width: '100%', height: 220, justifyContent: 'flex-end' },
  featuredImage: { borderRadius: 16 },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  categoryBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  featuredOverlay: {
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  featuredTitle: { color: '#fff', fontSize: 20, fontWeight: '800', lineHeight: 26 },
  featuredMeta: { marginTop: 10, flexDirection: 'row', alignItems: 'center' },
  authorContainer: { flexDirection: 'row', alignItems: 'center' },
  authorAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    marginRight: 8,
  },
  authorName: { color: '#fff', fontWeight: '700' },
  publishDate: { color: '#E5E7EB' },

  paginationDots: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    flexDirection: 'row',
    columnGap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: { backgroundColor: '#fff' },

  breakingNewsSection: { paddingHorizontal: 16, paddingTop: 18 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 20, fontWeight: '800' },
  seeAllText: { fontSize: 14, fontWeight: '700' },

  breakingNewsItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
  },
  breakingNewsImage: { width: 80, height: 80, borderRadius: 8, backgroundColor: '#ddd' },
  breakingNewsContent: { flex: 1, marginLeft: 10, justifyContent: 'center' },
  breakingNewsTitle: { fontSize: 14, fontWeight: '700' },
  breakingNewsSource: { fontSize: 12, marginTop: 6 },

  recommendationSection: { paddingHorizontal: 16, paddingTop: 18 },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
});
