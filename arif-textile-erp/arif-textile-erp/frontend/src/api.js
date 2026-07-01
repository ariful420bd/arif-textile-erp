// In local development this stays "/api" (Vite proxies it to localhost:5000).
// In production (Railway), set VITE_API_URL to your backend's live URL, e.g.
// https://backend-production-xxxx.up.railway.app/api
const BASE = import.meta.env.VITE_API_URL || '/api';
export const PDF_BASE = BASE.replace(/\/api$/, '/api/pdf');

async function handle(res) {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const api = {
  get: (path) => fetch(`${BASE}${path}`).then(handle),
  post: (path, body) =>
    fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(handle),
  put: (path, body) =>
    fetch(`${BASE}${path}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(handle),
  del: (path) => fetch(`${BASE}${path}`, { method: 'DELETE' }).then(handle)
};
