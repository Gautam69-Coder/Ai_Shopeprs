import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <p>
          &copy; {new Date().getFullYear()} Synthetic Shopper Simulator. AI-driven consumer intelligence &amp; product testing.
        </p>
        <p className="flex items-center gap-2 text-slate-400">
          <span>Consumer Simulation Engine</span>
          <span>&bull;</span>
          <span>Demographic Intelligence</span>
        </p>
      </div>
    </footer>
  );
};
