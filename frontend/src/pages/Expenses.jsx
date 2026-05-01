import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch, apiPost, apiDel } from '../services/apiClient';

const CATEGORIES_EXPENSE = ['Food & Dining','Transport','Rent & Utilities','Entertainment','Software/SaaS','Travel','Health','Others'];
const CATEGORIES_INCOME  = ['Salary','Freelance','Investment','Gift','Refund','Others'];
const ALL_CATEGORIES = [...new Set([...CATEGORIES_EXPENSE, ...CATEGORIES_INCOME])];

const categoryColors = {
  'Food & Dining':    'text-amber-700 bg-amber-50',
  'Transport':        'text-blue-700 bg-blue-50',
  'Rent & Utilities': 'text-purple-700 bg-purple-50',
  'Entertainment':    'text-pink-700 bg-pink-50',
  'Software/SaaS':    'text-indigo-700 bg-indigo-50',
  'Travel':           'text-teal-700 bg-teal-50',
  'Investments':      'text-tertiary bg-tertiary-container/20',
  'Health':           'text-green-700 bg-green-50',
  'Others':           'text-slate-600 bg-surface-container',
  'Salary':           'text-green-700 bg-green-50',
  'Freelance':        'text-blue-700 bg-blue-50',
  'Gift':             'text-pink-700 bg-pink-50',
  'Refund':           'text-teal-700 bg-teal-50',
};

export default function Expenses() {
  const { openModal, openEditModal, triggerRefresh, refreshSeed } = useOutletContext();
  const { getHeaders } = useAuth();

  const [expenses, setExpenses]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'income' | 'expense'
  const [catFilter, setCatFilter]   = useState('');
  const [deletingId, setDeletingId] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter !== 'all') params.set('type', typeFilter);
      if (catFilter) params.set('category', catFilter);
      const qs = params.toString();
      const data = await apiFetch(`/api/expenses${qs ? '?' + qs : ''}`, getHeaders);
      setExpenses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [refreshSeed, typeFilter, catFilter]);

  async function handleDelete(id) {
    if (!confirm('Delete this transaction?')) return;
    setDeletingId(id);
    try {
      await apiDel(`/api/expenses/${id}`);
      setExpenses((p) => p.filter((e) => e.id !== id));
    } catch (err) { alert(`Delete failed: ${err.message}`); }
    finally { setDeletingId(null); }
  }

  const filtered = expenses;

  const totalIncome  = filtered.filter((e) => e.type === 'income').reduce((s, e) => s + Number(e.amount), 0);
  const totalExpense = filtered.filter((e) => e.type === 'expense').reduce((s, e) => s + Number(e.amount), 0);
  const net         = totalIncome - totalExpense;
  const fmtAmt      = (a) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.abs(a));
  const usedCats    = [...new Set(expenses.map((e) => e.category))];

  return (
    <div className="px-10 py-8 pb-16 max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-6">
        <div>
          <p className="text-[10px] font-inter font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Financial Ledger</p>
          <h1 className="text-3xl font-manrope font-extrabold text-on-surface tracking-tight">Transactions</h1>
        </div>
        <button onClick={openModal}
          className="py-3 px-6 bg-primary text-white rounded-xl font-manrope font-bold flex items-center gap-2 hover:bg-primary-dim transition-all active:scale-95 shadow-sm">
          <span className="material-symbols-outlined text-lg font-bold">add</span>
          Add Transaction
        </button>
      </header>

      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
          <p className="text-[10px] font-inter font-bold uppercase tracking-widest text-green-600 mb-1">Income</p>
          <p className="text-xl font-manrope font-extrabold text-green-700">+{fmtAmt(totalIncome)}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
          <p className="text-[10px] font-inter font-bold uppercase tracking-widest text-red-600 mb-1">Expense</p>
          <p className="text-xl font-manrope font-extrabold text-red-700">-{fmtAmt(totalExpense)}</p>
        </div>
        <div className={`rounded-2xl p-4 text-center border ${net >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}`}>
          <p className="text-[10px] font-inter font-bold uppercase tracking-widest text-slate-500 mb-1">Net Balance</p>
          <p className={`text-xl font-manrope font-extrabold ${net >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
            {net >= 0 ? '+' : '-'}{fmtAmt(net)}
          </p>
        </div>
      </div>

      {/* Type tabs */}
      <div className="flex items-center gap-3 mb-4">
        {['all','income','expense'].map((t) => (
          <button key={t}
            onClick={() => { setTypeFilter(t); setCatFilter(''); }}
            className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
              typeFilter === t ? 'bg-primary text-white' : 'bg-surface-container text-slate-500 hover:bg-surface-container-high'
            }`}>
            {t === 'all' ? 'All' : t === 'income' ? '📈 Income' : '📉 Expense'}
          </button>
        ))}
      </div>

      {/* Category filter */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <span className="text-[10px] font-inter font-bold uppercase tracking-widest text-slate-400">Category:</span>
        <button onClick={() => setCatFilter('')}
          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${!catFilter ? 'bg-primary text-white' : 'bg-surface-container text-slate-500'}`}>
          All
        </button>
        {usedCats.map((cat) => (
          <button key={cat} onClick={() => setCatFilter(catFilter === cat ? '' : cat)}
            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${catFilter === cat ? `${categoryColors[cat] || 'bg-primary text-white'}` : 'bg-surface-container text-slate-500'}`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-3xl shadow-card-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 italic">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <span className="material-symbols-outlined text-4xl block mb-4">receipt_long</span>
            <p className="text-sm">No transactions found.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-surface-container">
                {['Date','Description','Category','Type','Amount',''].map((col) => (
                  <th key={col} className={`px-6 py-5 text-[10px] font-inter font-bold uppercase tracking-[0.2em] text-slate-400 ${col === 'Amount' ? 'text-right' : ''} ${col === '' ? 'w-24' : ''}`}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container/40">
              {filtered.map((tx) => (
                <tr key={tx.id} className="hover:bg-surface-container-low/40 transition-colors group">
                  <td className="px-6 py-5 text-sm text-slate-500 font-inter whitespace-nowrap">{tx.date}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      {tx.isRecurring && <span className="text-[10px] text-tertiary font-bold" title="Auto-logged from recurring rule">🔁</span>}
                      <span className="font-manrope font-bold text-on-surface">{tx.description}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${categoryColors[tx.category] || categoryColors['Others']}`}>{tx.category}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${tx.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>{tx.type}</span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <span className={`font-manrope font-bold ${tx.type === 'income' ? 'text-green-600' : 'text-on-surface'}`}>
                      {tx.type === 'income' ? '+' : '-'}{fmtAmt(tx.amount)}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditModal(tx)} className="p-2 rounded-xl hover:bg-surface-container text-slate-400 hover:text-primary transition-all" title="Edit">
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      <button onClick={() => handleDelete(tx.id)} disabled={deletingId === tx.id}
                        className="p-2 rounded-xl hover:bg-error-container text-slate-400 hover:text-error transition-all disabled:opacity-40" title="Delete">
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
