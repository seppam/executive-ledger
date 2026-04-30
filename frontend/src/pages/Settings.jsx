import React, { useState, useEffect } from 'react';

const STORAGE_KEY_API = 'expense_tracker_api_key';
const STORAGE_KEY_BUDGET = 'expense_tracker_monthly_budget';

export default function Settings() {
  const [darkMode, setDarkMode]     = useState(() => {
    return localStorage.getItem('theme') === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [budget, setBudget]        = useState(() => localStorage.getItem(STORAGE_KEY_BUDGET) || '5000');
  const [apiKey, setApiKey]        = useState(() => localStorage.getItem(STORAGE_KEY_API) || '');
  const [showKey, setShowKey]      = useState(false);
  const [saved, setSaved]          = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  function handleSave() {
    localStorage.setItem(STORAGE_KEY_API, apiKey.trim());
    localStorage.setItem(STORAGE_KEY_BUDGET, budget);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="px-10 py-8 pb-16 max-w-4xl mx-auto">
      <header className="mb-10">
        <p className="text-[10px] font-inter font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Preferences</p>
        <h1 className="text-3xl font-manrope font-extrabold text-on-surface tracking-tight">Settings</h1>
      </header>

      <div className="space-y-6">

        {/* ── Appearance ── */}
        <section className="bg-surface-container-lowest rounded-3xl p-8 shadow-card-sm border border-surface-container">
          <h2 className="text-lg font-manrope font-bold text-on-surface mb-6">Appearance</h2>
          <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">dark_mode</span>
              </div>
              <span className="font-inter font-semibold text-on-surface text-sm">Dark Mode</span>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`w-12 h-6 rounded-full transition-all duration-300 flex items-center px-1 ${darkMode ? 'bg-primary' : 'bg-slate-300'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${darkMode ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
        </section>

        {/* ── Financial Targets ── */}
        <section className="bg-surface-container-lowest rounded-3xl p-8 shadow-card-sm border border-surface-container">
          <h2 className="text-lg font-manrope font-bold text-on-surface mb-6">Financial Targets</h2>
          <div className="space-y-4">
            <div className="space-y-1.5 px-1">
              <label className="text-[10px] font-inter font-bold uppercase tracking-widest text-slate-400 ml-1">
                Monthly Budget Limit (USD)
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-5 text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full bg-surface-container-high rounded-2xl pl-10 pr-5 py-4 text-sm font-inter text-on-surface border-none focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── AI Configuration ── */}
        <section className="bg-surface-container-lowest rounded-3xl p-8 shadow-card-sm border border-surface-container">
          <h2 className="text-lg font-manrope font-bold text-on-surface mb-2">AI Configuration</h2>
          <p className="text-sm text-slate-500 font-inter mb-6">
            Connect your own Gemini API key so AI features work without relying on a shared backend key.
          </p>

          {/* Info card */}
          <div className="bg-tertiary-container/10 border border-tertiary/20 rounded-2xl p-5 mb-6">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-tertiary text-xl flex-shrink-0 mt-0.5">info</span>
              <div className="text-sm text-on-tertiary-container font-inter">
                <p className="font-bold mb-2">How it works:</p>
                <ol className="space-y-1 list-decimal list-inside text-xs leading-relaxed">
                  <li>Get a free API key at <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="underline font-bold">aistudio.google.com/apikey</a></li>
                  <li>Copy your key and paste it in the field below</li>
                  <li>Click <strong>"Update Key"</strong> to save</li>
                  <li>Your key is stored locally in your browser — never sent to any third party</li>
                </ol>
                <p className="mt-3 text-[10px] text-on-tertiary-container/70">
                  Free tier: 1,500 requests/day for Gemini 2.0 Flash. No credit card required.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5 px-1">
              <label className="text-[10px] font-inter font-bold uppercase tracking-widest text-slate-400 ml-1">
                Gemini API Key
              </label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  placeholder="AIzaSy..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full bg-surface-container-high rounded-2xl px-5 py-4 pr-12 text-sm font-inter text-on-surface border-none focus:ring-2 focus:ring-primary/20 outline-none placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">
                    {showKey ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 italic px-1">
                Stored locally in your browser only. Not sent to external servers.
              </p>
            </div>

            <button
              onClick={handleSave}
              className="py-3 px-6 bg-primary text-white rounded-xl font-manrope font-bold text-sm hover:bg-primary-dim transition-all active:scale-95 flex items-center gap-2"
            >
              {saved ? (
                <><span className="material-symbols-outlined text-sm">check</span> Saved!</>
              ) : (
                <><span className="material-symbols-outlined text-sm">save</span> Update Key</>
              )}
            </button>
          </div>
        </section>

        {/* ── Danger Zone ── */}
        <section className="bg-surface-container-lowest rounded-3xl p-8 shadow-card-sm border border-error/20">
          <h2 className="text-lg font-manrope font-bold text-error mb-2">Danger Zone</h2>
          <p className="text-sm text-slate-500 font-inter mb-4">
            Clear all stored data from your browser. This does not delete expenses from the database.
          </p>
          <button
            onClick={() => {
              if (confirm('Clear all local settings (theme, API key, budget)? This cannot be undone.')) {
                localStorage.removeItem(STORAGE_KEY_API);
                localStorage.removeItem(STORAGE_KEY_BUDGET);
                localStorage.removeItem('theme');
                setApiKey('');
                setBudget('5000');
              }
            }}
            className="py-2.5 px-6 bg-error-container text-on-error-container rounded-xl font-inter font-bold text-sm hover:opacity-80 transition-all"
          >
            Clear Local Settings
          </button>
        </section>

      </div>
    </div>
  );
}
