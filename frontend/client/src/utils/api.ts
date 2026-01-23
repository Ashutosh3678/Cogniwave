import { isTokenExpiredSafe } from "../state/auth";

type FetchOpts = RequestInit & {
  token?: string | null;
};

const getBaseUrl = () =>
  (window as any).BASE_URL ||
  (typeof import.meta !== "undefined"
    ? (import.meta as any).env?.VITE_BASE_URL
    : undefined) ||
  (typeof process !== "undefined"
    ? (import.meta.env as any)?.REACT_APP_BASE_URL
    : undefined) ||
  // "http://10.80.100.219:3000";
  "http://localhost:3000";

export const jsonFetch = async <T = any>(path: string, opts: FetchOpts = {}) => {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${path}`;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(opts.headers || {}),
  };
  ``
  if (opts.token && !isTokenExpiredSafe(opts.token)) {
    // TypeScript's HeadersInit does not support direct property assignment for custom headers.
    // We need to ensure headers is a plain object before adding Authorization.
    if (headers instanceof Headers) {
      headers.set('Authorization', `Bearer ${opts.token}`);
    } else if (Array.isArray(headers)) {
      headers.push(['Authorization', `Bearer ${opts.token}`]);
    } else {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${opts.token}`;
    }
  }

  const res = await fetch(url, {
    ...opts,
    headers,
  });

  let body: any = null;
  try {
    body = await res.json();
  } catch {
    /* ignore parse errors */
  }

  if (!res.ok) {
    const message =
      body?.error ||
      body?.message ||
      res.statusText ||
      "request failed";
    const details = body?.details;
    const code = body?.code;
    const error = new Error(message) as any;
    if (code) error.code = code;
    if (details) error.details = details;
    throw error;
  }

  return body as T;
};

