import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import BalanceCard from '../components/BalanceCard';
import AIInsightCard from '../components/AIInsightCard';
import TransactionRow from '../components/TransactionRow';
import { getSpendingInsights } from '../services/geminiService';
import {
  getExpenses,
  getStatsData,
  getBudgetProgressData,
} from '../services/expenseService';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function Dashboard() {
  const { refreshSeed } = useOutletContext();

  const [transactions, setTransactions] = useState([]);
  const [stats, setStats]               = useState(null);
  const [budgetProgress, setBudgetProgress] = useState(null);
  const [budgetAlerts, setBudgetAlerts]  = useState([]);
  const [insight, setInsight]           = useState(null);
  const [loading, setLoading]           = useState(false);
  const [fetching, setFetching]          = useState(true);
  const [error, setError]                = useState(null);

  const loadData = useCallback(async () => {
    setFetching(true);
    setError(null);
    try {
      const [expensesData, statsData, budgetData] = await Promise.all([
        getExpenses(),
        getStatsData(),
        getBudgetProgressData(),
      ]);
      setTransactions(expensesData);
      setStats(statsData);
      setBudgetProgress(budgetData);
      // Derive alerts from budget progress
      setBudgetAlerts(budgetData.filter((b) => b.percent >= 80).map((b) => ({
        category: b.category,
        percent: b.percent,
        status: b.percent >= 100 ? 'exceeded' : 'warning',
      })));
    } catch (err) {
      setError(`Failed to load: ${err.message}`);
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [refreshSeed]);
  useEffect(() => { loadData(); }, []);

  function calcChange(stats) {
    const cur  = new Date().getMonth() + 1;
    const prev = cur === 1 ? 12 : cur - 1;
    const c = stats.byMonth[cur]  || { income: 0, expense: 0 };
    const p = stats.byMonth[prev] || { income: 0, expense: 0 };
    const curExp  = c.expense  || 0;
    const prevExp = p.expense  || 0;
    if (prevExp === 0) return null;
    return ((curExp - prevExp) / prevExp * 100).toFixed(1);
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

  const change    = stats ? calcChange(stats) : null;
  const recent   = transactions.slice(0, 6);

  // Format IDR amounts: show as "Rp X.XXX.XXX"
  const fmtIDR = (n) => `Rp ${Number(n || 0).toLocaleString('id-ID')}`;
  const fmtNet = (n) => (n >= 0 ? `+ Rp ${Number(n || 0).toLocaleString('id-ID')}` : `- Rp ${Number(Math.abs(n) || 0).toLocaleString('id-ID')}`);

  return (
    <>
      <header className="flex justify-between items-center w-full px-8 py-5 sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-surface-container">
        <div className="flex items-center gap-3 bg-surface-container-low rounded-full px-4 py-2 w-96">
          <span className="material-symbols-outlined text-slate-400 text-[20px]">search</span>
          <input type="text" placeholder="Search transactions…"
            className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-slate-400 outline-none" />
        </div>
        <div className="flex items-center gap-2">
          <button className={`relative hover:bg-surface-container rounded-full p-2 transition-colors ${budgetAlerts.length > 0 ? 'text-error' : 'text-slate-500'}`}>
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            {budgetAlerts.length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-error rounded-full border-2 border-background" />
            )}
          </button>
        </div>
      </header>

      <div className="px-10 py-8 pb-16 max-w-7xl mx-auto">
        <div className="mb-8">
          <p className="text-[10px] font-inter font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Overview</p>
          <h1 className="text-3xl font-manrope font-extrabold text-on-surface tracking-tight">Dashboard</h1>
        </div>

        {/* Budget alerts */}
        {budgetAlerts.map((alert, i) => (
          <div key={alert.category + i}
            className={`mb-4 px-5 py-3 rounded-xl text-sm font-inter flex items-center gap-2 ${
              alert.status === 'exceeded'
                ? 'bg-error text-on-error-container'
                : 'bg-warning-container text-on-warning-container'
            }`}>
            <span className="material-symbols-outlined text-[18px]">
              {alert.status === 'exceeded' ? 'warning' : 'info'}
            </span>
            <strong>{alert.category}:</strong>
            {alert.status === 'exceeded' ? 'Budget exceeded!' : `You've used ${alert.percent}% of your ${alert.category} budget.`}
          </div>
        ))}

        {/* Hero grid */}
        <div className="grid grid-cols-12 gap-6 mb-10">
          <div className="col-span-12 lg:col-span-7">
            <BalanceCard
              balance={stats ? fmtNet(stats.netBalance) : 'Rp 0'}
              totalIncome={stats ? stats.totalIncome : 0}
              totalExpense={stats ? stats.totalExpense : 0}
              byMonth={stats?.byMonth ?? {}}
              changePercent={change}
              isLoading={fetching}
            />
          </div>
          <div className="col-span-12 lg:col-span-5">
            <AIInsightCard insight={insight} loading={loading} onGenerateClick={handleGenerateInsight} />
          </div>
        </div>

        {/* Budget progress bars */}
        {budgetProgress && budgetProgress.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-manrope font-extrabold text-on-surface mb-4">Budget Progress — This Month</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {budgetProgress.map((b) => (
                <div key={b.category} className="bg-surface-container-low rounded-2xl p-5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-inter font-bold text-sm text-on-surface">{b.category}</span>
                    <span className={`font-manrope font-bold text-sm ${b.percent >= 100 ? 'text-error' : 'text-slate-600'}`}>
                      {fmtIDR(b.spent)} / {fmtIDR(b.limit)}
                    </span>
                  </div>
                  <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        b.percent >= 100 ? 'bg-error' : b.percent >= 80 ? 'bg-warning' : 'bg-primary'
                      }`}
                      style={{ width: `${Math.min(b.percent, 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 font-inter uppercase tracking-widest">
                    {b.percent}% used
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

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
                    <th key={col} className={`pb-5 text-[10px] font-inter font-bold uppercase tracking-[0.2em] text-slate-400 px-4 ${col === 'Amount' ? 'text-right' : ''}`}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container/40">
                {fetching ? (
                  <tr><td colSpan="4" className="py-10 text-center text-slate-400 italic">Loading…</td></tr>
                ) : transactions.length === 0 ? (
                  <tr><td colSpan="4" className="py-10 text-center text-slate-400 italic">No transactions yet. Add your first one!</td></tr>
                ) : recent.map((tx, i) => (
                  <TransactionRow
                    key={tx.id || i}
                    date={tx.date}
                    description={tx.description}
                    category={tx.category}
                    amount={tx.amount}
                    isPositive={tx.type === 'income'}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          <div className="bg-surface-container-low rounded-3xl p-6">
            <span className="text-[10px] font-inter font-bold uppercase tracking-widest text-slate-400">Upcoming Bills</span>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="font-manrope font-bold text-lg text-on-surface">Adobe Creative</p>
                <p className="text-xs text-slate-500 mt-0.5">Due in 3 days</p>
              </div>
              <p className="font-manrope font-bold text-on-surface">Rp 890.000</p>
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
