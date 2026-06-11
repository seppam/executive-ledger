/**
 * services/apiClient.js
 * Demo version: delegates to localStorage.js.
 * Kept API shape for compatibility with existing components.
 */
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getStats,
  getBudgets,
  getBudgetProgress,
  getBudgetAlerts,
  getApiKey,
} from './localStorage';

function throwDemo(code = 'DEMO_MODE', message = 'Feature available in demo mode') {
  const err = new Error(message);
  err.code = code;
  return err;
}

export async function apiFetch(path, _getHeaders) {
  // This is a simplified version — main dispatch is in expenseService.js
  throw throwDemo('DEMO_MODE', 'Demo mode active');
}

export async function apiPost(path, body) {
  const method = 'POST';
  return apiDispatch(path, { method, body: JSON.stringify(body) });
}

export async function apiPut(path, body) {
  return apiDispatch(path, { method: 'PUT', body: JSON.stringify(body) });
}

export async function apiDel(path) {
  return apiDispatch(path, { method: 'DELETE' });
}

async function apiDispatch(path, options = {}) {
  const [,,, type, ...rest] = path.split('/');
  const id = rest.join('/');
  const body = options.body ? JSON.parse(options.body) : {};

  if (type === 'expenses') {
    if (options.method === 'POST') {
      return createTransaction(body);
    }
    if (options.method === 'PUT' && id) {
      return updateTransaction(id, body);
    }
    if (options.method === 'DELETE' && id) {
      deleteTransaction(id);
      return { success: true };
    }
  }

  if (type === 'budgets') {
    if (options.method === 'POST') {
      const budgets = getBudgets();
      const idx = budgets.findIndex((b) => b.category === body.category);
      if (idx >= 0) budgets[idx] = body;
      else budgets.push(body);
      // save through localStorage directly
      localStorage.setItem('el_demo_budgets', JSON.stringify(budgets));
      return { success: true };
    }
  }

  throw throwDemo('DEMO_MODE', `Route not simulated: ${path}`);
}

export function getAuthHeaders() {
  const apiKey = getApiKey();
  return apiKey ? { 'x-api-key': apiKey } : {};
}
