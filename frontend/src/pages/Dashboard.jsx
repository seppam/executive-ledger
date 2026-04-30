import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import BalanceCard from '../components/BalanceCard';
import AIInsightCard from '../components/AIInsightCard';
import TransactionRow from '../components/TransactionRow';
import { getSpendingInsights } from '../services/geminiService';
import { getExpenses, getStats } from '../services/expenseService';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function Dashboard() {
  // refreshSeed signal — incremented by Layout after modal saves
  const { refreshSeed } = useOutletContext();

  const [transactions, setTransactions] = useState([]);
  const [stats, setStats]                 = useState(null);
  const [insight, setInsight]             = useState(null);
  const [loading, setLoading]             = useState(false);
  const [fetching, setFetching]           = useState(true);
  const [error, setError]                 = useState(null);

  const loadData = useCallback(async () => {
    setFetching(true);
    setError(null);
    try {
      const [expensesData, statsData] = await Promise.all([getExpenses(), getStats()]);
      setTransactions(expensesData);
      setStats(statsData);
    } catch (err) {
      setError(`Failed to load data: ${err.message}`);
      console.error(err);
    } finally {
      setFetching(false);
    }
  }, []);

  // Reload whenever a new expense is added via modal
  useEffect(() => { loadData(); }, [refreshSeed, loadData]);

  // Initial load
  useEffect(() => { loadData(); }, []);

  function calcChange(stats) {
    const curMonth  = new Date().getMonth() + 1;
    const prevMonth = curMonth === 1 ? 12 : curMonth - 1;
    const cur  = stats.byMonth[curMonth]  || 0;
    const prev = stats.byMonth[prevMonth] || 0;
    if (prev === 0) return null;
    return ((cur - prev) / prev * 100).toFixed(1);
  }

  async function handleGenerateInsight() {
    if (transactions.length === 0) { setError('Add some transactions first.'); return; }
    setLoading(true);
    setError(null);
    try {
      const result = await getSpendingInsights(transactions);
      setInsight(result);
    } catch (err) {
      setError(err.code === 'NO_API_KEY' ? err.message : `Insight failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  const change   = stats ? calcChange(stats) : null;
  const recent   = transactions.slice(0, 6);
  const fmtTotal = (n) => `$${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  return (
    <>
      {/* Top nav bar */}
      <header className="flex justify-between items-center w-full px-8 py-5 sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-surface-container">
        <div className="flex items-center gap-3 bg-surface-container-low rounded-full px-4 py-2 w-96">
          <span className="material-symbols-outlined text-slate-400 text-[20px]">search</span>
          <input type="text" placeholder="Search transactions…"
            className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-slate-400 outline-none" />
        </div>
        <div className="flex items-center gap-2">
          <button className="hover:bg-surface-container rounded-full p-2 text-slate-500 transition-colors">
            <span className="material-symbols-outlined text-[22px]">notifications</span>
          </button>
          <button className="hover:bg-surface-container rounded-full p-2 text-slate-500 transition-colors">
            <span className="material-symbols-outlined text-[22px]">history_edu</span>
          </button>
        </div>
      </header>

      <div className="px-10 py-8 pb-16 max-w-7xl mx-auto">

        {/* Page heading */}
        <div className="mb-8">
          <p className="text-[10px] font-inter font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Overview</p>
          <h1 className="text-3xl font-manrope font-extrabold text-on-surface tracking-tight">Dashboard</h1>
        </div>

        {/* Hero grid */}
        <div className="grid grid-cols-12 gap-6 mb-10">
          <div className="col-span-12 lg:col-span-7">
            <BalanceCard
              balance={stats ? fmtTotal(stats.total) : '$0.00'}
              changePercent={change}
              byMonth={stats?.byMonth ?? {}}
              isLoading={fetching}
            />
          </div>
          <div className="col-span-12 lg:col-span-5">
            <AIInsightCard insight={insight} loading={loading} onGenerateClick={handleGenerateInsight} />
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-6 px-5 py-3 bg-error-container text-on-error-container rounded-xl text-sm font-inter flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {error}
          </div>
        )}

        {/* Recent transactions */}
        <div className="space-y-5">
          <div className="flex justify-between items-end px-1">
            <div>
              <h2 className="text-2xl font-manrope font-extrabold text-on-surface">Recent Activity</h2>
              <p className="text-sm text-slate-500 font-inter mt-0.5">
                {fetching ? 'Loading…' : `${transactions.length} total transaction${transactions.length !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-4xl p-8 shadow-card-sm overflow-x-auto">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr className="text-left border-b border-surface-container">
                  {['Date','Description','Category','Amount'].map((col) => (
                    <th key={col}
                      className={`pb-5 text-[10px] font-inter font-bold uppercase tracking-[0.2em] text-slate-400 px-4 ${col === 'Amount' ? 'text-right' : ''}`}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container/40">
                {fetching ? (
                  <tr><td colSpan="4" className="py-10 text-center text-slate-400 italic">Loading financial records…</td></tr>
                ) : transactions.length === 0 ? (
                  <tr><td colSpan="4" className="py-10 text-center text-slate-400 italic">No transactions yet. Add your first one!</td></tr>
                ) : recent.map((tx, i) => <TransactionRow key={tx.id || i} {...tx} />)}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom info cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          <div className="bg-surface-container-low rounded-3xl p-6">
            <span className="text-[10px] font-inter font-bold uppercase tracking-widest text-slate-400">Upcoming Bills</span>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="font-manrope font-bold text-lg text-on-surface">Adobe Creative</p>
                <p className="text-xs text-slate-500 mt-0.5">Due in 3 days</p>
              </div>
              <p className="font-manrope font-bold text-on-surface">$52.99</p>
            </div>
          </div>

          <div className="bg-surface-container-low rounded-3xl p-6">
            <span className="text-[10px] font-inter font-bold uppercase tracking-widest text-slate-400">Savings Goal</span>
            <div className="mt-4">
              <div className="flex justify-between items-end mb-2">
                <p className="font-manrope font-bold text-lg text-on-surface">Q4 Portfolio</p>
                <p className="text-xs font-bold text-slate-500">85%</p>
              </div>
              <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full w-[85%] rounded-full transition-all duration-700" />
              </div>
            </div>
          </div>

          <div className="bg-surface-container-low rounded-3xl p-6 flex items-center justify-center border-2 border-dashed border-outline-variant/40">
            <div className="text-center">
              <span className="material-symbols-outlined text-slate-400 text-3xl">add_circle</span>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-2">Connect Account</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
