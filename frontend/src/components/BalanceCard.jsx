import React from 'react';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function BalanceCard({ balance = '$0.00', changePercent = null, byMonth = {}, isLoading = false }) {
  // Build array of last 7 months for the bar chart
  const now = new Date();
  const chartMonths = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    chartMonths.push({
      label: MONTH_NAMES[d.getMonth()],
      amount: byMonth[d.getMonth() + 1] || 0,
    });
  }

  const maxAmt = Math.max(...chartMonths.map((m) => m.amount), 1);
  const curMonthLabel = MONTH_NAMES[now.getMonth()];

  return (
    <div className="bg-surface-container-lowest rounded-4xl p-10 flex flex-col justify-between shadow-card h-full min-h-[220px]">
      <div>
        {/* Header row */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <span className="text-xs font-inter font-bold uppercase tracking-[0.2em] text-slate-400">
              Total Spending
            </span>
            <h2 className="text-5xl font-manrope font-extrabold text-on-surface mt-2 tracking-tight">
              {isLoading ? (
                <span className="opacity-40 text-3xl font-manrope italic">loading…</span>
              ) : (
                balance
              )}
            </h2>
          </div>

          {/* Change badge */}
          {changePercent !== null && (
            <div className="flex flex-col items-end">
              <div
                className={`px-3 py-1 rounded-full flex items-center gap-1 text-sm font-bold ${
                  Number(changePercent) >= 0
                    ? 'bg-error-container/30 text-error'
                    : 'bg-tertiary-container/20 text-tertiary'
                }`}
              >
                <span className="material-symbols-outlined text-sm">
                  {Number(changePercent) >= 0 ? 'trending_up' : 'trending_down'}
                </span>
                {Math.abs(Number(changePercent))}%
              </div>
              <span className="text-[10px] text-slate-400 mt-2 uppercase tracking-widest">
                vs Last Month
              </span>
            </div>
          )}
        </div>

        {/* Monthly bar chart — last 7 months */}
        <div className="flex gap-2 items-end h-20">
          {chartMonths.map((m, i) => {
            const heightPct = (m.amount / maxAmt) * 100;
            const isActive  = m.label === curMonthLabel;
            return (
              <div
                key={i}
                className="flex-1 flex flex-col items-center gap-1"
                title={`${m.label}: $${m.amount.toFixed(2)}`}
              >
                <div
                  className={`w-full rounded-t-md transition-all duration-300 ${
                    isActive ? 'bg-primary' : 'bg-surface-container hover:bg-surface-container-high'
                  }`}
                  style={{ height: `${Math.max(heightPct, 4)}%` }}
                />
                <span className="text-[9px] text-slate-400 font-inter">{m.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
