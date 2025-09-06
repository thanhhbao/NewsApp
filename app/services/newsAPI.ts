// services/theNews.ts
import { NewsDataType, SentimentStats } from '@/types';
import Constants from 'expo-constants';

// ---- LẤY TOKEN (ưu tiên ENV công khai, fallback qua extra) ----
const TOKEN =
  process.env.EXPO_PUBLIC_THENEWSAPI_TOKEN ??
  (Constants.expoConfig?.extra as any)?.THE_NEWS_API_TOKEN ??
  '';

const BASE = 'https://api.thenewsapi.com/v1';

type Article = {
  uuid: string;
  title: string;
  description?: string | null;
  keywords?: string | null;
  snippet?: string | null;
  url: string;
  image_url?: string | null;
  language?: string | null;
  published_at: string;
  source: string;
  categories?: string[];
  locale?: string | null;
};

type ListResponse =
  | { data: Article[]; meta?: any }
  | { data: Record<string, Article[]> };

export type NewsCategory =
  | 'general' | 'sports' | 'business' | 'tech'
  | 'politics' | 'entertainment' | 'travel'
  | 'food' | 'science' | 'world' | 'health';

// ---- helper bắt lỗi rõ ràng ----
async function getJSON(url: URL) {
  if (!TOKEN) {
    throw new Error('[TheNewsAPI] Thiếu token. Kiểm tra EXPO_PUBLIC_THENEWSAPI_TOKEN hoặc Constants.extra.');
  }
  url.searchParams.set('api_token', TOKEN);

  const res = await fetch(url.toString());
  const text = await res.text();
  if (!res.ok) {
    // TheNewsAPI thường trả JSON {error: "..."} – log thẳng nội dung để dễ debug
    throw new Error(`[TheNewsAPI] HTTP ${res.status} – ${text}`);
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new Error('[TheNewsAPI] Parse JSON thất bại: ' + text);
  }
}

// ---- /news/top ----
export async function fetchTop(params: {
  language?: 'en' | 'vi' | 'ja' | 'de' | 'fr' | 'es';
  locale?: string;
  categories?: NewsCategory[];
  limit?: number;
  page?: number;
}) {
  const { language = 'en', locale, categories, limit, page } = params;
  const url = new URL(`${BASE}/news/top`);
  url.searchParams.set('language', language);
  if (locale) url.searchParams.set('locale', locale);
  if (categories?.length) url.searchParams.set('categories', categories.join(','));
  if (limit) url.searchParams.set('limit', String(limit));
  if (page) url.searchParams.set('page', String(page));

  const json = (await getJSON(url)) as ListResponse;

  // hợp nhất 2 dạng shape trả về
  const arr = Array.isArray((json as any).data)
    ? ((json as any).data as Article[])
    : Object.values((json as any).data ?? {}).flat() as Article[];

  const items = arr.map(mapToNewsDataType);
  return { items };
}

// ---- /news/headlines ----
export async function fetchHeadlines(params: {
  language?: string;
  locale?: string;
  headlinesPerCategory?: number; // 1..10
}) {
  const { language = 'en', locale, headlinesPerCategory } = params;
  const url = new URL(`${BASE}/news/headlines`);
  url.searchParams.set('language', language);
  if (locale) url.searchParams.set('locale', locale);
  if (headlinesPerCategory) url.searchParams.set('headlines_per_category', String(headlinesPerCategory));

  const json = (await getJSON(url)) as { data: Record<string, Article[]> };
  const flat = Object.values(json.data || {}).flat();
  return { items: flat.map(mapToNewsDataType) };
}

function mapToNewsDataType(a: Article): NewsDataType {
  const sentiment_stats: SentimentStats = { positive: 0, neutral: 1, negative: 0 };
  const origin = safeOrigin(a.url);
  return {
    article_id: a.uuid,
    title: a.title,
    link: a.url,
    keywords: (a.keywords ? a.keywords.split(',').map(s => s.trim()).filter(Boolean) : []),
    creator: null,
    video_url: null,
    description: a.description ?? a.snippet ?? '',
    content: '',
    pubDate: a.published_at,
    image_url: a.image_url ?? '',
    source_id: '',
    source_priority: 0,
    source_name: origin.replace(/^https?:\/\//, ''),
    source_url: origin,
    source_icon: '',
    language: a.language || 'en',
    country: a.locale ? [a.locale] : [],
    category: a.categories ?? [],
    ai_tag: [],
    ai_region: [],
    ai_org: null,
    sentiment: 'neutral',
    sentiment_stats,
    duplicate: false,
  };
}

function safeOrigin(u: string) {
  try { return new URL(u).origin; } catch { return ''; }
}
