import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch, apiPost, apiDel } from '../services/apiClient';

const API = import.meta.env.VITE_API_URL;
const CATEGORIES = [
  'Food & Dining','Transport','Rent & Utilities','Entertainment',
  'Software/SaaS','Travel','Investments','Health','Others',
];

export default function Settings() {
  const { user, logout } = useAuth();

  // ── API key ────────────────────────────────────────────────────────────────
  const [apiKey, setApiKey]        = useState(() => localStorage.getItem('expense_tracker_api_key') || '');
  const [showKey, setShowKey]      = useState(false);
  const [keySaved, setKeySaved]    = useState(false);

  // ── Budgets ────────────────────────────────────────────────────────────────
  const [budgets, setBudgets]       = useState([]); // { category, limit }
  const [budgetDrafts, setBudgetDrafts] = useState({}); // { category: limit_str }
  const [budgetSaving, setBudgetSaving] = useState(false);
  const [budgetSaved, setBudgetSaved]    = useState(false);

  // ── Email SMTP ────────────────────────────────────────────────────────────
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [emailForm, setEmailForm]     = useState({ host: '', port: '587', user: '', pass: '' });
  const [emailSaved, setEmailSaved]   = useState(false);

  // ── Invite ────────────────────────────────────────────────────────────────
  const [inviteEmail, setInviteEmail]   = useState('');
  const [inviteRole, setInviteRole]     = useState('viewer');
  const [invites, setInvites]           = useState([]);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError]   = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');

  const canInvite = user?.role === 'editor' || user?.role === 'owner';

  // ── Load budgets + invites on mount ────────────────────────────────────────
  useEffect(() => {
    loadBudgets();
    if (canInvite) loadInvites();
  }, []);

  async function loadBudgets() {
    try {
      const data = await apiFetch('/api/budgets', localStorage.getItem('auth_token') ? { headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` } } : {});
      const h = { Authorization: `Bearer ${localStorage.getItem('auth_token')}`, 'x-api-key': localStorage.getItem('expense_tracker_api_key') || '' };
      const r = await fetch(`${API}/api/budgets`, { headers: h });
      const j = await r.json();
      if (Array.isArray(j)) { setBudgets(j); setBudgetDrafts(Object.fromEntries(j.map((b) => [b.category, String(b.limit)]))); }
    } catch {}
  }

  async function loadInvites() {
    try {
      const h = { Authorization: `Bearer ${localStorage.getItem('auth_token')}`, 'x-api-key': localStorage.getItem('expense_tracker_api_key') || '' };
      const r = await fetch(`${API}/api/auth/invites`, { headers: h });
      if (r.ok) { const j = await r.json(); setInvites(Array.isArray(j) ? j : []); }
    } catch {}
  }

  function handleSaveApiKey() {
    localStorage.setItem('expense_tracker_api_key', apiKey.trim());
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2000);
  }

  async function handleSaveBudgets() {
    setBudgetSaving(true);
    try {
      const h = { Authorization: `Bearer ${localStorage.getItem('auth_token')}`, 'x-api-key': localStorage.getItem('expense_tracker_api_key') || '' };
      for (const [category, limitStr] of Object.entries(budgetDrafts)) {
        const limit = parseFloat(limitStr);
        if (!isNaN(limit) && limit > 0) {
          await fetch(`${API}/api/budgets`, {
            method: 'POST', headers: h,
            body: JSON.stringify({ category, limit }),
          });
        }
      }
      setBudgetSaved(true);
      setTimeout(() => setBudgetSaved(false), 2000);
      loadBudgets();
    } catch {}
    setBudgetSaving(false);
  }

  async function handleInvite(e) {
    e.preventDefault();
    setInviteLoading(true);
    setInviteError('');
    setInviteSuccess('');
    try {
      const h = { Authorization: `Bearer ${localStorage.getItem('auth_token')}`, 'Content-Type': 'application/json' };
      const r = await fetch(`${API}/api/auth/invite`, {
        method: 'POST', headers: h,
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      const data = await r.json();
      if (!r.ok) { setInviteError(data.message); return; }
      setInviteSuccess(`Invite sent! Share this link:\n${data.inviteLink}`);
      setInviteEmail('');
      loadInvites();
    } catch { setInviteError('Failed to send invite.'); }
    setInviteLoading(false);
  }

  async function handleRevokeInvite(id) {
    if (!confirm('Cancel this invitation?')) return;
    const h = { Authorization: `Bearer ${localStorage.getItem('auth_token')}` };
    await fetch(`${API}/api/auth/invite/${id}`, { method: 'DELETE', headers: h });
    loadInvites();
  }

  return (
    <div className="px-10 py-8 pb-16 max-w-4xl mx-auto">
      <header className="mb-10">
        <p className="text-[10px] font-inter font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Preferences</p>
        <h1 className="text-3xl font-manrope font-extrabold text-on-surface tracking-tight">Settings</h1>
      </header>

      <div className="space-y-6">

        {/* ── Account ── */}
        <section className="bg-surface-container-lowest rounded-3xl p-8 shadow-card-sm border border-surface-container">
          <h2 className="text-lg font-manrope font-bold text-on-surface mb-6">Account</h2>
          <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-manrope font-extrabold text-xl">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <p className="font-manrope font-bold text-on-surface">{user?.name}</p>
                <p className="text-sm text-slate-500 font-inter">{user?.email}</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">{user?.role}</span>
          </div>
        </section>

        {/* ── AI Configuration ── */}
        <section className="bg-surface-container-lowest rounded-3xl p-8 shadow-card-sm border border-surface-container">
          <h2 className="text-lg font-manrope font-bold text-on-surface mb-2">AI Configuration</h2>
          <p className="text-sm text-slate-500 font-inter mb-6">Connect your own Gemini API key so AI features work reliably without hitting shared limits.</p>

          <div className="bg-tertiary-container/10 border border-tertiary/20 rounded-2xl p-5 mb-6">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-tertiary text-xl flex-shrink-0">info</span>
              <div className="text-sm text-on-tertiary-container font-inter text-xs leading-relaxed">
                <p className="font-bold mb-2">How to get your Gemini API key:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Go to <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="underline font-bold">aistudio.google.com/apikey</a></li>
                  <li>Click <strong>"Create API Key"</strong></li>
                  <li>Copy the key (starts with <code className="bg-black/10 px-1 rounded">AIza…</code>)</li>
                  <li>Paste it below and click <strong>"Update Key"</strong></li>
                </ol>
                <p className="mt-3 text-[10px] text-on-tertiary-container/70">Free tier: 1,500 requests/day for Gemini 2.0 Flash. No credit card required.</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5 px-1">
              <label className="text-[10px] font-inter font-bold uppercase tracking-widest text-slate-400 ml-1">Gemini API Key</label>
              <div className="relative">
                <input type={showKey ? 'text' : 'password'} placeholder="AIzaSy…"
                  value={apiKey} onChange={(e) => setApiKey(e.target.value)}
                  className="w-full bg-surface-container-high rounded-2xl px-5 py-4 pr-12 text-sm font-inter text-on-surface border-none focus:ring-2 focus:ring-primary/20 outline-none placeholder:text-slate-400" />
                <button type="button" onClick={() => setShowKey(!showKey)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  <span className="material-symbols-outlined text-xl">{showKey ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
              <p className="text-[10px] text-slate-400 italic px-1">Stored locally in your browser only. Never sent to third parties.</p>
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
          <p className="text-sm text-slate-500 font-inter mb-6">Set a spending limit per category. You'll see a warning when you reach 80% and 100%.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {CATEGORIES.map((cat) => (
              <div key={cat} className="space-y-1">
                <label className="text-[10px] font-inter font-bold uppercase tracking-widest text-slate-400 ml-1">{cat}</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input type="number" step="1" placeholder="No limit"
                    value={budgetDrafts[cat] || ''}
                    onChange={(e) => setBudgetDrafts((p) => ({ ...p, [cat]: e.target.value }))}
                    className="w-full bg-surface-container-high rounded-2xl pl-9 pr-4 py-3 text-sm font-inter text-on-surface border-none focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>
              </div>
            ))}
          </div>
          <button onClick={handleSaveBudgets} disabled={budgetSaving}
            className="py-3 px-6 bg-primary text-white rounded-xl font-manrope font-bold text-sm hover:bg-primary-dim transition-all active:scale-95 flex items-center gap-2 disabled:opacity-60">
            {budgetSaving ? <><span className="animate-spin material-symbols-outlined text-sm">progress_activity</span>Saving…</> : budgetSaved ? <><span className="material-symbols-outlined text-sm">check</span> Saved!</> : <><span className="material-symbols-outlined text-sm">save</span> Save Budgets</>}
          </button>
        </section>

        {/* ── Team Invitations ── */}
        {canInvite && (
          <section className="bg-surface-container-lowest rounded-3xl p-8 shadow-card-sm border border-surface-container">
            <h2 className="text-lg font-manrope font-bold text-on-surface mb-2">Invite Team Members</h2>
            <p className="text-sm text-slate-500 font-inter mb-6">
              Invite others to view or edit your expense data. They'll receive a unique link.
            </p>

            <form onSubmit={handleInvite} className="flex gap-3 mb-6 flex-wrap">
              <input type="email" required placeholder="colleague@example.com"
                value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
                className="flex-1 min-w-48 bg-surface-container-high rounded-2xl px-5 py-3 text-sm font-inter text-on-surface border-none focus:ring-2 focus:ring-primary/20 outline-none" />
              <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}
                className="bg-surface-container-high rounded-2xl px-4 py-3 text-sm font-inter text-on-surface border-none outline-none appearance-none">
                <option value="viewer">Viewer (read-only)</option>
                <option value="editor">Editor (can add/edit)</option>
              </select>
              <button type="submit" disabled={inviteLoading}
                className="py-3 px-6 bg-primary text-white rounded-xl font-manrope font-bold text-sm hover:bg-primary-dim transition-all active:scale-95 disabled:opacity-60 flex items-center gap-2">
                {inviteLoading ? <span className="animate-spin material-symbols-outlined text-sm">progress_activity</span> : <span className="material-symbols-outlined text-sm">send</span>}
                {inviteLoading ? 'Sending…' : 'Send Invite'}
              </button>
            </form>

            {inviteError && (
              <div className="mb-4 px-4 py-3 bg-error-container text-on-error-container rounded-xl text-sm font-inter flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">error</span>{inviteError}
              </div>
            )}
            {inviteSuccess && (
              <div className="mb-4 px-4 py-3 bg-tertiary-container text-on-tertiary-container rounded-xl text-sm font-inter whitespace-pre-line">
                <span className="material-symbols-outlined text-[16px] mr-2">link</span>{inviteSuccess}
              </div>
            )}

            {invites.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-inter font-bold uppercase tracking-widest text-slate-400">Pending Invitations</p>
                {invites.filter((i) => !i.accepted).map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between p-4 bg-surface-container-low rounded-2xl">
                    <div>
                      <p className="font-inter font-bold text-sm text-on-surface">{inv.email}</p>
                      <p className="text-xs text-slate-500 font-inter">{inv.role} · Expires {new Date(inv.expiresAt).toLocaleDateString()}</p>
                    </div>
                    <button onClick={() => handleRevokeInvite(inv.id)}
                      className="p-2 rounded-xl hover:bg-error-container text-slate-400 hover:text-error transition-all">
                      <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── Email Setup ── */}
        <section className="bg-surface-container-lowest rounded-3xl p-8 shadow-card-sm border border-surface-container">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-manrope font-bold text-on-surface">Email Setup</h2>
            <button onClick={() => setEmailEnabled(!emailEnabled)}
              className={`w-12 h-6 rounded-full transition-all duration-300 flex items-center px-1 ${emailEnabled ? 'bg-primary' : 'bg-slate-300'}`}>
              <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${emailEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
          <p className="text-sm text-slate-500 font-inter mb-6">Enable email reports and invitation delivery via Gmail SMTP.</p>

          <div className="bg-tertiary-container/10 border border-tertiary/20 rounded-2xl p-5 mb-6">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-tertiary text-xl flex-shrink-0">info</span>
              <div className="text-xs text-on-tertiary-container font-inter space-y-1.5">
                <p className="font-bold">How to set up Gmail SMTP:</p>
                <ol className="list-decimal list-inspace space-y-1">
                  <li>Go to <a href="https://myaccount.google.com/security" target="_blank" rel="noopener noreferrer" className="underline font-bold">myaccount.google.com/security</a></li>
                  <li>Enable <strong>2-Step Verification</strong> first</li>
                  <li>Go to <strong>App passwords</strong> (search for it at the top)</li>
                  <li>Select app: <em>Mail</em>, Select device: <em>Other (Custom name)</em></li>
                  <li>Copy the 16-character password (e.g. <code className="bg-black/10 px-1 rounded">abcd efgh ijkl mnop</code>)</li>
                  <li>Paste the App Password below — NOT your regular Gmail password</li>
                </ol>
                <p className="text-[10px] text-on-tertiary-container/70 mt-2">SMTP host: <code>smtp.gmail.com</code> · Port: <code>587</code> (TLS) or <code>465</code> (SSL)</p>
              </div>
            </div>
          </div>

          {emailEnabled && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-inter font-bold uppercase tracking-widest text-slate-400 ml-1">SMTP Host</label>
                <input value={emailForm.host} onChange={(e) => setEmailForm((p) => ({ ...p, host: e.target.value }))}
                  placeholder="smtp.gmail.com"
                  className="w-full bg-surface-container-high rounded-2xl px-5 py-3 text-sm font-inter text-on-surface border-none focus:ring-2 focus:ring-primary/20 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-inter font-bold uppercase tracking-widest text-slate-400 ml-1">Port</label>
                <input value={emailForm.port} onChange={(e) => setEmailForm((p) => ({ ...p, port: e.target.value }))}
                  placeholder="587"
                  className="w-full bg-surface-container-high rounded-2xl px-5 py-3 text-sm font-inter text-on-surface border-none focus:ring-2 focus:ring-primary/20 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-inter font-bold uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                <input type="email" value={emailForm.user} onChange={(e) => setEmailForm((p) => ({ ...p, user: e.target.value }))}
                  placeholder="your@gmail.com"
                  className="w-full bg-surface-container-high rounded-2xl px-5 py-3 text-sm font-inter text-on-surface border-none focus:ring-2 focus:ring-primary/20 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-inter font-bold uppercase tracking-widest text-slate-400 ml-1">App Password</label>
                <input type="password" value={emailForm.pass} onChange={(e) => setEmailForm((p) => ({ ...p, pass: e.target.value }))}
                  placeholder="xxxx xxxx xxxx xxxx"
                  className="w-full bg-surface-container-high rounded-2xl px-5 py-3 text-sm font-inter text-on-surface border-none focus:ring-2 focus:ring-primary/20 outline-none" />
              </div>
            </div>
          )}
        </section>

        {/* ── Export ── */}
        <section className="bg-surface-container-lowest rounded-3xl p-8 shadow-card-sm border border-surface-container">
          <h2 className="text-lg font-manrope font-bold text-on-surface mb-6">Export Data</h2>
          <div className="flex gap-4 flex-wrap">
            <a href={`${API}/api/export/csv`}
              className="flex items-center gap-2 py-3 px-6 bg-surface-container text-on-surface rounded-xl font-inter font-bold text-sm hover:bg-surface-container-high transition-all">
              <span className="material-symbols-outlined text-lg">download</span>
              Download CSV
            </a>
            <a href={`${API}/api/export/pdf`}
              className="flex items-center gap-2 py-3 px-6 bg-surface-container text-on-surface rounded-xl font-inter font-bold text-sm hover:bg-surface-container-high transition-all">
              <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
              Download PDF Report
            </a>
          </div>
        </section>

        {/* ── Danger Zone ── */}
        <section className="bg-surface-container-lowest rounded-3xl p-8 shadow-card-sm border border-error/20">
          <h2 className="text-lg font-manrope font-bold text-error mb-2">Danger Zone</h2>
          <p className="text-sm text-slate-500 font-inter mb-4">Clear local settings from your browser. This does not affect your data.</p>
          <button onClick={() => { if (confirm('Clear all local settings?')) { logout(); } }}
            className="py-2.5 px-6 bg-error-container text-on-error-container rounded-xl font-inter font-bold text-sm hover:opacity-80 transition-all">
            Sign Out
          </button>
        </section>

      </div>
    </div>
  );
}
