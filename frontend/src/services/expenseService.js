/**
 * services/expenseService.js
 * Demo version — all operations use localStorage.
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
  scanReceipt as localScanReceipt,
} from './localStorage';

/** Fetch all expenses (optionally filtered) */
export function getExpenses(params = {}) {
  let txs = getTransactions();
  if (params.type)     txs = txs.filter((t) => t.type === params.type);
  if (params.category) txs = txs.filter((t) => t.category === params.category);
  return Promise.resolve(txs);
}

/** Fetch aggregated stats */
export function getStatsData() {
  return Promise.resolve(getStats());
}

/** Create a new expense */
export function createExpense(data) {
  return Promise.resolve(createTransaction(data));
}

/** Update an existing expense */
export function updateExpense(id, data) {
  return Promise.resolve(updateTransaction(id, data));
}

/** Delete an expense */
export function deleteExpense(id) {
  deleteTransaction(id);
  return Promise.resolve({ success: true });
}

/** Scan a receipt image → extracted data (mock) */
export function scanReceipt(base64Image) {
  return localScanReceipt(base64Image);
}

/** Budget progress (from localStorage) */
export function getBudgetsData() {
  return Promise.resolve(getBudgets());
}

export function getBudgetProgressData() {
  return Promise.resolve(getBudgetProgress());
}

export function getBudgetAlertsData() {
  return Promise.resolve(getBudgetAlerts());
}
