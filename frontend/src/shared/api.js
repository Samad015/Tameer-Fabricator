export const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const nativeFetch = window.fetch.bind(window);
window.fetch = (input, options = {}) => {
  const raw = typeof input === 'string' ? input : input.url;
  const url = new URL(raw, window.location.origin);
  const apiOrigin = new URL(API_BASE || window.location.origin, window.location.origin).origin;
  if (url.origin === apiOrigin && url.pathname.startsWith('/api/')) {
    const headers = new Headers(options.headers);
    headers.delete('Authorization');
    return nativeFetch(input, {...options, headers, credentials:'include'});
  }
  return nativeFetch(input, options);
};
localStorage.removeItem('token');
