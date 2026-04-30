/**
 * services/expenseService.js
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// ── Read API key from localStorage (set by Settings page) ───────────────────
function authHeaders() {
  const key = localStorage.getItem('expense_tracker_api_key');
  return key ? { 'x-api-key': key } : {};
}

// ── Core fetch wrapper ─────────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
    const error = new Error(err.message || `HTTP ${res.status}`);
    error.code = err.code;
    throw error;
  }
  return res.json();
}

// ── Public API ─────────────────────────────────────────────────────────────────

/** Fetch all expenses */
export async function getExpenses() {
  return apiFetch('/expenses');
}

/** Fetch aggregated stats (total, by-month, by-category) */
export async function getStats() {
  return apiFetch('/expenses/stats');
}

/** Create a new expense */
export async function createExpense(data) {
  return apiFetch('/expenses', { method: 'POST', body: JSON.stringify(data) });
}

/** Update an existing expense */
export async function updateExpense(id, data) {
  return apiFetch(`/expenses/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

/** Delete an expense */
export async function deleteExpense(id) {
  return apiFetch(`/expenses/${id}`, { method: 'DELETE' });
}

/** Scan a receipt base64 image → { amount, merchant, category } */
export async function scanReceipt(base64Image) {
  return apiFetch('/ai/scan', { method: 'POST', body: JSON.stringify({ image: base64Image }) });
}
