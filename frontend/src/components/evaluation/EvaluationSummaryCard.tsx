import React from 'react';
import {
  CheckCircle2,
  HelpCircle,
  XCircle,
  TrendingUp,
  Lightbulb,
  ThumbsUp,
  AlertTriangle,
  RotateCw,
  Sparkles,
} from 'lucide-react';
import type { EvaluationSummary } from '../../types/simulation';
import { Badge } from '../common/Badge';

interface EvaluationSummaryCardProps {
  summary: EvaluationSummary;
  totalShoppers: number;
  onReevaluate?: () => void;
  loading?: boolean;
}

export const EvaluationSummaryCard: React.FC<EvaluationSummaryCardProps> = ({
  summary,
  totalShoppers,
  onReevaluate,
  loading = false,
}) => {
  const { intentBreakdown, topDrivers, commonObjections, recommendations, executiveSummary } = summary;

  const definitelyYesPercent = totalShoppers > 0
    ? Math.round((intentBreakdown.definitelyYes / totalShoppers) * 100)
    : 0;
  const maybePercent = totalShoppers > 0
    ? Math.round((intentBreakdown.maybe / totalShoppers) * 100)
    : 0;
  const noPercent = totalShoppers > 0
    ? Math.round((intentBreakdown.no / totalShoppers) * 100)
    : 0;

  // Intent score status color
  const getIntentScoreColor = (score: number) => {
    if (score >= 70) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 40) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Top Banner / Header */}
      <div className="p-6 sm:p-8 bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="blue" dot className="bg-slate-800 text-blue-200 border-slate-700">AI Synthesis</Badge>
            <span className="text-xs text-slate-400 font-mono">
              Evaluated across {totalShoppers} Synthetic Personas
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-400" aria-hidden="true" />
            <span>Executive Cohort Evaluation</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Consolidated purchase intent classification, primary demand drivers, critical consumer objections, and actionable optimization roadmap.
          </p>
        </div>

        {/* Net Purchase Intent Gauge */}
        <div className="flex items-center gap-4 shrink-0 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
          <div className="text-right">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Net Intent Index
            </span>
            <span className="text-xs text-slate-500">Scaled 0–100</span>
          </div>
          <div
            className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center border font-mono font-extrabold text-2xl shadow-inner ${getIntentScoreColor(
              intentBreakdown.intentScore
            )}`}
          >
            {intentBreakdown.intentScore}
            <span className="text-[9px] font-medium tracking-tight uppercase -mt-0.5">
              / 100
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-8">
        {/* Purchase Intent Breakdown Cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-blue-600" aria-hidden="true" />
              <span>Purchase Intent Distribution ({totalShoppers} Personas)</span>
            </h3>
            {onReevaluate && (
              <button
                type="button"
                onClick={onReevaluate}
                disabled={loading}
                className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-semibold focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg px-2 py-1 transition-all disabled:opacity-50"
              >
                <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
                <span>{loading ? 'Re-Evaluating...' : 'Re-Run Evaluation'}</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Definitely Yes */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                  <span>Definitely Yes</span>
                </span>
                <p className="text-xs text-emerald-700">Strong conviction to purchase</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold font-mono text-emerald-900 block leading-tight">
                  {intentBreakdown.definitelyYes}
                </span>
                <span className="text-xs font-medium text-emerald-700 font-mono">
                  {definitelyYesPercent}%
                </span>
              </div>
            </div>

            {/* Maybe */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-amber-600" aria-hidden="true" />
                  <span>Maybe</span>
                </span>
                <p className="text-xs text-amber-700">Contingent on price or claims</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold font-mono text-amber-900 block leading-tight">
                  {intentBreakdown.maybe}
                </span>
                <span className="text-xs font-medium text-amber-700 font-mono">
                  {maybePercent}%
                </span>
              </div>
            </div>

            {/* No */}
            <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/80 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                  <XCircle className="w-4 h-4 text-rose-600" aria-hidden="true" />
                  <span>No</span>
                </span>
                <p className="text-xs text-rose-700">Not interested or priced out</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold font-mono text-rose-900 block leading-tight">
                  {intentBreakdown.no}
                </span>
                <span className="text-xs font-medium text-rose-700 font-mono">
                  {noPercent}%
                </span>
              </div>
            </div>
          </div>

          {/* Visual Intent Stacked Bar */}
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
            {definitelyYesPercent > 0 && (
              <div
                style={{ width: `${definitelyYesPercent}%` }}
                className="bg-emerald-500 h-full transition-all duration-500"
                title={`Definitely Yes: ${definitelyYesPercent}%`}
              />
            )}
            {maybePercent > 0 && (
              <div
                style={{ width: `${maybePercent}%` }}
                className="bg-amber-400 h-full transition-all duration-500"
                title={`Maybe: ${maybePercent}%`}
              />
            )}
            {noPercent > 0 && (
              <div
                style={{ width: `${noPercent}%` }}
                className="bg-rose-500 h-full transition-all duration-500"
                title={`No: ${noPercent}%`}
              />
            )}
          </div>
        </div>

        {/* Executive Summary Callout */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
            Executive Summary & Verdict
          </span>
          <p className="text-sm font-medium text-slate-800 leading-relaxed italic">
            "{executiveSummary}"
          </p>
        </div>

        {/* Two-Column: Top Drivers & Common Objections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Purchase Drivers */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <ThumbsUp className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              <span>Top Purchase Drivers</span>
            </h4>
            <ul className="space-y-2.5">
              {topDrivers.map((driver, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed"
                >
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <span>{driver}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Common Objections */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <AlertTriangle className="w-4 h-4 text-rose-600" aria-hidden="true" />
              <span>Common Objections & Barriers</span>
            </h4>
            <ul className="space-y-2.5">
              {commonObjections.map((objection, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed"
                >
                  <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <span>{objection}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Actionable Product Recommendations */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50/60 to-blue-50/40 border border-blue-100 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <Lightbulb className="w-4 h-4 text-blue-600" aria-hidden="true" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Actionable Optimization Recommendations
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className="p-3 bg-white/90 rounded-xl border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5 shadow-xs"
              >
                <span className="font-bold font-mono text-blue-600 text-xs mt-0.5">
                  0{index + 1}.
                </span>
                <span className="leading-relaxed">{rec}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
