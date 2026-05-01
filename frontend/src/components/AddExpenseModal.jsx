import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { createExpense, updateExpense, scanReceipt } from '../services/expenseService';

const EXPENSE_CATS = ['Food & Dining','Transport','Rent & Utilities','Entertainment','Software/SaaS','Travel','Health','Others'];
const INCOME_CATS  = ['Salary','Freelance','Investment','Gift','Refund','Others'];
const FREQUENCIES   = [
  { value: '',           label: 'One-time' },
  { value: 'daily',     label: 'Daily' },
  { value: 'weekly',    label: 'Weekly' },
  { value: 'monthly',   label: 'Monthly' },
];

export default function AddExpenseModal({ isOpen, onClose, onSuccess, editExpense = null }) {
  const [formData, setFormData] = useState({
    amount: '', description: '', category: EXPENSE_CATS[0], date: new Date().toISOString().split('T')[0],
  });
  const [type, setType]           = useState('expense');
  const [frequency, setFrequency] = useState('');
  const [loading, setLoading]     = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError]           = useState(null);
  const fileInputRef = React.useRef(null);

  useEffect(() => {
    if (editExpense) {
      setFormData({
        amount:      String(editExpense.amount),
        description: editExpense.description,
        category:    editExpense.category,
        date:        editExpense.date,
      });
      setType(editExpense.type || 'expense');
      setFrequency('');
    } else {
      setFormData({ amount: '', description: '', category: EXPENSE_CATS[0], date: new Date().toISOString().split('T')[0] });
      setType('expense');
      setFrequency('');
    }
    setError(null);
  }, [editExpense]);

  const categories = type === 'income' ? INCOME_CATS : EXPENSE_CATS;

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = { ...formData, amount: parseFloat(formData.amount), type };
      if (editExpense) {
        await updateExpense(editExpense.id, payload);
      } else {
        await createExpense(payload);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.code === 'NO_API_KEY' ? err.message : `Save failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setIsScanning(true);
    setError(null);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const result = await scanReceipt(reader.result);
        setFormData((p) => ({ ...p, amount: String(result.amount), description: result.merchant, category: result.category }));
        setType('expense');
      } catch { setError('AI failed to read receipt. Enter details manually.'); }
      finally { setIsScanning(false); e.target.value = ''; }
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface-container-lowest w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        {isScanning && (
          <div className="absolute inset-0 z-[110] bg-surface/80 backdrop-blur-md flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
            <p className="font-manrope font-extrabold text-on-surface text-lg">AI Scanning…</p>
          </div>
        )}

        <div className="px-8 pt-8 pb-4 flex justify-between items-start">
          <div>
            <p className="text-[10px] font-inter font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Data Entry</p>
            <h2 className="text-2xl font-manrope font-extrabold text-on-surface tracking-tight">
              {editExpense ? 'Edit Transaction' : 'New Transaction'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface-container rounded-full text-slate-400 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form className="p-8 pt-2 space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="px-5 py-3 bg-error-container text-on-error-container rounded-xl text-xs font-inter flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">error</span>
              {error}
            </div>
          )}

          {/* Type toggle */}
          <div className="flex gap-2">
            {['expense','income'].map((t) => (
              <button key={t} type="button" onClick={() => { setType(t); setFormData((p) => ({ ...p, category: t === 'income' ? INCOME_CATS[0] : EXPENSE_CATS[0] })); }}
                className={`flex-1 py-3 rounded-2xl font-bold text-sm transition-all ${
                  type === t
                    ? t === 'income' ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                      : 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'bg-surface-container text-slate-500'
                }`}>
                {t === 'income' ? '📈 Income' : '📉 Expense'}
              </button>
            ))}
          </div>

          {/* Amount */}
          <div className="flex flex-col items-center justify-center py-4 bg-surface-container-low/50 rounded-3xl border border-surface-container">
            <label className="text-[10px] font-inter font-bold uppercase tracking-widest text-slate-400 mb-2">Amount (USD)</label>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-manrope font-extrabold text-slate-400">$</span>
              <input type="number" step="0.01" placeholder="0.00" value={formData.amount}
                onChange={(e) => setFormData((p) => ({ ...p, amount: e.target.value }))}
                className="bg-transparent text-4xl font-manrope font-extrabold text-on-surface placeholder:text-slate-200 border-none focus:ring-0 w-44 text-center"
                autoFocus required />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5 px-1">
              <label className="text-[10px] font-inter font-bold uppercase tracking-widest text-slate-400 ml-1">Description</label>
              <input type="text" placeholder="e.g. Starbucks Coffee" value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                className="w-full bg-surface-container-high rounded-2xl px-5 py-4 text-sm font-inter text-on-surface border-none focus:ring-2 focus:ring-primary/20 placeholder:text-slate-400 outline-none"
                required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 px-1">
                <label className="text-[10px] font-inter font-bold uppercase tracking-widest text-slate-400 ml-1">Category</label>
                <select value={formData.category} onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
                  className="w-full bg-surface-container-high rounded-2xl px-5 py-4 text-sm font-inter text-on-surface border-none focus:ring-2 focus:ring-primary/20 outline-none appearance-none">
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1.5 px-1">
                <label className="text-[10px] font-inter font-bold uppercase tracking-widest text-slate-400 ml-1">Date</label>
                <input type="date" value={formData.date}
                  onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value }))}
                  className="w-full bg-surface-container-high rounded-2xl px-5 py-4 text-sm font-inter text-on-surface border-none focus:ring-2 focus:ring-primary/20 outline-none"
                  required />
              </div>
            </div>

            {/* Recurring */}
            {!editExpense && (
              <div className="space-y-1.5 px-1">
                <label className="text-[10px] font-inter font-bold uppercase tracking-widest text-slate-400 ml-1">Recurring</label>
                <select value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="w-full bg-surface-container-high rounded-2xl px-5 py-4 text-sm font-inter text-on-surface border-none focus:ring-2 focus:ring-primary/20 outline-none appearance-none">
                  {FREQUENCIES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
                {frequency && (
                  <p className="text-[10px] text-tertiary italic px-1 mt-1">
                    🔁 Auto-logged {frequency === 'daily' ? 'every day' : frequency === 'weekly' ? 'every week' : 'every month'} from today.
                  </p>
                )}
              </div>
            )}

            {/* Scan receipt */}
            {!editExpense && (
              <div className="px-1">
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 bg-tertiary-container/10 text-tertiary px-4 py-2 rounded-xl text-xs font-bold hover:bg-tertiary-container/20 transition-all border border-tertiary/20">
                  <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                  Scan Receipt
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={loading}
              className="flex-1 py-4 px-6 bg-surface-container text-slate-600 rounded-2xl font-inter font-bold text-sm hover:bg-surface-container-high transition-all active:scale-95 disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={loading || isScanning}
              className="flex-[2] py-4 px-6 bg-primary text-white rounded-2xl font-manrope font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-dim transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <><span className="animate-spin material-symbols-outlined text-sm">progress_activity</span>Saving…</> : editExpense ? 'Update' : 'Save Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
