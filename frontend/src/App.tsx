import React, { useEffect, useState } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { TargetAudienceForm } from './components/shopper/TargetAudienceForm';
import { BatchSelector } from './components/shopper/BatchSelector';
import { ShoppersGrid } from './components/shopper/ShoppersGrid';
import { ProductForm } from './components/simulation/ProductForm';
import { SimulationViewer } from './components/simulation/SimulationViewer';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import {
  Users,
  Package,
  Layers,
  ArrowRight,
  BarChart2,
} from 'lucide-react';
import type {
  SyntheticShopper,
  ShopperBatch,
  GenerateShoppersRequest,
} from './types/shopper';
import type {
  SimulationRun,
  ProductInput,
} from './types/simulation';
import {
  generateShoppers,
  fetchShoppers,
  fetchBatches,
} from './services/shopperApi';
import {
  runSimulation,
  fetchSimulations,
  fetchSimulationById,
  evaluateSimulation,
  deleteAllSimulations,
} from './services/simulationApi';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'shoppers' | 'simulations' | 'analytics'>('shoppers');

  // Shopper states
  const [shoppers, setShoppers] = useState<SyntheticShopper[]>([]);
  const [batches, setBatches] = useState<ShopperBatch[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Simulation states
  const [simulations, setSimulations] = useState<SimulationRun[]>([]);
  const [activeSimulation, setActiveSimulation] = useState<SimulationRun | null>(null);
  const [simulationLoading, setSimulationLoading] = useState<boolean>(false);
  const [simulationError, setSimulationError] = useState<string | null>(null);
  const [evaluationLoading, setEvaluationLoading] = useState<boolean>(false);

  // Initial data loading
  const loadInitialData = async () => {
    try {
      const [batchesRes, shoppersRes, simRes] = await Promise.all([
        fetchBatches(),
        fetchShoppers(),
        fetchSimulations(),
      ]);
      setBatches(batchesRes.batches);
      setShoppers(shoppersRes.shoppers);
      setSimulations(simRes.simulations);

      if (batchesRes.batches.length > 0 && !selectedBatchId) {
        setSelectedBatchId(batchesRes.batches[0].batchId);
      }

      if (simRes.simulations.length > 0) {
        const fullSim = await fetchSimulationById(simRes.simulations[0]._id);
        setActiveSimulation(fullSim.simulation);
      }
    } catch {
      // Backend offline or starting up; errors gracefully handled
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Handle shopper profile generation
  const handleGenerateShoppers = async (formData: GenerateShoppersRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await generateShoppers(formData);
      setSelectedBatchId(response.batchId);
      setShoppers(response.shoppers);

      const batchesRes = await fetchBatches();
      setBatches(batchesRes.batches);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'An unexpected error occurred during profile generation.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Switch shopper batch filter
  const handleSelectBatch = async (batchId: string | null) => {
    setSelectedBatchId(batchId);
    setLoading(true);
    try {
      const shoppersRes = await fetchShoppers(batchId || undefined);
      setShoppers(shoppersRes.shoppers);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to switch batch';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Handle product simulation execution
  const handleRunSimulation = async (batchId: string, product: ProductInput) => {
    setSimulationLoading(true);
    setSimulationError(null);

    try {
      const result = await runSimulation({ batchId, product });
      const fullSim = await fetchSimulationById(result.simulation._id);
      setActiveSimulation(fullSim.simulation);

      const simRes = await fetchSimulations();
      setSimulations(simRes.simulations);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Failed to execute product simulation.';
      setSimulationError(msg);
    } finally {
      setSimulationLoading(false);
    }
  };

  // Switch selected simulation in history
  const handleSelectSimulation = async (id: string) => {
    setSimulationLoading(true);
    try {
      const res = await fetchSimulationById(id);
      setActiveSimulation(res.simulation);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load simulation';
      setSimulationError(msg);
    } finally {
      setSimulationLoading(false);
    }
  };

  // Trigger evaluation
  const handleEvaluateSimulation = async (id: string) => {
    setEvaluationLoading(true);
    try {
      const result = await evaluateSimulation(id);
      setActiveSimulation(result.simulation);

      const simRes = await fetchSimulations();
      setSimulations(simRes.simulations);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Evaluation failed';
      setSimulationError(msg);
    } finally {
      setEvaluationLoading(false);
    }
  };

  // Clear all saved simulation runs
  const handleClearSimulations = async () => {
    if (!window.confirm('Are you sure you want to delete all saved simulation reports? This will reset history and analytics.')) {
      return;
    }
    setSimulationLoading(true);
    try {
      await deleteAllSimulations();
      setSimulations([]);
      setActiveSimulation(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to clear simulation reports';
      setSimulationError(msg);
    } finally {
      setSimulationLoading(false);
    }
  };

  const activeBatch = batches.find((b) => b.batchId === selectedBatchId);
  const totalSavedInDb = batches.reduce((acc, b) => acc + (b.count || 0), 0);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Navigation Header */}
      <Navbar activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Clean Application Header */}
        <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Consumer Market Simulator
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Model authentic consumer personas, test product propositions, and measure behavioral purchase intent.
            </p>
          </div>

          {/* Workflow Tabs */}
          <div className="flex items-center p-1 bg-slate-200/80 rounded-xl shadow-xs self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('shoppers')}
              className={`flex items-center gap-2 py-2 px-3.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'shoppers'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4 text-blue-600" aria-hidden="true" />
              <span>Personas</span>
              {totalSavedInDb > 0 && (
                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full font-mono">
                  {totalSavedInDb}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('simulations')}
              className={`flex items-center gap-2 py-2 px-3.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'simulations'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4 text-blue-600" aria-hidden="true" />
              <span>Simulations</span>
              {simulations.length > 0 && (
                <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-full font-mono">
                  {simulations.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 py-2 px-3.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'analytics'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart2 className="w-4 h-4 text-blue-600" aria-hidden="true" />
              <span>Analytics</span>
            </button>
          </div>
        </section>

        {/* TAB 1: SHOPPER PERSONA GENERATOR */}
        {activeTab === 'shoppers' && (
          <div className="space-y-8">
            <TargetAudienceForm
              onGenerate={handleGenerateShoppers}
              loading={loading}
              error={error}
            />

            <BatchSelector
              batches={batches}
              selectedBatchId={selectedBatchId}
              onSelectBatch={handleSelectBatch}
              loading={loading}
            />

            {/* Quick action to run simulation on active batch */}
            {selectedBatchId && batches.length > 0 && (
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-blue-950 font-medium">
                  <Package className="w-4 h-4 text-blue-600 shrink-0" aria-hidden="true" />
                  <span>
                    Ready to pitch a product to the <strong>"{activeBatch?.targetAudience}"</strong> cohort?
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('simulations')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <span>Launch Simulation Engine</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            )}

            <ShoppersGrid
              shoppers={shoppers}
              loading={loading}
              activeBatchAudience={activeBatch?.targetAudience}
              totalSavedCount={totalSavedInDb}
            />
          </div>
        )}

        {/* TAB 2: PRODUCT SIMULATION ENGINE */}
        {activeTab === 'simulations' && (
          <div className="space-y-8">
            <ProductForm
              batches={batches}
              selectedBatchId={selectedBatchId}
              onSelectBatchId={(id) => setSelectedBatchId(id)}
              onRunSimulation={handleRunSimulation}
              loading={simulationLoading}
              error={simulationError}
            />

            <SimulationViewer
              simulation={activeSimulation}
              history={simulations}
              onSelectSimulation={handleSelectSimulation}
              loading={simulationLoading}
              onEvaluateSimulation={handleEvaluateSimulation}
              evaluationLoading={evaluationLoading}
              onClearHistory={handleClearSimulations}
            />
          </div>
        )}

        {/* TAB 3: ANALYTICS & INSIGHTS */}
        {activeTab === 'analytics' && (
          <AnalyticsDashboard
            simulations={simulations}
            activeSimulationId={activeSimulation?._id || null}
            onSelectSimulation={handleSelectSimulation}
          />
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default App;
