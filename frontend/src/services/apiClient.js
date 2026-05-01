/**
 * services/apiClient.js
 * Centralised fetch wrapper that always includes auth + API-key headers.
 */
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

function getHeaders() {
  const token  = localStorage.getItem('auth_token');
  const apiKey = localStorage.getItem('expense_tracker_api_key');
  const headers = { 'Content-Type': 'application/json' };
  if (token)  headers['Authorization'] = `Bearer ${token}`;
  if (apiKey) headers['x-api-key']     = apiKey;
  return headers;
}

export async function apiFetch(path, _getHeaders) {
  const h = typeof _getHeaders === 'function' ? _getHeaders() : getHeaders();
  const res = await fetch(`${BASE}${path}`, { headers: h });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || `HTTP ${res.status}`);
    err.code  = data.code;
    err.status = res.status;
    throw err;
  }
  return data;
}

export async function apiPost(path, body)  { return apiFetch(path, { method:'POST', headers: getHeaders(), body: JSON.stringify(body) }); }
export async function apiPut(path, body)   { return apiFetch(path, { method:'PUT',   headers: getHeaders(), body: JSON.stringify(body) }); }
export async function apiDel(path)         { return apiFetch(path, { method:'DELETE', headers: getHeaders() }); }
