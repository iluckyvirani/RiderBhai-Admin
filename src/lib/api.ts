const TOKEN_KEY = 'ridebhai_admin_api_token';

export function apiUrl() {
  return (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || 'http://localhost:4000';
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || '';
}

export function setToken(token: string | null) {
  if (!token) localStorage.removeItem(TOKEN_KEY);
  else localStorage.setItem(TOKEN_KEY, token);
}

export async function api<T = any>(
  path: string,
  options: RequestInit & { json?: unknown } = {}
): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.json !== undefined) headers.set('Content-Type', 'application/json');
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let res: Response;
  try {
    res = await fetch(`${apiUrl()}${path}`, {
      ...options,
      headers,
      body: options.json !== undefined ? JSON.stringify(options.json) : options.body,
    });
  } catch {
    throw new Error(`Cannot reach ${apiUrl()}. Keep the API running on port 4000.`);
  }

  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.ok === false) {
    const err = new Error(body.error || `Request failed (${res.status})`) as Error & { code?: string };
    err.code = body.code;
    throw err;
  }
  return (body.data !== undefined ? body.data : body) as T;
}
