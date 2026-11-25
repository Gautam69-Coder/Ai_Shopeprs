import React, { useState } from 'react';
import {
  Package,
  History,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  XCircle,
  RotateCw,
  SlidersHorizontal,
  Trash2,
} from 'lucide-react';
import type { SimulationRun, PurchaseDecision } from '../../types/simulation';
import { ShopperReactionCard } from './ShopperReactionCard';
import { EvaluationSummaryCard } from '../evaluation/EvaluationSummaryCard';
import { Badge } from '../common/Badge';

interface SimulationViewerProps {
  simulation: SimulationRun | null;
  history: SimulationRun[];
  onSelectSimulation: (id: string) => void;
  loading: boolean;
  onEvaluateSimulation?: (id: string) => Promise<void> | void;
  evaluationLoading?: boolean;
  onClearHistory?: () => void;
}

export const SimulationViewer: React.FC<SimulationViewerProps> = ({
  simulation,
  history,
  onSelectSimulation,
  loading,
  onEvaluateSimulation,
  evaluationLoading = false,
  onClearHistory,
}) => {
  const [decisionFilter, setDecisionFilter] = useState<'All' | PurchaseDecision>('All');

  if (!simulation && !loading && history.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4">
          <Package className="w-7 h-7" aria-hidden="true" />
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-1">
          No Simulation Runs Yet
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
          Select a shopper cohort, fill out your product proposition above, and click "Launch Product Simulation" to collect live synthetic consumer feedback.
        </p>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Each shopper persona evaluates in their authentic voice</span>
        </span>
      </div>
    );
  }

  const responses = simulation?.responses || [];

  const yesCount = responses.filter((r) => r.classification?.decision === 'Definitely Yes').length;
  const maybeCount = responses.filter((r) => r.classification?.decision === 'Maybe').length;
  const noCount = responses.filter((r) => r.classification?.decision === 'No').length;

  const filteredResponses = responses.filter((r) => {
    if (decisionFilter === 'All') return true;
    return r.classification?.decision === decisionFilter;
  });

  return (
    <div className="space-y-8">
      {/* Simulation History Tabs (if simulations exist) */}
      {history.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-blue-600" aria-hidden="true" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Simulation Run History ({history.length})
              </h3>
            </div>
            {onClearHistory && (
              <button
                type="button"
                onClick={onClearHistory}
                disabled={loading || evaluationLoading}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1 rounded-lg transition-all active:scale-[0.98] disabled:opacity-50"
                title="Delete all saved simulation runs from database"
              >
                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Clear All Reports</span>
              </button>
            )}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {history.map((sim) => {
              const isSelected = simulation?._id === sim._id;
              const formattedDate = new Date(sim.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <button
                  key={sim._id}
                  type="button"
                  onClick={() => onSelectSimulation(sim._id)}
                  disabled={loading || evaluationLoading}
                  className={`shrink-0 max-w-xs text-left p-3 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-500/20'
                      : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {sim.product.name}
                    </span>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {formattedDate}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span>₹{sim.product.price}</span>
                    <span>&bull;</span>
                    <span>{sim.shopperCount} Shoppers</span>
                    {sim.evaluationSummary && (
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" title="Evaluated" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Product Pitch Summary Banner */}
      {simulation && (
        <div className="rounded-3xl bg-slate-900 text-white p-6 sm:p-8 border border-slate-800 shadow-lg relative overflow-hidden">
          <div className="relative z-10 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Badge variant="blue" dot className="bg-slate-800 text-blue-200 border-slate-700">
                  {simulation.product.category}
                </Badge>
                <span className="text-xs text-slate-400 font-mono">
                  Tested Against {simulation.shopperCount} Synthetic Shoppers
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">
                ₹{new Intl.NumberFormat('en-IN').format(simulation.product.price)}
              </div>
            </div>

            <h3 className="text-2xl font-extrabold tracking-tight text-white">
              {simulation.product.name}
            </h3>

            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              {simulation.product.description}
            </p>

            {simulation.product.adCopy && (
              <div className="pt-2 text-xs text-slate-300 font-medium italic border-t border-slate-800">
                Ad Slogan: "{simulation.product.adCopy}"
              </div>
            )}
          </div>
        </div>
      )}

      {/* Phase 4 Evaluation Summary Card */}
      {simulation?.evaluationSummary ? (
        <EvaluationSummaryCard
          summary={simulation.evaluationSummary}
          totalShoppers={responses.length}
          onReevaluate={
            onEvaluateSimulation ? () => onEvaluateSimulation(simulation._id) : undefined
          }
          loading={evaluationLoading}
        />
      ) : simulation && responses.length > 0 ? (
        /* Prompt to run evaluation if unclassified */
        <div className="p-6 rounded-3xl bg-slate-100/80 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" aria-hidden="true" />
              <h3 className="text-sm font-bold text-slate-900">
                Run Phase 4 Intent Evaluation & Synthesis
              </h3>
            </div>
            <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
              Synthesize reactions into Definitely Yes / Maybe / No classifications, extract confidence scores, surface primary purchase drivers and common objections, and produce actionable product recommendations.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onEvaluateSimulation?.(simulation._id)}
            disabled={evaluationLoading}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm disabled:opacity-50 shrink-0"
          >
            <RotateCw className={`w-4 h-4 ${evaluationLoading ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span>{evaluationLoading ? 'Evaluating Personas...' : 'Classify Purchase Intent'}</span>
          </button>
        </div>
      ) : null}

      {/* Shopper Reactions Section with Decision Filter Pills */}
      {simulation && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="text-lg font-bold text-slate-900">
                  Synthetic Shopper Reactions ({responses.length})
                </h4>
                <Badge variant="neutral">Qualitative & Quantitative</Badge>
              </div>
              <p className="text-xs text-slate-500">
                Review persona verbatim roleplay cards or filter by purchase decision conviction.
              </p>
            </div>

            {/* Decision Filter Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs shrink-0">
              <span className="text-[11px] font-semibold text-slate-500 px-2 flex items-center gap-1">
                <SlidersHorizontal className="w-3 h-3 text-slate-400" aria-hidden="true" />
                <span>Filter:</span>
              </span>

              <button
                type="button"
                onClick={() => setDecisionFilter('All')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  decisionFilter === 'All'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({responses.length})
              </button>

              <button
                type="button"
                onClick={() => setDecisionFilter('Definitely Yes')}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg font-medium transition-all ${
                  decisionFilter === 'Definitely Yes'
                    ? 'bg-emerald-600 text-white shadow-2xs font-semibold'
                    : 'text-emerald-800 hover:bg-emerald-50'
                }`}
              >
                <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                <span>Yes ({yesCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setDecisionFilter('Maybe')}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg font-medium transition-all ${
                  decisionFilter === 'Maybe'
                    ? 'bg-amber-500 text-white shadow-2xs font-semibold'
                    : 'text-amber-800 hover:bg-amber-50'
                }`}
              >
                <HelpCircle className="w-3 h-3" aria-hidden="true" />
                <span>Maybe ({maybeCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setDecisionFilter('No')}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg font-medium transition-all ${
                  decisionFilter === 'No'
                    ? 'bg-rose-600 text-white shadow-2xs font-semibold'
                    : 'text-rose-800 hover:bg-rose-50'
                }`}
              >
                <XCircle className="w-3 h-3" aria-hidden="true" />
                <span>No ({noCount})</span>
              </button>
            </div>
          </div>

          {/* Filtered Reactions Grid */}
          {filteredResponses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredResponses.map((resp, idx) => (
                <ShopperReactionCard
                  key={resp._id || `${resp.shopperName}-${idx}`}
                  response={resp}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center">
              <p className="text-xs text-slate-500 font-medium">
                No shoppers matched the <span className="font-semibold text-slate-700">"{decisionFilter}"</span> filter.
              </p>
              <button
                type="button"
                onClick={() => setDecisionFilter('All')}
                className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-800 underline"
              >
                Reset filter to view all shoppers
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
