import React from 'react';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function BalanceCard({ balance = '$0.00', changePercent = null, byMonth = {}, isLoading = false }) {
  const now = new Date();
  const chartMonths = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = d.getMonth() + 1;
    const monthData = byMonth[monthKey];
    const amount = (monthData && monthData.expense) ? Number(monthData.expense) : 0;
    chartMonths.push({
      label: MONTH_NAMES[d.getMonth()],
      amount: amount,
    });
  }

  const maxAmt = Math.max(...chartMonths.map(function(m) { return m.amount; }), 1);
  const curMonthLabel = MONTH_NAMES[now.getMonth()];

  return (
    <div className="bg-white rounded-2xl p-8 flex flex-col justify-between shadow-sm border border-gray-100 h-full min-h-[220px]">
      <div>
        <div className="flex justify-between items-start mb-6">
          <div>
            <span className="text-xs font-sans font-bold uppercase tracking-wider text-gray-400">
              Total Spending
            </span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2 tracking-tight">
              {isLoading ? (
                <span className="opacity-40 text-2xl italic">loading…</span>
              ) : (
                balance
              )}
            </h2>
          </div>

          {changePercent !== null && (
            <div className="flex flex-col items-end">
              <div
                className={'px-3 py-1 rounded-full flex items-center gap-1 text-sm font-bold ' +
                  (Number(changePercent) >= 0
                    ? 'bg-red-50 text-red-600'
                    : 'bg-green-50 text-green-600')
                }
              >
                <span>{Number(changePercent) >= 0 ? '↑' : '↓'}</span>
                {Math.abs(Number(changePercent))}%
              </div>
              <span className="text-[10px] text-gray-400 mt-2 uppercase tracking-wider">
                vs Last Month
              </span>
            </div>
          )}
        </div>

        {/* Monthly bar chart */}
        <div className="flex gap-1.5 items-end h-16">
          {chartMonths.map(function(m, i) {
            var heightPct = Math.max((m.amount / maxAmt) * 100, 3);
            var isActive = m.label === curMonthLabel;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={'w-full rounded-t transition-all ' + (isActive ? 'bg-blue-600' : 'bg-gray-200 hover:bg-gray-300')}
                  style={{ height: heightPct + '%' }}
                />
                <span className="text-[8px] text-gray-400">{m.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
