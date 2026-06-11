/**
 * services/localStorage.js
 * localStorage-backed data store for the demo version.
 * All CRUD operations are synchronous — no network needed.
 */

const TX_KEY = 'el_demo_transactions';
const BUDGET_KEY = 'el_demo_budgets';
const API_KEY = 'expense_tracker_api_key';

// ── Helpers ───────────────────────────────────────────────────────────────────

function uuid() {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now();
}

function now() { return new Date().toISOString(); }

function read(key) {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); }
  catch { return []; }
}

function write(key, data) { localStorage.setItem(key, JSON.stringify(data)); }

// ── Seed data (Indonesian context, IDR) ───────────────────────────────────────

const SEED_TRANSACTIONS = [
  {
    id: uuid(), type: 'expense', amount: 65000,
    description: 'Nasi Padang — Makan Siang', category: 'Food & Dining',
    date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
    createdAt: now(),
  },
  {
    id: uuid(), type: 'expense', amount: 25000,
    description: 'Gojek ke Kantor', category: 'Transport',
    date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    createdAt: now(),
  },
  {
    id: uuid(), type: 'income', amount: 15000000,
    description: 'Gaji Bulanan — PT Maju Jaya', category: 'Salary',
    date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
    createdAt: now(),
  },
  {
    id: uuid(), type: 'expense', amount: 185000,
    description: 'Grab ke Meeting Client', category: 'Transport',
    date: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0],
    createdAt: now(),
  },
  {
    id: uuid(), type: 'expense', amount: 89000,
    description: 'Netflix Premium — Bulanan', category: 'Entertainment',
    date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
    createdAt: now(),
  },
  {
    id: uuid(), type: 'expense', amount: 1200000,
    description: 'Token Listrik + WiFi', category: 'Rent & Utilities',
    date: new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0],
    createdAt: now(),
  },
  {
    id: uuid(), type: 'expense', amount: 350000,
    description: 'Makan Malam — Seafood', category: 'Food & Dining',
    date: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
    createdAt: now(),
  },
  {
    id: uuid(), type: 'expense', amount: 149000,
    description: 'Spotify Premium', category: 'Entertainment',
    date: new Date(Date.now() - 8 * 86400000).toISOString().split('T')[0],
    createdAt: now(),
  },
  {
    id: uuid(), type: 'income', amount: 2500000,
    description: 'Freelance — Website Redesign', category: 'Freelance',
    date: new Date(Date.now() - 9 * 86400000).toISOString().split('T')[0],
    createdAt: now(),
  },
  {
    id: uuid(), type: 'expense', amount: 75000,
    description: 'Kopi & Snack — WFH', category: 'Food & Dining',
    date: new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0],
    createdAt: now(),
  },
  {
    id: uuid(), type: 'expense', amount: 450000,
    description: 'Grab ke Bandara', category: 'Transport',
    date: new Date(Date.now() - 11 * 86400000).toISOString().split('T')[0],
    createdAt: now(),
  },
  {
    id: uuid(), type: 'expense', amount: 175000,
    description: 'Obat & Vitamin', category: 'Health',
    date: new Date(Date.now() - 12 * 86400000).toISOString().split('T')[0],
    createdAt: now(),
  },
  {
    id: uuid(), type: 'expense', amount: 99000,
    description: 'Spotify + YouTube Premium', category: 'Entertainment',
    date: new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0],
    createdAt: now(),
  },
  {
    id: uuid(), type: 'expense', amount: 3500000,
    description: 'Angsuran Cicilan Motor', category: 'Others',
    date: new Date(Date.now() - 15 * 86400000).toISOString().split('T')[0],
    createdAt: now(),
  },
];

const SEED_BUDGETS = [
  { category: 'Food & Dining',    limit: 3000000 },
  { category: 'Transport',         limit: 2000000 },
  { category: 'Entertainment',    limit: 500000  },
  { category: 'Rent & Utilities', limit: 3000000 },
  { category: 'Health',           limit: 500000  },
  { category: 'Others',           limit: 1000000 },
];

// ── Init / Seed ───────────────────────────────────────────────────────────────

export function seedDemoData() {
  if (read(TX_KEY).length === 0) {
    write(TX_KEY, SEED_TRANSACTIONS);
  }
  if (read(BUDGET_KEY).length === 0) {
    write(BUDGET_KEY, SEED_BUDGETS);
  }
}

// ── Transactions ──────────────────────────────────────────────────────────────

export function getTransactions() { return read(TX_KEY); }

export function getTransaction(id) {
  return read(TX_KEY).find((t) => t.id === id) || null;
}

export function createTransaction(data) {
  const tx = { ...data, id: uuid(), createdAt: now() };
  const all = read(TX_KEY);
  all.unshift(tx);
  write(TX_KEY, all);
  return tx;
}

export function updateTransaction(id, data) {
  const all = read(TX_KEY);
  const idx = all.findIndex((t) => t.id === id);
  if (idx === -1) throw new Error('Transaction not found');
  all[idx] = { ...all[idx], ...data, id, updatedAt: now() };
  write(TX_KEY, all);
  return all[idx];
}

