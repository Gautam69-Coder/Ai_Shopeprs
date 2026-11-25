import React from 'react';
import { Layers, History, Calendar } from 'lucide-react';
import type { ShopperBatch } from '../../types/shopper';

interface BatchSelectorProps {
  batches: ShopperBatch[];
  selectedBatchId: string | null;
  onSelectBatch: (batchId: string | null) => void;
  loading: boolean;
}

export const BatchSelector: React.FC<BatchSelectorProps> = ({
  batches,
  selectedBatchId,
  onSelectBatch,
  loading,
}) => {
  if (batches.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-blue-600" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-slate-900">
            Generation History & Batches
          </h3>
          <span className="text-xs bg-slate-100 text-slate-600 font-mono px-2 py-0.5 rounded-full">
            {batches.length} {batches.length === 1 ? 'batch' : 'batches'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onSelectBatch(null)}
          disabled={loading}
          className={`text-xs font-medium px-3 py-1 rounded-lg border transition-colors ${
            selectedBatchId === null
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
          }`}
        >
          View All Shoppers
        </button>
      </div>

      <div className="pt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {batches.map((b) => {
          const isSelected = selectedBatchId === b.batchId;
          const formattedDate = new Date(b.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <button
              key={b.batchId}
              type="button"
              onClick={() => onSelectBatch(b.batchId)}
              disabled={loading}
              className={`shrink-0 max-w-xs text-left p-3 rounded-xl border transition-all ${
                isSelected
                  ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-500/20'
                  : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-500" aria-hidden="true" />
                  <span>{b.count} Shoppers</span>
                </span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" aria-hidden="true" />
                  <span>{formattedDate}</span>
                </span>
              </div>
              <p className="text-xs text-slate-600 line-clamp-1">
                {b.targetAudience}
              </p>
              {b.country && (
                <span className="inline-block mt-1 text-[10px] font-mono text-slate-400 bg-white/70 px-1.5 py-0.2 rounded border border-slate-200">
                  {b.country}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
