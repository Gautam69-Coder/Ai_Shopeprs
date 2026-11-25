import React from 'react';
import {
  Package,
  Users,
  TrendingUp,
  Target,
  BarChart3,
  Layers,
} from 'lucide-react';
import type { PlatformOverview } from '../../types/analytics';
import { Badge } from '../common/Badge';

interface AnalyticsOverviewCardsProps {
  overview: PlatformOverview;
}

export const AnalyticsOverviewCards: React.FC<AnalyticsOverviewCardsProps> = ({ overview }) => {
  const {
    totalSimulations,
    totalEvaluations,
    averageIntentScore,
    globalDecisionBreakdown,
    categoryBenchmarks,
  } = overview;

  return (
    <div className="space-y-6">
      {/* 4 High-Impact KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Simulations */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Tested Concepts
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
              <Package className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold font-mono text-slate-900 block">
              {totalSimulations}
            </span>
            <span className="text-xs text-slate-500 mt-1 block">
              Distinct product proposition runs
            </span>
          </div>
        </div>

        {/* Total Shoppers Simulated */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Personas Evaluated
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
              <Users className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold font-mono text-slate-900 block">
              {totalEvaluations}
            </span>
            <span className="text-xs text-slate-500 mt-1 block">
              Total synthetic roleplay assessments
            </span>
          </div>
        </div>

        {/* Global Net Intent Index */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Mean Net Intent Index
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
              <Target className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold font-mono text-emerald-600">
                {averageIntentScore}
              </span>
              <span className="text-xs font-semibold text-slate-400">/ 100</span>
            </div>
            <span className="text-xs text-slate-500 mt-1 block">
              Weighted cross-cohort conviction
            </span>
          </div>
        </div>

        {/* Global Conversion Funnel */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Cohort Conversion Funnel
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-4 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono font-medium">
              <span className="text-emerald-700">Yes: {globalDecisionBreakdown.yesPercent}%</span>
              <span className="text-amber-700">Maybe: {globalDecisionBreakdown.maybePercent}%</span>
              <span className="text-rose-700">No: {globalDecisionBreakdown.noPercent}%</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
              <div
                style={{ width: `${globalDecisionBreakdown.yesPercent}%` }}
                className="bg-emerald-500 h-full"
                title={`Yes: ${globalDecisionBreakdown.yesPercent}%`}
              />
              <div
                style={{ width: `${globalDecisionBreakdown.maybePercent}%` }}
                className="bg-amber-400 h-full"
                title={`Maybe: ${globalDecisionBreakdown.maybePercent}%`}
              />
              <div
                style={{ width: `${globalDecisionBreakdown.noPercent}%` }}
                className="bg-rose-500 h-full"
                title={`No: ${globalDecisionBreakdown.noPercent}%`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Category Performance Benchmarks */}
      {categoryBenchmarks.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" aria-hidden="true" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Category Intent & Pricing Benchmarks
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {categoryBenchmarks.length} Active Categories
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {categoryBenchmarks.map((cat, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-100/70 transition-all flex items-center justify-between gap-3"
              >
                <div className="space-y-1 truncate">
                  <div className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-blue-500 shrink-0" aria-hidden="true" />
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {cat.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                    <span>{cat.simulationCount} concept(s)</span>
                    <span>&bull;</span>
                    <span>Avg ₹{new Intl.NumberFormat('en-IN').format(cat.averagePrice)}</span>
                  </div>
                </div>

                <Badge
                  variant={
                    cat.averageIntentScore >= 65
                      ? 'success'
                      : cat.averageIntentScore >= 45
                      ? 'warning'
                      : 'danger'
                  }
                  dot
                  className="font-mono font-bold text-xs shrink-0"
                >
                  {cat.averageIntentScore}/100
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
