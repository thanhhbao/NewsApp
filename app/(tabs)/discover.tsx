// app/(tabs)/discover.tsx
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Dimensions,
  FlatList,
  Pressable,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/providers/ThemeProvider';

const { width } = Dimensions.get('window');

/* ========== Types ========== */
type SegKey = 'people' | 'company' | 'days';
type BubbleSize = 'large' | 'medium' | 'small';

type TrendingItem = {
  id: string;
  name: string;
  views: string;     // e.g. "12.4k views"
  image: string;
  size: BubbleSize;
};

type CategoryCard = {
  id: string;
  title: string;
  color: string;
  backgroundColor: string;
  icon: keyof typeof Ionicons.glyphMap;
};

/* ========== Mock (thay bằng dữ liệu thật nếu có) ========== */
const SEGMENTS: { key: SegKey; label: string }[] = [
  { key: 'people', label: 'People' },
  { key: 'company', label: 'Company' },
  { key: 'days', label: 'Days' },
];

const TRENDING_PEOPLE: TrendingItem[] = [
  {
    id: 'biden',
    name: 'Joe Biden',
    views: '12.4k views',
    image:
      'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=800&q=80',
    size: 'large',
  },
  {
    id: 'trump',
    name: 'D trump',
    views: '10.4k views',
    image:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80',
    size: 'medium',
  },
  {
    id: 'demi',
    name: 'Demi lovato',
    views: '8.4k views',
    image:
      'https://images.unsplash.com/photo-1494790108755-2616b612b789?w=800&q=80',
    size: 'medium',
  },
  {
    id: 'billie',
    name: 'Billie Eilish',
    views: '6.4k views',
    image:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
    size: 'medium',
  },
  {
    id: 'elliot',
    name: 'Elliot Page',
    views: '3.4k views',
    image:
      'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=800&q=80',
    size: 'small',
  },
  {
    id: 'dua',
    name: 'Dua Lipa',
    views: '5.4k views',
    image:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&q=80',
    size: 'small',
  },
];

const CATEGORY_CARDS: CategoryCard[] = [
  { id: 'business', title: 'Business', color: '#FB923C', backgroundColor: '#FFF4E6', icon: 'briefcase' },
  { id: 'tech',     title: 'Tech',     color: '#22D3EE', backgroundColor: '#E0F2FE', icon: 'laptop' },
  { id: 'sports',   title: 'Sports',   color: '#22C55E', backgroundColor: '#DCFCE7', icon: 'basketball' },
  { id: 'ent',      title: 'Entertainment', color: '#A78BFA', backgroundColor: '#F3E8FF', icon: 'film' },
];

/* ========== Helpers ========== */
const sizePx = (s: BubbleSize) =>
  s === 'large' ? 140 : s === 'medium' ? 96 : 72;

