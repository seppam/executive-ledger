import React, { useState, useEffect } from 'react';
import { getExpenses } from '../services/expenseService';

export default function Profile() {
  const [txnCount, setTxnCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await getExpenses();
        setTxnCount(data.length);
      } catch (err) {
        console.error('Failed to fetch profile stats:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="px-10 py-8 pb-16 max-w-4xl mx-auto">
      <header className="mb-10 text-center">
        <div className="w-24 h-24 rounded-full bg-slate-800 mx-auto mb-6 flex items-center justify-center border-4 border-surface-container shadow-xl">
          <span className="material-symbols-outlined text-white text-5xl">person</span>
        </div>
        <h1 className="text-3xl font-manrope font-extrabold text-on-surface tracking-tight">
          Alex Sterling
        </h1>
        <p className="text-xs text-slate-500 font-inter uppercase tracking-widest mt-1">
          Premium Member Since 2023
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account Info */}
        <div className="bg-surface-container-lowest rounded-3xl p-8 shadow-card-sm border border-surface-container flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-manrope font-bold text-on-surface mb-2">Account Overview</h2>
            <p className="text-sm text-slate-500 font-inter mb-6">Linked financial instruments and verified status</p>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-surface-container/50">
              <span className="text-xs font-inter font-bold text-slate-400 uppercase tracking-wider">Status</span>
              <span className="px-3 py-1 bg-tertiary-container/10 text-tertiary rounded-full text-[10px] font-bold uppercase tracking-widest">Active</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-surface-container/50">
              <span className="text-xs font-inter font-bold text-slate-400 uppercase tracking-wider">Portfolio ID</span>
              <span className="text-sm font-manrope font-bold text-on-surface">#EXEC-7729</span>
            </div>
          </div>
        </div>

        {/* Activity Summary */}
        <div className="bg-primary rounded-3xl p-8 text-on-primary shadow-xl flex flex-col justify-between min-h-[200px]">
          <div>
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-6">
              <span className="material-symbols-outlined">analytics</span>
            </div>
            <h2 className="text-lg font-manrope font-bold">Activity Summary</h2>
            <p className="text-xs text-white/70 font-inter mt-1">Lifecycle transaction volume</p>
          </div>
          
          <div className="mt-8">
            <p className="text-4xl font-manrope font-extrabold tracking-tight">
              {loading ? '...' : txnCount}
            </p>
            <p className="text-[10px] uppercase font-bold tracking-widest mt-1 opacity-70">
              Total Transactions Logged
            </p>
          </div>
        </div>
      </div>

      {/* Linked Accounts Placeholder */}
      <div className="mt-10 bg-surface-container-low rounded-3xl p-8 border-2 border-dashed border-outline-variant/40">
        <div className="flex items-center gap-4 text-slate-400">
          <span className="material-symbols-outlined text-4xl">account_balance</span>
          <div>
            <h3 className="font-manrope font-bold text-slate-600">Connect Global Ledger</h3>
            <p className="text-xs font-inter">Sync your international brokerage or banking accounts for holistic AI mapping.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
