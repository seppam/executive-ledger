import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getExpenses, deleteExpense } from '../services/expenseService';

const CATEGORIES = [
  'Food & Dining', 'Transport', 'Rent & Utilities',
  'Entertainment', 'Software/SaaS', 'Travel',
  'Investments', 'Health', 'Others',
];

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
};

export default function Expenses() {
  const { openModal, triggerRefresh } = useOutletContext();
  const [expenses, setExpenses]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filter, setFilter]          = useState('');
  const [deletingId, setDeletingId]  = useState(null);

  async function load() {
    setLoading(true);
    try { setExpenses(await getExpenses()); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  // Reload when modal added new expense
  useEffect(() => {
    if (triggerRefresh > 0) load();
  }, [triggerRefresh]);

  async function handleDelete(id) {
    if (!confirm('Delete this transaction?')) return;
    setDeletingId(id);
    try {
      await deleteExpense(id);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = filter
    ? expenses.filter((e) => e.category === filter)
    : expenses;

  const formatAmt = (a) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(a);

  return (
    <div className="px-10 py-8 pb-16 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <p className="text-[10px] font-inter font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">
            Financial Ledger
          </p>
          <h1 className="text-3xl font-manrope font-extrabold text-on-surface tracking-tight">Transactions</h1>
        </div>
        <button
          onClick={openModal}
          className="py-3 px-6 bg-primary text-white rounded-xl font-manrope font-bold flex items-center gap-2 hover:bg-primary-dim transition-all active:scale-95 shadow-sm"
        >
          <span className="material-symbols-outlined text-lg font-bold">add</span>
          Add Transaction
        </button>
      </header>

      {/* Filter bar */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <span className="text-xs font-inter font-bold uppercase tracking-widest text-slate-400 mr-2">Filter:</span>
        <button
          onClick={() => setFilter('')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
            !filter
              ? 'bg-primary text-white'
              : 'bg-surface-container text-slate-500 hover:bg-surface-container-high'
          }`}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(filter === cat ? '' : cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
              filter === cat
                ? `${categoryColors[cat].split(' ')[1]} ${categoryColors[cat].split(' ')[0]}`
                : 'bg-surface-container text-slate-500 hover:bg-surface-container-high'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-3xl shadow-card-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 font-inter italic">
            Loading transactions…
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400 font-inter">
            <span className="material-symbols-outlined text-4xl block mb-4">receipt_long</span>
            <p className="text-sm">
              {filter ? `No transactions in "${filter}".` : 'No transactions yet. Add your first one!'}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-surface-container">
                {['Date','Description','Category','Amount',''].map((col) => (
                  <th
                    key={col}
                    className={`px-6 py-5 text-[10px] font-inter font-bold uppercase tracking-[0.2em] text-slate-400 ${col === 'Amount' ? 'text-right' : ''} ${col === '' ? 'w-16' : ''}`}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container/40">
              {filtered.map((tx) => (
                <tr key={tx.id} className="hover:bg-surface-container-low/40 transition-colors">
                  <td className="px-6 py-5 text-sm text-slate-500 font-inter whitespace-nowrap">{tx.date}</td>
                  <td className="px-6 py-5">
                    <span className="font-manrope font-bold text-on-surface">{tx.description}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${categoryColors[tx.category] || categoryColors['Others']}`}>
                      {tx.category}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <span className="font-manrope font-bold text-on-surface">{formatAmt(tx.amount)}</span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button
                      onClick={() => handleDelete(tx.id)}
                      disabled={deletingId === tx.id}
                      className="p-2 rounded-xl hover:bg-error-container text-slate-400 hover:text-error transition-all disabled:opacity-40"
                      title="Delete transaction"
                    >
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Summary footer */}
      {!loading && filtered.length > 0 && (
        <div className="mt-6 flex justify-end">
          <div className="bg-surface-container-low rounded-2xl px-6 py-4 flex items-center gap-4">
            <span className="text-xs font-inter font-bold uppercase tracking-widest text-slate-400">
              {filtered.length} transaction{filtered.length !== 1 ? 's' : ''}
            </span>
            <span className="text-sm font-manrope font-extrabold text-on-surface">
              Total: {formatAmt(filtered.reduce((s, e) => s + Number(e.amount), 0))}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
