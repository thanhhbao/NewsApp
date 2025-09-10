// utils/apiClient.ts
type ApiErrorKind =
  | 'rate_limit'
  | 'network'
  | 'timeout'
  | 'server'
  | 'bad_request'
  | 'unknown';

export class ApiError extends Error {
  kind: ApiErrorKind;
  status?: number;
  retryAfter?: number; // giây
  constructor(kind: ApiErrorKind, message: string, status?: number, retryAfter?: number) {
    super(message);
    this.kind = kind;
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

const DEFAULT_TIMEOUT = 12_000; // 12s
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// Backoff nhẹ cho GET idempotent (đặc biệt 429)
async function retryableFetch(
  input: RequestInfo | URL,
  init: RequestInit & { timeout?: number } = {},
  tries = 2
): Promise<Response> {
  const { timeout = DEFAULT_TIMEOUT, ...rest } = init;
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(input, { ...rest, signal: controller.signal });
    if (res.status === 429 && tries > 0) {
      const ra = parseInt(res.headers.get('retry-after') || '0', 10);
      const wait = Number.isFinite(ra) && ra > 0 ? ra * 1000 : 1200; // 1.2s fallback
      await sleep(wait);
      return retryableFetch(input, init, tries - 1);
    }
    return res;
  } catch (e: any) {
    if (e?.name === 'AbortError') {
      // timeout
      if (tries > 0) {
        await sleep(300);
        return retryableFetch(input, init, tries - 1);
      }
      throw new ApiError('timeout', 'Request timeout');
    }
    // mạng
    if (tries > 0) {
      await sleep(300);
      return retryableFetch(input, init, tries - 1);
    }
    throw new ApiError('network', 'Network error');
  } finally {
    clearTimeout(t);
  }
}
// utils/apiClient.ts (bổ sung)
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONE_HOUR = 60 * 60 * 1000;
const CACHE_PREFIX = '@api_cache:';

type CacheRecord<T = any> = {
  ts: number;   // timestamp lưu (ms)
  data: T;      // dữ liệu JSON
};

const hash = (s: string) => {
  // djb2, ra key ngắn gọn
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h) ^ s.charCodeAt(i);
  return 'h' + (h >>> 0).toString(36);
};

const cacheKeyFor = (url: string, init?: Pick<RequestInit, 'headers'>) => {
  // GET thường chỉ cần URL; nếu bạn muốn phân biệt theo header thì thêm vào đây
  const sig = url; // + JSON.stringify(init?.headers ?? {});
  return `${CACHE_PREFIX}${hash(sig)}`;
};

export async function getJsonCached<T = any>(
  url: string,
  init?: RequestInit & { timeout?: number },
  opts?: {
    ttlMs?: number;               // mặc định 1h
    force?: boolean;              // true = bỏ qua cache, gọi API
    allowStaleOnError?: boolean;  // nếu API lỗi, trả cache cũ nếu có
  }
): Promise<T> {
  const { ttlMs = ONE_HOUR, force = false, allowStaleOnError = true } = opts ?? {};
  const key = cacheKeyFor(url, init);

  if (!force) {
    try {
      const raw = await AsyncStorage.getItem(key);
      if (raw) {
        const rec: CacheRecord<T> = JSON.parse(raw);
        const fresh = Date.now() - rec.ts < ttlMs;
        if (fresh) {
          // ✅ cache còn hạn -> không gọi API
          return rec.data;
        }
      }
    } catch {
      // nếu đọc cache lỗi thì bỏ qua, tiếp tục fetch
    }
  }

  try {
    const data = await getJson<T>(url, init);      // dùng hàm fetch hiện có của bạn
    // lưu cache
    const rec: CacheRecord<T> = { ts: Date.now(), data };
    await AsyncStorage.setItem(key, JSON.stringify(rec));
    return data;
  } catch (e) {
    // Nếu API lỗi nhưng có cache cũ, trả về cache (stale) cho đỡ gián đoạn
    if (allowStaleOnError) {
      const raw = await AsyncStorage.getItem(key).catch(() => null);
      if (raw) {
        try {
          const rec: CacheRecord<T> = JSON.parse(raw);
          return rec.data;
        } catch {}
      }
    }
    throw e;
  }
}

// Tiện ích xóa cache (toàn bộ hoặc 1 URL)
export async function clearApiCache(url?: string) {
  if (url) {
    const key = cacheKeyFor(url);
    await AsyncStorage.removeItem(key);
    return;
  }
  const keys = await AsyncStorage.getAllKeys();
  const ours = keys.filter(k => k.startsWith(CACHE_PREFIX));
  if (ours.length) await AsyncStorage.multiRemove(ours);
}


export async function getJson<T = any>(url: string, init?: RequestInit & { timeout?: number }): Promise<T> {
  const res = await retryableFetch(url, { method: 'GET', ...(init || {}) });

  // map lỗi HTTP -> ApiError
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const msg = text || `HTTP ${res.status}`;
    if (res.status === 429) {
      const ra = parseInt(res.headers.get('retry-after') || '0', 10);
      throw new ApiError('rate_limit', 'Rate limit exceeded', 429, Number.isFinite(ra) ? ra : undefined);
    }
    if (res.status >= 500) throw new ApiError('server', msg, res.status);
    if (res.status >= 400) throw new ApiError('bad_request', msg, res.status);
    throw new ApiError('unknown', msg, res.status);
  }

  try {
    return (await res.json()) as T;
  } catch {
    throw new ApiError('unknown', 'Invalid JSON response');
  }
}
