/**
 * HTTP client for the AdminFlow API. Every API function goes through
 * `request`, which adds the bearer token, maps error bodies to `ApiError`,
 * and signs the user out when the server rejects their session.
 */

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface ClientHooks {
  getToken: () => string | null;
  onUnauthorized: () => void;
}

// Registered by the auth store, which keeps this module free of a store import cycle.
let hooks: ClientHooks = { getToken: () => null, onUnauthorized: () => {} };

export function configureClient(next: Partial<ClientHooks>) {
  hooks = { ...hooks, ...next };
}

/** Same-origin `/api` by default: nginx (Docker) or the Vite dev proxy forwards it to the API. */
const BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

type Query = Record<string, string | number | boolean | undefined>;

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: Query;
  signal?: AbortSignal;
}

export async function request<T>(path: string, { method = 'GET', body, query, signal }: RequestOptions = {}): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`, window.location.origin);
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== '') url.searchParams.set(key, String(value));
  });

  const token = hooks.getToken();
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(url, { method, headers, body: body === undefined ? undefined : JSON.stringify(body), signal });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err;
    throw new ApiError('Cannot reach the server. Check your connection and try again', 0);
  }

  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) {
    // A 401 on a signed-in request means the session expired or was revoked.
    if (res.status === 401 && token) hooks.onUnauthorized();
    const message = (data as { error?: { message?: string } } | null)?.error?.message;
    throw new ApiError(message ?? `Request failed (${res.status})`, res.status);
  }
  return data as T;
}
