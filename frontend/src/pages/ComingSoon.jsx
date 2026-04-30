import React from 'react';
import { useLocation } from 'react-router-dom';

export default function ComingSoon() {
  const location = useLocation();
  const pageName = location.pathname.split('/').pop();
  
  const formattedName = pageName.charAt(0).toUpperCase() + pageName.slice(1).replace(/-/g, ' ');

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
      <div className="w-20 h-20 bg-surface-container rounded-[2rem] flex items-center justify-center mb-8 shadow-card-sm border border-white/10 animate-pulse">
        <span className="material-symbols-outlined text-primary text-4xl">construction</span>
      </div>
      
      <p className="text-[10px] font-inter font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">
        Feature in Development
      </p>
      <h1 className="text-4xl font-manrope font-extrabold text-on-surface tracking-tight mb-4">
        {formattedName} Coming Soon
      </h1>
      <p className="text-sm text-slate-500 font-inter max-w-md leading-relaxed">
        We're currently architecting the advanced {formattedName.toLowerCase()} engine for the Executive Ledger. Check back soon for deeper financial insights.
      </p>

      <div className="mt-12 flex gap-4">
        <div className="h-1.5 w-8 bg-primary rounded-full" />
        <div className="h-1.5 w-8 bg-surface-container rounded-full" />
        <div className="h-1.5 w-8 bg-surface-container rounded-full" />
      </div>
    </div>
  );
}
