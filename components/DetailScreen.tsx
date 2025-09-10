import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Animated,
  Dimensions,
  Alert,
  Share,
  SafeAreaView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/providers/ThemeProvider';

/* ---------- Types ---------- */
type Article = {
  id: number | string;
  title: string;
  author: string;
  authorAvatar: string;
  publishDate: string;
  readTime: string;
  category: string;
  likes: number;
  comments: number;
  shares: number;
  image: string;
  content: string;
};

/* ---------- Defaults & fallbacks ---------- */
const FALLBACK_IMG = 'https://via.placeholder.com/800x400/1F2937/FFFFFF?text=News';
const FALLBACK_AVATAR = 'https://via.placeholder.com/44x44/999/ffffff?text=U';

const DEFAULT_ARTICLE: Article = {
  id: 'na',
  title: 'NASA astronauts voice confidence that Boeing Starliner will bring them home',
  author: 'Joey Roulette',
  authorAvatar: FALLBACK_AVATAR,
  publishDate: 'Thu, July 11, 2024 at 4:43 AM',
  readTime: '4 min read',
  category: 'Science',
  likes: 0,
  comments: 0,
  shares: 0,
  image: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=400&fit=crop',
  content: `NASA astronauts voice confidence that Boeing Starliner will bring them home

Two NASA astronauts who flew to the International Space Station in June aboard Boeing's faulty Starliner capsule said Wednesday they felt confident that their spacecraft will bring them home safely, despite technical problems that have extended their stay in orbit.

Butch Wilmore and Suni Williams, speaking publicly on Wednesday from their temporary home aboard the space station, said they felt comfortable with Starliner and think the spacecraft will be able to return them to Earth as planned.

The astronauts' comments came during their first news conference since arriving at the space station on June 6 for what was supposed to be about a week-long test flight. Technical issues with Starliner's thrusters and helium leaks have kept them in orbit much longer than expected.

"I have a really good feeling in my heart that this spacecraft will bring us home, no problem," Williams said during the 45-minute briefing from roughly 250 miles above Earth.

Boeing's Starliner faced several challenges during its approach to the space station, including the failure of five of its 28 reaction control system thrusters and the discovery of five helium leaks in its propulsion system.

The problems have prompted NASA and Boeing engineers to conduct extensive testing and analysis on the ground to better understand what went wrong and ensure the spacecraft can safely return the crew to Earth.

Despite the setbacks, both astronauts expressed confidence in the ongoing work to resolve the issues and said they were comfortable with their extended stay aboard the orbiting laboratory.`,
};

