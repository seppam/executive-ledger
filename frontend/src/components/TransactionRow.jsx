import React from 'react';

const categoryStyles = {
  'Investments':        'bg-tertiary-container/20 text-tertiary',
  'Food & Dining':     'bg-amber-100 text-amber-700',
  'Transport':         'bg-blue-100 text-blue-700',
  'Rent & Utilities':  'bg-purple-100 text-purple-700',
  'Entertainment':      'bg-pink-100 text-pink-700',
  'Software/SaaS':     'bg-indigo-100 text-indigo-700',
  'Travel':            'bg-teal-100 text-teal-700',
  'Health':            'bg-green-100 text-green-700',
  'Others':            'bg-surface-container text-slate-600',
  default:             'bg-surface-container text-slate-600',
};

const categoryIcons = {
  'Food & Dining':    'restaurant',
  'Transport':       'directions_car',
  'Rent & Utilities': 'home',
  'Entertainment':    'movie',
  'Software/SaaS':   'code',
  'Travel':           'flight',
  'Investments':      'payments',
  'Health':           'fitness_center',
  'Others':           'receipt_long',
};

export default function TransactionRow({ date, description, category, amount, isPositive = false }) {
  const icon       = categoryIcons[category] ?? categoryIcons['Others'];
  const badgeStyle = categoryStyles[category] ?? categoryStyles.default;

  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Math.abs(amount));

  return (
    <tr className="group hover:bg-surface-container-low/50 transition-colors">
      <td className="py-5 px-4">
        <span className="text-sm font-medium text-slate-500 whitespace-nowrap">{date}</span>
      </td>
      <td className="py-5 px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-slate-500 text-[20px]">{icon}</span>
          </div>
          <span className="font-manrope font-bold text-on-surface">{description}</span>
        </div>
      </td>
      <td className="py-5 px-4">
        <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${badgeStyle}`}>
          {category}
        </span>
      </td>
      <td className="py-5 px-4 text-right">
        <span className={`font-manrope font-bold ${isPositive ? 'text-tertiary' : 'text-on-surface'}`}>
          {isPositive ? '+' : '-'}{formattedAmount}
        </span>
      </td>
    </tr>
  );
}