/* ========== Components ========== */
function Segment({
  value,
  onChange,
}: {
  value: SegKey;
  onChange: (k: SegKey) => void;
}) {
  const { theme } = useAppTheme();
  return (
    <View
      style={[
        styles.segmentWrap,
        { backgroundColor: theme.card, borderColor: theme.hairline },
      ]}
    >
      {SEGMENTS.map((s) => {
        const active = s.key === value;
        return (
          <TouchableOpacity
            key={s.key}
            onPress={() => onChange(s.key)}
            activeOpacity={0.9}
            style={[
              styles.segmentItem,
              active && {
                backgroundColor: theme.text,
                shadowColor: '#000',
                shadowOpacity: 0.12,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 3 },
                elevation: 3,
              },
            ]}
          >
            <Text
              style={[
                styles.segmentLabel,
                { color: active ? theme.bg : theme.textSecondary },
              ]}
            >
              {s.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function TrendingBubble({ item }: { item: TrendingItem }) {
  const r = sizePx(item.size) / 2;
  return (
    <View
      style={[
        styles.bubble,
        {
          width: r * 2,
          height: r * 2,
          borderRadius: r,
        },
      ]}
    >
      <Image
        source={{ uri: item.image }}
        style={{ width: '100%', height: '100%', borderRadius: r }}
      />
      <View style={styles.bubbleOverlay}>
        <Text
          numberOfLines={1}
          style={[styles.bubbleTitle, item.size === 'large' && { fontSize: 18 }]}
        >
          {item.name}
        </Text>
        <Text
          style={[
            styles.bubbleViews,
            item.size === 'large' && { fontSize: 12 },
          ]}
        >
          {item.views}
        </Text>
      </View>
    </View>
  );
}

function CategoryItem({
  card,
  onPress,
}: {
  card: CategoryCard;
  onPress: () => void;
}) {
  const { theme } = useAppTheme();
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[
        styles.catCard,
        {
          backgroundColor: card.backgroundColor,
          width: (width - 52) / 2,
        },
      ]}
    >
      <View
        style={[
          styles.catIconWrap,
          {
            backgroundColor: card.color,
          },
        ]}
      >
        <Ionicons name={card.icon} size={40} color="#fff" />
      </View>
      <Text style={[styles.catTitle, { color: theme.text }]}>{card.title}</Text>
    </TouchableOpacity>
  );
}

/* ========== Screen ========== */
export default function DiscoverScreen() {
  const { theme } = useAppTheme();
  const [tab, setTab] = useState<SegKey>('people');

  // Nếu sau này có data theo từng tab, map theo tab ở đây
  const trending = useMemo(() => TRENDING_PEOPLE, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 28 }}
      >
        {/* Segmented */}
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
        <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
          <Segment value={tab} onChange={setTab} />
        </View>

        {/* Trending */}
        <Text
          style={[
            styles.sectionTitle,
            { color: theme.text, marginTop: 16, marginBottom: 12 },
          ]}
        >
          Trending topic
        </Text>

        {/* Bố cục giống ảnh: 3 bubble trên, 1 lớn giữa, 2 nhỏ dưới */}
        <View style={styles.trendingWrap}>
          <View style={[styles.trRow, { justifyContent: 'space-between' }]}>
            <TrendingBubble item={trending[1]} />
            <TrendingBubble item={trending[2]} />
            <TrendingBubble item={trending[3]} />
          </View>

          <View style={[styles.trRow, { justifyContent: 'center', marginTop: 12 }]}>
            <TrendingBubble item={trending[0]} />
          </View>

          <View style={[styles.trRow, { justifyContent: 'space-between', marginTop: 12 }]}>
            <TrendingBubble item={trending[4]} />
            <TrendingBubble item={trending[5]} />
          </View>
        </View>

        {/* Explore by category */}
        <Text
          style={[
            styles.sectionTitle,
            { color: theme.text, marginTop: 8, marginBottom: 16 },
          ]}
        >
          Explore by category
        </Text>

        <FlatList
          data={CATEGORY_CARDS}
          keyExtractor={(it) => it.id}
          numColumns={2}
          scrollEnabled={false}
          columnWrapperStyle={{ paddingHorizontal: 20, justifyContent: 'space-between' }}
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
          renderItem={({ item }) => (
            <CategoryItem card={item} onPress={() => { /* navigate/filter here */ }} />
          )}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ========== Styles ========== */
const styles = StyleSheet.create({
  container: { flex: 1 },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    paddingHorizontal: 20,
  },

  /* segmented */
  segmentWrap: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 4,
    borderWidth: StyleSheet.hairlineWidth,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  segmentLabel: {
    fontSize: 14,
    fontWeight: '700',
  },

  /* trending */
  trendingWrap: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  trRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  bubble: {
    overflow: 'hidden',
    borderRadius: 999,
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  bubbleOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    paddingBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  bubbleTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
  bubbleViews: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 2,
  },

  /* category */
  catCard: {
    height: 160,
    borderRadius: 18,
    padding: 18,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  catIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
   searchIcon: { marginRight: 12 },
  searchInput: { flex: 1, fontSize: 16, fontWeight: '500' },
   filterBtn: {
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    marginLeft: 8,
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
});
