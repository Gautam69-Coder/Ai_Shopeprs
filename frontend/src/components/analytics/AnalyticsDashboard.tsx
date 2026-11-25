import React, { useEffect, useState } from 'react';
import {
  BarChart2,
  GitCompare,
  Download,
  RotateCw,
  SlidersHorizontal,
} from 'lucide-react';
import type { SimulationRun } from '../../types/simulation';
import type {
  PlatformOverview,
  SimulationAnalytics,
  ComparisonResult,
} from '../../types/analytics';
import {
  fetchPlatformOverview,
  fetchSimulationAnalytics,
  fetchComparison,
} from '../../services/analyticsApi';
import { AnalyticsOverviewCards } from './AnalyticsOverviewCards';
import { DemographicCrossTab } from './DemographicCrossTab';
import { DriverObjectionFrequency } from './DriverObjectionFrequency';
import { ConceptComparisonMatrix } from './ConceptComparisonMatrix';

interface AnalyticsDashboardProps {
  simulations: SimulationRun[];
  activeSimulationId: string | null;
  onSelectSimulation: (id: string) => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  simulations,
  activeSimulationId,
  onSelectSimulation,
}) => {
  const [activeView, setActiveView] = useState<'deepDive' | 'compare'>('deepDive');

  // Overview and deep dive states
  const [overview, setOverview] = useState<PlatformOverview | null>(null);
  const [simulationAnalytics, setSimulationAnalytics] = useState<SimulationAnalytics | null>(null);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [compareLoading, setCompareLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load platform overview on mount
  const loadOverview = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchPlatformOverview();
      setOverview(res.overview);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load analytics overview';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Load simulation deep dive analytics
  const loadSimulationAnalytics = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchSimulationAnalytics(id);
      setSimulationAnalytics(res.analytics);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load simulation analytics';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, [simulations.length]);

  useEffect(() => {
    if (activeSimulationId) {
      loadSimulationAnalytics(activeSimulationId);
    } else if (simulations.length > 0) {
      loadSimulationAnalytics(simulations[0]._id);
    }
  }, [activeSimulationId, simulations]);

  // Handle A/B comparison
  const handleCompare = async (idA: string, idB: string) => {
    try {
      setCompareLoading(true);
      setError(null);
      const res = await fetchComparison([idA, idB]);
      setComparisonResult(res.comparison);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to compare simulations';
      setError(msg);
    } finally {
      setCompareLoading(false);
    }
  };

  // Export Analytics Report as JSON
  const handleExportReport = () => {
    const reportData = {
      exportedAt: new Date().toISOString(),
      platformOverview: overview,
      activeSimulationAnalytics: simulationAnalytics,
      comparison: comparisonResult,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `synthetic-shopper-analytics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (simulations.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4">
          <BarChart2 className="w-7 h-7" aria-hidden="true" />
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-1">
          No Simulation Data to Analyze Yet
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
          Launch at least one product simulation in the "Simulation Engine" tab to generate demographic cross-tabulations and analytics.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Controls: View Switcher and Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setActiveView('deepDive')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-semibold transition-all ${
              activeView === 'deepDive'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart2 className="w-4 h-4 text-blue-600" aria-hidden="true" />
            <span>Platform & Demographic Deep Dive</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('compare')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-semibold transition-all ${
              activeView === 'compare'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GitCompare className="w-4 h-4 text-blue-600" aria-hidden="true" />
            <span>A/B Concept Matrix</span>
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadOverview}
            disabled={loading}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 active:scale-[0.98] transition-all disabled:opacity-50"
            title="Refresh Analytics"
            aria-label="Refresh Analytics"
          >
            <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={handleExportReport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 active:scale-[0.98] transition-all shadow-xs"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Export Analytics (JSON)</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium">
          {error}
        </div>
      )}

      {/* VIEW 1: PLATFORM OVERVIEW & DEMOGRAPHIC DEEP DIVE */}
      {activeView === 'deepDive' && (
        <div className="space-y-8">
          {/* Global Platform KPI Cards */}
          {overview && <AnalyticsOverviewCards overview={overview} />}

          {/* Drilldown Simulation Selector */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-blue-600" aria-hidden="true" />
                <h3 className="text-sm font-bold text-slate-900">
                  Select Product Simulation for Demographic Cross-Tabulation
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Drill down into age brackets, monthly income tiers, and price sensitivity distributions.
              </p>
            </div>

            <div className="w-full md:w-80">
              <select
                value={activeSimulationId || simulations[0]?._id}
                onChange={(e) => onSelectSimulation(e.target.value)}
                disabled={loading}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 font-semibold focus-visible:ring-2 focus-visible:ring-blue-500 transition-all"
              >
                {simulations.map((sim) => (
                  <option key={sim._id} value={sim._id}>
                    {sim.product.name} (₹{sim.product.price} • {sim.shopperCount} Shoppers)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Deep Dive Cross Tabs */}
          {simulationAnalytics && (
            <div className="space-y-8">
              <DemographicCrossTab
                crossTabs={simulationAnalytics.crossTabs}
                productName={simulationAnalytics.product.name}
              />

              <DriverObjectionFrequency
                drivers={simulationAnalytics.rankedDrivers}
                objections={simulationAnalytics.rankedObjections}
              />
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: A/B CONCEPT COMPARISON MATRIX */}
      {activeView === 'compare' && (
        <ConceptComparisonMatrix
          simulations={simulations}
          onCompare={handleCompare}
          comparisonResult={comparisonResult}
          loading={compareLoading}
        />
      )}
    </div>
  );
};
