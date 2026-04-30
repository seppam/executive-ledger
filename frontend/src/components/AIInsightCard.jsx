import React from 'react';

export default function AIInsightCard({ insight, onGenerateClick, loading = false }) {
  return (
    <div className="bg-tertiary-container rounded-4xl p-8 text-on-tertiary-container relative overflow-hidden group h-full min-h-[220px]">
      <div className="relative z-10 h-full flex flex-col justify-between">
        <div>
          {/* Icon */}
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
            <span
              className="material-symbols-outlined text-white"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              psychology
            </span>
          </div>

          {insight ? (
            <>
              <h3 className="text-2xl font-manrope font-bold text-white mb-3">
                {insight.title}
              </h3>
              <p className="text-white/80 font-inter text-sm leading-relaxed max-w-[280px]">
                {insight.summary}
              </p>
            </>
          ) : (
            <>
              <h3 className="text-2xl font-manrope font-bold text-white mb-3">
                AI Spending Insights
              </h3>
              <p className="text-white/80 font-inter text-sm leading-relaxed max-w-[280px]">
                Let Gemini analyze your last 30 days of transactions and surface hidden spending leaks.
              </p>
            </>
          )}
        </div>

        {/* CTA Button */}
        <button
          id="btn-generate-ai-insight"
          onClick={onGenerateClick}
          disabled={loading}
          className="mt-6 py-3 px-6 glass-insight rounded-xl font-manrope font-bold text-tertiary self-start transition-all hover:bg-white hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <span className="material-symbols-outlined text-sm animate-spin">autorenew</span>
              Analyzing…
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-sm">auto_awesome</span>
              {insight ? 'Refresh Insights' : 'Generate Advice'}
            </>
          )}
        </button>
      </div>

      {/* Decorative blob */}
      <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
    </div>
  );
}
