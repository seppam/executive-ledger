/**
 * services/geminiService.js
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// ── Read API key from localStorage ────────────────────────────────────────────
function authHeaders() {
  const key = localStorage.getItem('expense_tracker_api_key');
  return key ? { 'x-api-key': key } : {};
}

async function apiPost(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method:  'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const error = new Error(err.message || `HTTP ${res.status}`);
    error.code = err.code;
    throw error;
  }
  return res.json();
}

/**
 * @param {Array<Object>} expenses
 * @returns {Promise<SpendingInsight>}
 */
export async function getSpendingInsights(expenses = []) {
  return apiPost('/ai/insights', { expenses });
}

/**
 * @param {string} question
 * @param {Array<Object>} expenses
 * @returns {Promise<string>}
 */
export async function askGemini(question, expenses = []) {
  const data = await apiPost('/ai/chat', { question, expenses });
  return data.answer;
}
