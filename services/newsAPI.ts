// services/newsAPI.ts
import Constants from 'expo-constants';
import { NewsDataType, SentimentStats } from '@/types';
import { getJsonCached } from '@/utils/apiClients';

const BASE = 'https://api.thenewsapi.com/v1';
const TOKEN =
  process.env.EXPO_PUBLIC_THENEWSAPI_TOKEN ??
  (Constants.expoConfig?.extra as any)?.THE_NEWS_API_TOKEN ??
  '';

export type NewsCategory =
  | 'general' | 'sports' | 'business' | 'tech'
  | 'politics' | 'entertainment' | 'travel'
  | 'food' | 'science' | 'world' | 'health';

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

type ListResponse = { data: Article[]; meta?: any };

// ---------- helpers ----------
async function getJSON(url: URL, opts?: { force?: boolean; ttlMs?: number }) {
  const TOKEN =
    process.env.EXPO_PUBLIC_THENEWSAPI_TOKEN ??
    (Constants.expoConfig?.extra as any)?.THE_NEWS_API_TOKEN ??
    '';

  if (!TOKEN) {
    throw new Error('[TheNewsAPI] Thiếu token. Kiểm tra EXPO_PUBLIC_THENEWSAPI_TOKEN hoặc Constants.extra.');
  }

  url.searchParams.set('api_token', TOKEN);

  // 👇 gọi API qua lớp cache (mặc định TTL = 1 giờ)
  return getJsonCached(url.toString(), undefined, {
    ttlMs: opts?.ttlMs ?? 60 * 60 * 1000,  // 1 giờ
    force: opts?.force ?? false,           // true = bỏ qua cache (pull-to-refresh)
  });
}

function safeOrigin(u: string) {
  try { return new URL(u).origin; } catch { return ''; }
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
    content: '', // /news/all không trả full-text
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

function dedupeById(list: NewsDataType[]) {
  const seen = new Set<string>();
  return list.filter(it => {
    const id = it.article_id || it.link || '';
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

// Free plan chỉ cho limit tối đa 3 mỗi request
function capLimitForFreePlan(requested?: number) {
  const n = requested ?? 3;
  return Math.max(1, Math.min(n, 3));
}

// ---------- API dùng được với Free plan ----------

// Thay /news/top bằng /news/all
export async function fetchTop(params: {
  language?: 'en' | 'vi' | 'ja' | 'de' | 'fr' | 'es';
  locale?: string;
  categories?: NewsCategory[];
  limit?: number; // Free: ≤ 3
  page?: number;
  search?: string;
}) {
  const { language = 'en', locale, categories, limit, page = 1, search } = params;

  const url = new URL(`${BASE}/news/all`);
  if (language) url.searchParams.set('language', language);
  if (locale) url.searchParams.set('locale', locale);
  if (categories?.length) url.searchParams.set('categories', categories.join(','));
  if (search) url.searchParams.set('search', search);
  url.searchParams.set('limit', String(capLimitForFreePlan(limit)));
  url.searchParams.set('page', String(page));

  const json = (await getJSON(url)) as ListResponse;
  const arr = Array.isArray(json?.data) ? json.data : [];
  const items = dedupeById(arr.map(mapToNewsDataType));
  return { items };
}

// Thay /news/headlines bằng cách tự nhóm từ /news/all
export async function fetchHeadlines(params: {
  language?: string;
  locale?: string;
  headlinesPerCategory?: number; // 1..10
}) {
  const { language = 'en', locale, headlinesPerCategory = 3 } = params;

  // Thử gom “nhiều hơn” để chia nhóm (Free sẽ vẫn cap về 3)
  const approxNeed = Math.max(3, Math.min(50, headlinesPerCategory * 8));
  const url = new URL(`${BASE}/news/all`);
  if (language) url.searchParams.set('language', language);
  if (locale) url.searchParams.set('locale', locale);
  url.searchParams.set('limit', String(capLimitForFreePlan(approxNeed)));
  url.searchParams.set('page', '1');

  const json = (await getJSON(url)) as ListResponse;
  const arr = (Array.isArray(json?.data) ? json.data : []) as Article[];

  // Nhóm theo category[0] (thiếu thì coi là 'general')
  const byCat = new Map<string, Article[]>();
  for (const a of arr) {
    const c = (a.categories && a.categories[0]) || 'general';
    const list = byCat.get(c) || [];
    if (list.length < headlinesPerCategory) list.push(a);
    byCat.set(c, list);
  }

  const flat = [...byCat.values()].flat();
  const items = dedupeById(flat.map(mapToNewsDataType));
  return { items };
}