const ArticleDetailScreen: React.FC = () => {
  const router = useRouter();
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isReadLater, setIsReadLater] = useState(false);

  // Get params and parse safely
  const params = useLocalSearchParams<{ article?: string }>();
  let incoming: Partial<Article> = {};
  try {
    if (params.article) incoming = JSON.parse(String(params.article));
  } catch {}

  // Merge params with defaults
  const article: Article = {
    ...DEFAULT_ARTICLE,
    ...incoming,
    image: incoming.image || DEFAULT_ARTICLE.image,
    authorAvatar: incoming.authorAvatar || DEFAULT_ARTICLE.authorAvatar,
  };

  /* ---------- Actions ---------- */
  const handleBookmark = () => setIsBookmarked(v => !v);
  const handleLike = () => setIsLiked(v => !v);
  const handleReadLater = () => setIsReadLater(v => !v);
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this article: ${article.title}`,
        url: `https://newsapp.com/articles/${article.id}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };
  const handleComment = () => Alert.alert('Comments', 'Comments feature coming soon!');

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }) + ' at ' + date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={theme.name === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={theme.bg} />
      
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.bg }]}>
          <TouchableOpacity 
            style={[styles.headerButton, { backgroundColor: theme.card }]} 
            onPress={router.back}
          >
            <Ionicons name="chevron-back" size={20} color={theme.text} />
          </TouchableOpacity>
          
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={[styles.headerButton, { backgroundColor: isBookmarked ? '#007AFF' : theme.card }]} 
              onPress={handleBookmark}
            >
              <Ionicons 
                name={isBookmarked ? "bookmark" : "bookmark-outline"} 
                size={20} 
                color={isBookmarked ? 'white' : theme.text} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.headerButton, { backgroundColor: theme.card }]} 
              onPress={handleShare}
            >
              <Ionicons name="ellipsis-horizontal" size={20} color={theme.text} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Source */}
          <View style={styles.sourceContainer}>
            <View style={styles.sourceIcon}>
              <Text style={styles.sourceIconText}>CNN</Text>
            </View>
            <Text style={[styles.sourceName, { color: theme.text }]}>CNN Indonesia</Text>
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: theme.text }]}>
            {article.title}
          </Text>

          {/* Author & Date */}
          <View style={styles.metaContainer}>
            <Text style={[styles.author, { color: theme.text }]}>{article.author}</Text>
            <Text style={[styles.publishDate, { color: theme.textSecondary }]}>
              {formatDate(article.publishDate)}
            </Text>
          </View>

          {/* Article Image */}
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: article.image }} 
              style={styles.articleImage}
              resizeMode="cover"
            />
          </View>

          {/* Stats Bar */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={16} color={theme.textSecondary} />
              <Text style={[styles.statText, { color: theme.textSecondary }]}>{article.readTime}</Text>
            </View>
            
            <View style={styles.statsDivider}>
              <View style={styles.statItem}>
                <Ionicons name="refresh-outline" size={16} color={theme.textSecondary} />
                <Text style={[styles.statText, { color: theme.textSecondary }]}>12h</Text>
              </View>
              
              <View style={styles.statItem}>
                <Ionicons name="share-outline" size={16} color={theme.textSecondary} />
                <Text style={[styles.statText, { color: theme.textSecondary }]}>12h</Text>
              </View>
            </View>
          </View>

          {/* Content */}
          <View style={styles.contentContainer}>
            <Text style={[styles.contentTitle, { color: theme.text }]}>
              NASA astronauts voice confidence that Boeing Starliner will bring them home
            </Text>
            
            {article.content.split('\n\n').map((paragraph: string, index: number) => (
              <Text key={index} style={[styles.contentParagraph, { color: theme.text }]}>
                {paragraph}
              </Text>
            ))}
          </View>

          {/* Read Later Button */}
          <TouchableOpacity 
            style={[
              styles.readLaterButton, 
              { 
                backgroundColor: isReadLater ? '#34D399' : theme.card,
                borderColor: isReadLater ? '#34D399' : theme.border
              }
            ]}
            onPress={handleReadLater}
          >
            <Ionicons 
              name={isReadLater ? "checkmark" : "bookmark-outline"} 
              size={20} 
              color={isReadLater ? 'white' : theme.text} 
            />
            <Text style={[
              styles.readLaterText, 
              { color: isReadLater ? 'white' : theme.text }
            ]}>
              {isReadLater ? 'Added to Read Later' : 'Added to Read Later'}
            </Text>
          </TouchableOpacity>

          {/* Engagement Actions */}
          <View style={[styles.engagementContainer, { borderTopColor: theme.border }]}>
            <TouchableOpacity style={styles.engagementButton} onPress={handleLike}>
              <Ionicons 
                name={isLiked ? "heart" : "heart-outline"} 
                size={24} 
                color={isLiked ? '#FF3B30' : theme.textSecondary} 
              />
              <Text style={[styles.engagementCount, { color: theme.textSecondary }]}>
                {article.likes + (isLiked ? 1 : 0)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.engagementButton} onPress={handleComment}>
              <Ionicons name="chatbubble-outline" size={24} color={theme.textSecondary} />
              <Text style={[styles.engagementCount, { color: theme.textSecondary }]}>
                {article.comments}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.engagementButton} onPress={handleShare}>
              <Ionicons name="share-outline" size={24} color={theme.textSecondary} />
              <Text style={[styles.engagementCount, { color: theme.textSecondary }]}>
                {article.shares}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default ArticleDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5E7',
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  sourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 12,
  },
  sourceIcon: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#DC143C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  sourceIconText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  sourceName: {
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  metaContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  author: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  publishDate: {
    fontSize: 14,
    lineHeight: 20,
  },
  imageContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  articleImage: {
    width: '100%',
    height: 240,
    borderRadius: 12,
    backgroundColor: '#F5F5F7',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statsDivider: {
    flexDirection: 'row',
    gap: 16,
  },
  statText: {
    fontSize: 14,
  },
  contentContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
    marginBottom: 16,
  },
  contentParagraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  readLaterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 24,
    gap: 8,
  },
  readLaterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  engagementContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
  },
  engagementButton: {
    alignItems: 'center',
    gap: 4,
  },
  engagementCount: {
    fontSize: 12,
    fontWeight: '500',
  },
});