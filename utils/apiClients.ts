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
