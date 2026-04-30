import { NavLink } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard',    icon: 'dashboard',              path: '/'           },
  { label: 'Transactions', icon: 'receipt_long',           path: '/expenses'    },
  { label: 'AI Insights',  icon: 'psychology',             path: '/insights'    },
  { label: 'Budgets',      icon: 'account_balance_wallet', path: '/budgets'     },
  { label: 'Reports',      icon: 'analytics',              path: '/reports'     },
];

export default function Sidebar({ openModal }) {
  return (
    <aside className="h-full w-64 fixed left-0 top-0 bg-sidebar flex flex-col p-6 z-50">

      {/* Brand */}
      <div className="mb-10">
        <h1 className="text-xl font-manrope font-extrabold text-white tracking-tight">
          Executive Ledger
        </h1>
        <p className="text-[10px] text-slate-500 font-inter uppercase tracking-widest mt-1">
          Financial Architect
        </p>
      </div>

      {/* New Transaction CTA */}
      <button 
        onClick={openModal}
        className="mb-8 w-full py-3 px-4 bg-gradient-to-br from-primary to-primary-dim text-on-primary rounded-xl font-manrope font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-primary/20"
      >
        <span className="material-symbols-outlined text-lg">add</span>
        New Transaction
      </button>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-xs font-inter font-semibold uppercase tracking-wider ${
              isActive
                ? 'bg-primary text-white'
                : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="mt-auto pt-6 border-t border-slate-800 space-y-1">
        <NavLink
          to="/settings"
          className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-xs font-inter font-semibold uppercase tracking-wider ${
            isActive ? 'bg-primary text-white' : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">settings</span>
          Settings
        </NavLink>

        {/* User Profile */}
        <NavLink to="/profile" className="block group">
          <div className="flex items-center gap-3 px-4 py-3 mt-2 rounded-xl group-hover:bg-white/5 transition-all">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 group-hover:bg-primary transition-colors">
              <span className="material-symbols-outlined text-slate-300 text-[20px] group-hover:text-white">person</span>
            </div>
            <div>
              <p className="text-white text-sm font-bold font-manrope leading-tight">Alex Sterling</p>
              <p className="text-slate-500 text-[10px] uppercase tracking-widest group-hover:text-slate-300 transition-colors">Premium Member</p>
            </div>
          </div>
        </NavLink>
      </div>
    </aside>
  );
}
