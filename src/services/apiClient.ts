// src/services/apiClient.ts
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface RequestConfig<TBody = unknown> {
  url: string;
  method?: HttpMethod;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | undefined>;
  data?: TBody;
  timeoutMs?: number;
}

function buildUrl(url: string, params?: RequestConfig['params']) {
  if (!params) return url;
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined) continue;
    usp.set(k, String(v));
  }
  const qs = usp.toString();
  return qs ? `${url}?${qs}` : url;
}

async function request<TResp = unknown, TBody = unknown>(cfg: RequestConfig<TBody>): Promise<TResp> {
  const {
    url,
    method = 'GET',
    headers = {},
    params,
    data,
    timeoutMs = 30000,
  } = cfg;

  const fullUrl = buildUrl(url, params);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(fullUrl, {
      method,
      headers: { 'Content-Type': 'application/json', ...headers },
      body: method === 'GET' ? undefined : JSON.stringify(data ?? {}),
      signal: controller.signal,
      credentials: 'include',
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `HTTP ${res.status}`);
    }
    const ct = res.headers.get('Content-Type') || '';
    if (ct.includes('application/json')) return res.json() as Promise<TResp>;
    // @ts-expect-error — на случай текстовых ответов
    return res.text() as TResp;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Совместимость:
 * - apiClient(...) — как функция
 * - apiClient.request(...) — как у axios-подобных клиентов
 * - default export с .request
 */
type ApiClient = typeof request & { request: typeof request };

export const apiClient = Object.assign(request, { request }) as ApiClient;
export default { request };