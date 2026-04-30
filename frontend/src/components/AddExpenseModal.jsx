import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { createExpense, updateExpense, scanReceipt } from '../services/expenseService';

const CATEGORIES = [
  'Food & Dining', 'Transport', 'Rent & Utilities',
  'Entertainment', 'Software/SaaS', 'Travel',
  'Investments', 'Health', 'Others',
];

export default function AddExpenseModal({ isOpen, onClose, onSuccess, editExpense = null }) {
  const [formData, setFormData] = useState({
    amount:      '',
    description: '',
    category:    CATEGORIES[0],
    date:        new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading]   = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError]       = useState(null);
  const fileInputRef = React.useRef(null);

  // Pre-fill when editing
  useEffect(() => {
    if (editExpense) {
      setFormData({
        amount:      String(editExpense.amount),
        description: editExpense.description,
        category:    editExpense.category,
        date:        editExpense.date,
      });
    } else {
      setFormData({
        amount: '',
        description: '',
        category: CATEGORIES[0],
        date: new Date().toISOString().split('T')[0],
      });
    }
    setError(null);
  }, [editExpense]);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (editExpense) {
        await updateExpense(editExpense.id, formData);
      } else {
        await createExpense(formData);
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
        setFormData((prev) => ({
          ...prev,
          amount:      String(result.amount),
          description: result.merchant,
          category:    CATEGORIES.includes(result.category) ? result.category : CATEGORIES[0],
        }));
      } catch {
        setError('AI failed to read receipt. Please enter manually.');
      } finally {
        setIsScanning(false);
        e.target.value = '';
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-surface-container-lowest w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10 animate-in fade-in zoom-in duration-300">
        {isScanning && (
          <div className="absolute inset-0 z-[110] bg-surface/80 backdrop-blur-md flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
            <p className="font-manrope font-extrabold text-on-surface text-lg tracking-tight">AI Scanning…</p>
            <p className="text-sm text-slate-500 font-inter mt-1">Extracting details</p>
          </div>
        )}

        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex justify-between items-start">
          <div>
            <p className="text-[10px] font-inter font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Data Entry</p>
            <h2 className="text-2xl font-manrope font-extrabold text-on-surface tracking-tight">
              {editExpense ? 'Edit Transaction' : 'New Transaction'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface-container rounded-full text-slate-400 hover:text-slate-600 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form className="p-8 pt-2 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="px-5 py-3 bg-error-container text-on-error-container rounded-xl text-xs font-inter flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">error</span>
              {error}
            </div>
          )}

          {/* Amount */}
          <div className="flex flex-col items-center justify-center py-4 bg-surface-container-low/50 rounded-3xl border border-surface-container">
            <label className="text-[10px] font-inter font-bold uppercase tracking-widest text-slate-400 mb-2">Amount (USD)</label>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-manrope font-extrabold text-slate-400">$</span>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="bg-transparent text-4xl font-manrope font-extrabold text-on-surface placeholder:text-slate-200 border-none focus:ring-0 w-44 text-center"
                autoFocus
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5 px-1">
              <label className="text-[10px] font-inter font-bold uppercase tracking-widest text-slate-400 ml-1">Description</label>
              <input
                type="text"
                placeholder="e.g. Starbucks Coffee"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-surface-container-high rounded-2xl px-5 py-4 text-sm font-inter text-on-surface border-none focus:ring-2 focus:ring-primary/20 placeholder:text-slate-400 outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 px-1">
                <label className="text-[10px] font-inter font-bold uppercase tracking-widest text-slate-400 ml-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-surface-container-high rounded-2xl px-5 py-4 text-sm font-inter text-on-surface border-none focus:ring-2 focus:ring-primary/20 outline-none appearance-none"
                >
                  {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div className="space-y-1.5 px-1">
                <label className="text-[10px] font-inter font-bold uppercase tracking-widest text-slate-400 ml-1">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-surface-container-high rounded-2xl px-5 py-4 text-sm font-inter text-on-surface border-none focus:ring-2 focus:ring-primary/20 outline-none"
                  required
                />
              </div>
            </div>

            {/* Scan button */}
            <div className="px-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 bg-tertiary-container/10 text-tertiary px-4 py-2 rounded-xl text-xs font-bold hover:bg-tertiary-container/20 transition-all border border-tertiary/20"
              >
                <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                Scan Receipt
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-4 px-6 bg-surface-container text-slate-600 rounded-2xl font-inter font-bold text-sm hover:bg-surface-container-high transition-all active:scale-95 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || isScanning}
              className="flex-[2] py-4 px-6 bg-primary text-white rounded-2xl font-manrope font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-dim transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <span className="animate-spin material-symbols-outlined text-sm">progress_activity</span> : null}
              {loading ? 'Saving…' : editExpense ? 'Update Transaction' : 'Save Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
