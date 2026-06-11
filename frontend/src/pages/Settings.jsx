import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getApiKey, setApiKey as saveApiKey, getBudgets, saveBudgets, exportCSV, exportPDF } from '../services/localStorage';

const CATEGORIES = [
  'Food & Dining','Transport','Rent & Utilities','Entertainment',
  'Software/SaaS','Travel','Investments','Health','Others',
];

export default function Settings() {
  const { user, logout } = useAuth();

  // ── API key ────────────────────────────────────────────────────────────────
  const [apiKey, setApiKeyLocal]        = useState(() => getApiKey());
  const [showKey, setShowKey]      = useState(false);
  const [keySaved, setKeySaved]    = useState(false);

  // ── Budgets ────────────────────────────────────────────────────────────────
  const [budgets, setBudgetsLocal]       = useState([]);
  const [budgetDrafts, setBudgetDrafts] = useState({});
  const [budgetSaved, setBudgetSaved]   = useState(false);

  // ── Init ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const loaded = getBudgets();
    setBudgetsLocal(loaded);
    setBudgetDrafts(Object.fromEntries(loaded.map((b) => [b.category, String(b.limit)])));
  }, []);

  function handleSaveApiKey() {
    saveApiKey(apiKey);
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2000);
  }

  function handleSaveBudgets() {
    const list = Object.entries(budgetDrafts)
      .map(([category, limitStr]) => ({ category, limit: parseFloat(limitStr) || 0 }))
      .filter((b) => b.limit > 0);
    saveBudgets(list);
    setBudgetsLocal(list);
    setBudgetSaved(true);
    setTimeout(() => setBudgetSaved(false), 2000);
  }

  return (
    <div className="px-10 py-8 pb-16 max-w-4xl mx-auto">
      <header className="mb-10">
        <p className="text-[10px] font-inter font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Preferences</p>
        <h1 className="text-3xl font-manrope font-extrabold text-on-surface tracking-tight">Settings</h1>
      </header>

      <div className="space-y-6">

        {/* ── Demo Mode Banner ── */}
        <section className="bg-tertiary-container rounded-3xl p-6 shadow-card-sm border border-tertiary/20 flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-tertiary/20 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-tertiary text-xl">eco</span>
          </div>
          <div>
            <h2 className="text-base font-manrope font-bold text-on-tertiary-container mb-1">🟢 Demo Mode Active</h2>
            <p className="text-sm font-inter text-on-tertiary-container/80">
              All data is stored locally in your browser using localStorage. No account required.
              Add your own Gemini API key below to enable real AI insights powered by Google's Gemini 2.0 Flash (free tier: 1,500 requests/day).
            </p>
          </div>
        </section>

        {/* ── Account ── */}
        <section className="bg-surface-container-lowest rounded-3xl p-8 shadow-card-sm border border-surface-container">
          <h2 className="text-lg font-manrope font-bold text-on-surface mb-6">Account</h2>
          <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-manrope font-extrabold text-xl">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <p className="font-manrope font-bold text-on-surface">{user?.name || 'Demo User'}</p>
                <p className="text-sm text-slate-500 font-inter">{user?.email || 'demo@example.com'}</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">{user?.role || 'owner'}</span>
          </div>
          <p className="text-xs text-slate-400 font-inter mt-3">
            Demo mode — no real authentication. In production, this would use JWT + MongoDB.
          </p>
        </section>

        {/* ── AI Configuration ── */}
        <section className="bg-surface-container-lowest rounded-3xl p-8 shadow-card-sm border border-surface-container">
          <h2 className="text-lg font-manrope font-bold text-on-surface mb-2">AI Configuration</h2>
          <p className="text-sm text-slate-500 font-inter mb-6">Connect your own Gemini API key so AI features work with real AI analysis.</p>

          <div className="bg-tertiary-container/10 border border-tertiary/20 rounded-2xl p-5 mb-6">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-tertiary text-xl flex-shrink-0">info</span>
              <div className="text-sm text-on-tertiary-container font-inter text-xs leading-relaxed">
                <p className="font-bold mb-2">How to get your Gemini API key (free):</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Go to <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="underline font-bold">aistudio.google.com/apikey</a></li>
                  <li>Click <strong>"Create API Key"</strong></li>
                  <li>Copy the key and paste it below</li>
                </ol>
                <p className="mt-3 text-[10px] text-on-tertiary-container/70">Free tier: 1,500 requests/day for Gemini 2.0 Flash. No credit card required.</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5 px-1">
              <label className="text-[10px] font-inter font-bold uppercase tracking-widest text-slate-400 ml-1">Gemini API Key (optional)</label>
              <div className="relative">
                <input type={showKey ? 'text' : 'password'} placeholder="AIzaSy… (leave empty for demo AI responses)"
                  value={apiKey} onChange={(e) => setApiKeyLocal(e.target.value)}
                  className="w-full bg-surface-container-high rounded-2xl px-5 py-4 pr-12 text-sm font-inter text-on-surface border-none focus:ring-2 focus:ring-primary/20 outline-none placeholder:text-slate-400" />
                <button type="button" onClick={() => setShowKey(!showKey)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  <span className="material-symbols-outlined text-xl">{showKey ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
              <p className="text-[10px] text-slate-400 italic px-1">Stored locally in your browser only. Never sent to third parties (except Google for AI requests you initiate).</p>
            </div>
            <button onClick={handleSaveApiKey}
              className="py-3 px-6 bg-primary text-white rounded-xl font-manrope font-bold text-sm hover:bg-primary-dim transition-all active:scale-95 flex items-center gap-2">
              {keySaved ? <><span className="material-symbols-outlined text-sm">check</span> Saved!</> : <><span className="material-symbols-outlined text-sm">save</span> Update Key</>}
            </button>
          </div>
        </section>

        {/* ── Monthly Budgets ── */}
        <section className="bg-surface-container-lowest rounded-3xl p-8 shadow-card-sm border border-surface-container">
          <h2 className="text-lg font-manrope font-bold text-on-surface mb-2">Monthly Budget Limits</h2>
          <p className="text-sm text-slate-500 font-inter mb-6">Set a spending limit per category. You'll see a warning at 80% and 100%.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {CATEGORIES.map((cat) => (
              <div key={cat} className="space-y-1">
                <label className="text-[10px] font-inter font-bold uppercase tracking-widest text-slate-400 ml-1">{cat}</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Rp</span>
                  <input type="number" step="1000" placeholder="No limit"
                    value={budgetDrafts[cat] || ''}
                    onChange={(e) => setBudgetDrafts((p) => ({ ...p, [cat]: e.target.value }))}
                    className="w-full bg-surface-container-high rounded-2xl pl-10 pr-4 py-3 text-sm font-inter text-on-surface border-none focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>
              </div>
            ))}
          </div>
          <button onClick={handleSaveBudgets}
            className="py-3 px-6 bg-primary text-white rounded-xl font-manrope font-bold text-sm hover:bg-primary-dim transition-all active:scale-95 flex items-center gap-2">
            {budgetSaved ? <><span className="material-symbols-outlined text-sm">check</span> Saved!</> : <><span className="material-symbols-outlined text-sm">save</span> Save Budgets</>}
          </button>
        </section>

        {/* ── Export ── */}
        <section className="bg-surface-container-lowest rounded-3xl p-8 shadow-card-sm border border-surface-container">
          <h2 className="text-lg font-manrope font-bold text-on-surface mb-2">Export Data</h2>
          <p className="text-sm text-slate-500 font-inter mb-6">Export your transactions as CSV or PDF — all done in your browser, no server needed.</p>
          <div className="flex gap-4 flex-wrap">
            <button onClick={exportCSV}
              className="flex items-center gap-2 py-3 px-6 bg-surface-container text-on-surface rounded-xl font-inter font-bold text-sm hover:bg-surface-container-high transition-all">
              <span className="material-symbols-outlined text-lg">download</span>
              Download CSV
            </button>
            <button onClick={exportPDF}
              className="flex items-center gap-2 py-3 px-6 bg-surface-container text-on-surface rounded-xl font-inter font-bold text-sm hover:bg-surface-container-high transition-all">
              <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
              Download PDF Report
            </button>
          </div>
        </section>

        {/* ── Danger Zone ── */}
        <section className="bg-surface-container-lowest rounded-3xl p-8 shadow-card-sm border border-error/20">
          <h2 className="text-lg font-manrope font-bold text-error mb-2">Danger Zone</h2>
          <p className="text-sm text-slate-500 font-inter mb-4">Sign out clears your demo session. Data in localStorage is preserved.</p>
          <button onClick={() => { if (confirm('Sign out of demo session?')) { logout(); } }}
            className="py-2.5 px-6 bg-error-container text-on-error-container rounded-xl font-inter font-bold text-sm hover:opacity-80 transition-all">
            Sign Out
          </button>
        </section>

      </div>
    </div>
  );
}
