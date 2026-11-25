import React, { useState } from 'react';
import {
  GitCompare,
  Trophy,
  ThumbsUp,
  AlertTriangle,
  RotateCw,
} from 'lucide-react';
import type { SimulationRun } from '../../types/simulation';
import type { ComparisonResult } from '../../types/analytics';
import { Badge } from '../common/Badge';

interface ConceptComparisonMatrixProps {
  simulations: SimulationRun[];
  onCompare: (id1: string, id2: string) => Promise<void> | void;
  comparisonResult: ComparisonResult | null;
  loading: boolean;
}

export const ConceptComparisonMatrix: React.FC<ConceptComparisonMatrixProps> = ({
  simulations,
  onCompare,
  comparisonResult,
  loading,
}) => {
  const [conceptAId, setConceptAId] = useState<string>(
    simulations[0]?._id || ''
  );
  const [conceptBId, setConceptBId] = useState<string>(
    simulations[1]?._id || simulations[0]?._id || ''
  );

  const handleRunComparison = () => {
    if (!conceptAId || !conceptBId) return;
    onCompare(conceptAId, conceptBId);
  };

  return (
    <div className="space-y-6">
      {/* Selector Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
            <GitCompare className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              A/B Product Concept Comparison Matrix
            </h3>
            <p className="text-xs text-slate-500">
              Pit two tested product concepts or price variants against each other to identify the winning proposition.
            </p>
          </div>
        </div>

        {simulations.length < 2 ? (
          <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-200 text-center space-y-2">
            <p className="text-xs font-semibold text-amber-900">
              At least two simulation runs are needed to run an A/B comparison.
            </p>
            <p className="text-xs text-amber-700">
              Run another simulation in the "Simulation Engine" tab to unlock comparative intelligence.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            {/* Concept A Picker */}
            <div className="lg:col-span-2 space-y-1.5">
              <label htmlFor="concept-a" className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Concept A (Baseline)
              </label>
              <select
                id="concept-a"
                value={conceptAId}
                onChange={(e) => setConceptAId(e.target.value)}
                disabled={loading}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-500 transition-all"
              >
                {simulations.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.product.name} (₹{s.product.price})
                  </option>
                ))}
              </select>
            </div>

            {/* Concept B Picker */}
            <div className="lg:col-span-2 space-y-1.5">
              <label htmlFor="concept-b" className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Concept B (Challenger)
              </label>
              <select
                id="concept-b"
                value={conceptBId}
                onChange={(e) => setConceptBId(e.target.value)}
                disabled={loading}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-500 transition-all"
              >
                {simulations.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.product.name} (₹{s.product.price})
                  </option>
                ))}
              </select>
            </div>

            {/* Run Button */}
            <div className="lg:col-span-1">
              <button
                type="button"
                onClick={handleRunComparison}
                disabled={loading || !conceptAId || !conceptBId}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
              >
                <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
                <span>{loading ? 'Comparing...' : 'Run A/B Matrix'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Comparison Results */}
      {comparisonResult && (
        <div className="space-y-6">
          {/* Winner Banner */}
          <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-emerald-950 text-white p-6 sm:p-8 border border-emerald-900/60 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
                <Trophy className="w-6 h-6" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="success" dot className="bg-emerald-950/80 text-emerald-200 border-emerald-700/60">
                    A/B Comparison Verdict
                  </Badge>
                  <span className="text-xs text-slate-400 font-mono">
                    Based on Consumer Intent Scores
                  </span>
                </div>
                <h4 className="text-lg sm:text-xl font-extrabold text-white">
                  {comparisonResult.verdictSummary}
                </h4>
              </div>
            </div>
          </div>

          {/* Side-by-side cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {comparisonResult.simulations.map((sim, idx) => {
              const isWinner = sim._id === comparisonResult.winnerId;

              return (
                <div
                  key={sim._id}
                  className={`bg-white rounded-3xl border p-6 sm:p-8 flex flex-col justify-between space-y-6 transition-all ${
                    isWinner
                      ? 'border-emerald-300 ring-2 ring-emerald-500/20 shadow-md'
                      : 'border-slate-200 shadow-xs'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                          Concept {idx === 0 ? 'A' : 'B'}
                        </span>
                        <h4 className="text-lg font-bold text-slate-900 leading-snug">
                          {sim.product.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                          <span className="font-semibold text-slate-700">{sim.product.category}</span>
                          <span>&bull;</span>
                          <span>{sim.shopperCount} Personas</span>
                        </div>
                      </div>

                      {isWinner && (
                        <Badge variant="success" dot className="font-bold uppercase tracking-wider shrink-0">
                          Top Choice
                        </Badge>
                      )}
                    </div>

                    {/* Price and Intent Score Row */}
                    <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Price Point
                        </span>
                        <span className="text-xl font-bold font-mono text-slate-900 mt-0.5 block">
                          ₹{new Intl.NumberFormat('en-IN').format(sim.product.price)}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Net Intent Index
                        </span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span
                            className={`text-xl font-bold font-mono ${
                              sim.intentScore >= 65
                                ? 'text-emerald-600'
                                : sim.intentScore >= 40
                                ? 'text-amber-600'
                                : 'text-rose-600'
                            }`}
                          >
                            {sim.intentScore}
                          </span>
                          <span className="text-xs text-slate-400 font-semibold">/ 100</span>
                        </div>
                      </div>
                    </div>

                    {/* Conversion Distribution */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono font-medium">
                        <span className="text-emerald-700">Yes: {sim.intentBreakdown.yesPercent}%</span>
                        <span className="text-amber-700">Maybe: {sim.intentBreakdown.maybePercent}%</span>
                        <span className="text-rose-700">No: {sim.intentBreakdown.noPercent}%</span>
                      </div>

                      <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                        <div
                          style={{ width: `${sim.intentBreakdown.yesPercent}%` }}
                          className="bg-emerald-500 h-full"
                          title={`Yes: ${sim.intentBreakdown.yesPercent}%`}
                        />
                        <div
                          style={{ width: `${sim.intentBreakdown.maybePercent}%` }}
                          className="bg-amber-400 h-full"
                          title={`Maybe: ${sim.intentBreakdown.maybePercent}%`}
                        />
                        <div
                          style={{ width: `${sim.intentBreakdown.noPercent}%` }}
                          className="bg-rose-500 h-full"
                          title={`No: ${sim.intentBreakdown.noPercent}%`}
                        />
                      </div>
                    </div>

                    {/* Top Drivers */}
                    {sim.topDrivers.length > 0 && (
                      <div className="space-y-1.5 pt-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3 text-emerald-600" aria-hidden="true" />
                          <span>Winning Drivers</span>
                        </span>
                        <ul className="space-y-1 text-xs text-slate-700">
                          {sim.topDrivers.slice(0, 3).map((d, i) => (
                            <li key={i} className="flex items-center gap-1.5 truncate">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                              <span className="truncate">{d}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Common Objections */}
                    {sim.commonObjections.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-rose-600" aria-hidden="true" />
                          <span>Key Objections</span>
                        </span>
                        <ul className="space-y-1 text-xs text-slate-700">
                          {sim.commonObjections.slice(0, 3).map((o, i) => (
                            <li key={i} className="flex items-center gap-1.5 truncate">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                              <span className="truncate">{o}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Executive Summary Quote */}
                  {sim.executiveSummary && (
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 italic leading-relaxed">
                      "{sim.executiveSummary}"
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