export function deleteTransaction(id) {
  write(TX_KEY, read(TX_KEY).filter((t) => t.id !== id));
}

// ── Stats ─────────────────────────────────────────────────────────────────────

export function getStats() {
  const txs = read(TX_KEY);
  const totalIncome  = txs.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = txs.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);

  // byMonth keyed by 1-12
  const byMonth = {};
  txs.forEach((t) => {
    const m = new Date(t.date).getMonth() + 1;
    if (!byMonth[m]) byMonth[m] = { income: 0, expense: 0 };
    byMonth[m][t.type] = (byMonth[m][t.type] || 0) + Number(t.amount);
  });

  return { totalIncome, totalExpense, netBalance: totalIncome - totalExpense, byMonth };
}

// ── Budgets ───────────────────────────────────────────────────────────────────

export function getBudgets() { return read(BUDGET_KEY); }

export function saveBudgets(budgetList) {
  // budgetList = [{ category, limit }]
  write(BUDGET_KEY, budgetList);
  return budgetList;
}

export function getBudgetProgress() {
  const budgets = read(BUDGET_KEY);
  const txs = read(TX_KEY);
  const now = new Date();
  const curMonth = now.getMonth() + 1;
  const curYear  = now.getFullYear();

  const thisMonth = txs.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() + 1 === curMonth && d.getFullYear() === curYear && t.type === 'expense';
  });

  return budgets.map((b) => {
    const spent = thisMonth
      .filter((t) => t.category === b.category)
      .reduce((s, t) => s + Number(t.amount), 0);
    const percent = b.limit > 0 ? Math.round((spent / b.limit) * 100) : 0;
    return { category: b.category, limit: b.limit, spent, percent };
  });
}

export function getBudgetAlerts() {
  return getBudgetProgress()
    .filter((b) => b.percent >= 80)
    .map((b) => ({
      category: b.category,
      percent: b.percent,
      status: b.percent >= 100 ? 'exceeded' : 'warning',
    }));
}

// ── Receipt scanning (mock) ───────────────────────────────────────────────────

export function scanReceipt(_base64Image) {
  // Mock AI receipt scanner — in production would call Gemini
  const mocks = [
    { amount: 48500,  merchant: 'Warung Makan Ibu Siti', category: 'Food & Dining' },
    { amount: 125000, merchant: 'GrabCar',                  category: 'Transport' },
    { amount: 89000,  merchant: 'IndiHome Payment',         category: 'Rent & Utilities' },
    { amount: 55000,  merchant: 'Alfamart',                category: 'Others' },
  ];
  return Promise.resolve(mocks[Math.floor(Math.random() * mocks.length)]);
}

// ── Export helpers ─────────────────────────────────────────────────────────────

export function exportCSV() {
  const txs = read(TX_KEY);
  const headers = ['Date', 'Description', 'Category', 'Type', 'Amount'];
  const rows = txs.map((t) => [t.date, `"${t.description}"`, t.category, t.type, t.amount]);
  const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
  downloadFile('executive-ledger-export.csv', csv, 'text/csv');
}

export function exportPDF() {
  // Dynamically import jsPDF to avoid adding a hard dependency
  import('jspdf').then(({ jsPDF }) => {
    const doc = new jsPDF();
    const txs = read(TX_KEY);
    const stats = getStats();

    doc.setFontSize(20);
    doc.text('Executive Ledger — Expense Report', 14, 20);

    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleDateString('id-ID')}`, 14, 30);
    doc.text(`Total Income:  Rp ${stats.totalIncome.toLocaleString('id-ID')}`, 14, 38);
    doc.text(`Total Expense: Rp ${stats.totalExpense.toLocaleString('id-ID')}`, 14, 46);
    doc.text(`Net Balance:   Rp ${stats.netBalance.toLocaleString('id-ID')}`, 14, 54);

    doc.setFontSize(13);
    doc.text('Transactions', 14, 68);

    doc.setFontSize(9);
    let y = 78;
    doc.text('Date', 14, y);
    doc.text('Description', 50, y);
    doc.text('Category', 120, y);
    doc.text('Amount', 165, y);
    y += 6;

    txs.slice(0, 40).forEach((t) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(t.date, 14, y);
      doc.text(t.description.slice(0, 30), 50, y);
      doc.text(t.category.slice(0, 20), 120, y);
      doc.text(`Rp ${Number(t.amount).toLocaleString('id-ID')}`, 165, y);
      y += 6;
    });

    doc.save('executive-ledger-report.pdf');
  }).catch(() => {
    // Fallback: just alert user
    alert('PDF export requires the jsPDF library. Run: npm install jspdf');
  });
}

function downloadFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── API key (stored locally) ──────────────────────────────────────────────────

export function getApiKey()     { return localStorage.getItem(API_KEY) || ''; }
export function setApiKey(key)  { localStorage.setItem(API_KEY, key.trim()); }
