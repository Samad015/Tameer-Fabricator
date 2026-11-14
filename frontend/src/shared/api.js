export const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
export function apiFetch(input, options = {}) {
  const {timeoutMs = 15000, ...fetchOptions} = options;
  const url = new URL(input, window.location.origin);
  const apiOrigin = new URL(API_BASE || window.location.origin, window.location.origin).origin;
  if (url.pathname.startsWith('/api/') && (url.origin === window.location.origin || url.origin === apiOrigin)) {
    const target = API_BASE ? new URL(url.pathname + url.search, new URL(API_BASE + '/', window.location.origin)) : url;
    const timeout = AbortSignal.timeout(timeoutMs);
    const signal = options.signal ? AbortSignal.any([options.signal, timeout]) : timeout;
    return window.fetch(target, {...fetchOptions, signal, credentials: 'include'});
  }
  return window.fetch(input, fetchOptions);
}
localStorage.removeItem('token');
