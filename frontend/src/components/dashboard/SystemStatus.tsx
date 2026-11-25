import React, { useEffect, useState } from 'react';
import { Activity, RefreshCw, Server, Database, CheckCircle2, AlertCircle, Cpu, Zap } from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { API_BASE_URL, BACKEND_ORIGIN } from '../../config/api';
import type { HealthResponse } from '../../types/health';

export const SystemStatus: React.FC = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        headers: { 'Accept': 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      const data: HealthResponse = await response.json();
      setHealth(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Backend unreachable';
      setError(msg);
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const isDbConnected = health?.database?.status === 'connected';

  return (
    <Card
      header={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" aria-hidden="true" />
            <h2 className="text-base font-semibold text-slate-900">
              System Environment Status
            </h2>
          </div>
          <button
            type="button"
            onClick={fetchHealth}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50"
            aria-label="Refresh backend health status"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
            <span>Refresh</span>
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Backend Server Status */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-slate-500" aria-hidden="true" />
              <span className="text-xs font-semibold text-slate-600 uppercase">
                Backend API
              </span>
            </div>
            {error ? (
              <Badge variant="warning" dot>Offline / Unreachable</Badge>
            ) : health?.status === 'ok' ? (
              <Badge variant="success" dot>Active</Badge>
            ) : (
              <Badge variant="neutral">Connecting...</Badge>
            )}
          </div>
          <p className="text-xs text-slate-500">
            {error
              ? `Unable to reach ${BACKEND_ORIGIN}. Ensure the backend server is running.`
              : `Express 4 (${BACKEND_ORIGIN}) — Uptime: ${health?.uptime ?? 0}s`}
          </p>
        </div>

        {/* Database Status */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-slate-500" aria-hidden="true" />
              <span className="text-xs font-semibold text-slate-600 uppercase">
                Database (Mongoose)
              </span>
            </div>
            {isDbConnected ? (
              <Badge variant="success" dot>Connected</Badge>
            ) : (
              <Badge variant="warning" dot>
                {health?.database?.status || 'Disconnected'}
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-500">
            {isDbConnected
              ? 'MongoDB connection established successfully.'
              : 'Graceful fallback: Backend running without DB lock.'}
          </p>
        </div>

        {/* Frontend Layer */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-slate-500" aria-hidden="true" />
              <span className="text-xs font-semibold text-slate-600 uppercase">
                Frontend Client
              </span>
            </div>
            <Badge variant="success" dot>
              {typeof window !== 'undefined' ? window.location.host : 'Active'}
            </Badge>
          </div>
          <p className="text-xs text-slate-500">
            React 19 + TypeScript + Vite + Tailwind CSS
          </p>
        </div>

        {/* Phase 6: LLM Resilience & Telemetry Card */}
        <div className="p-4 rounded-xl border border-blue-200/70 bg-blue-50/40">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-500" aria-hidden="true" />
              <span className="text-xs font-semibold text-blue-700 uppercase">
                LLM Resilience
              </span>
            </div>
            {health?.llm ? (
              <Badge variant="blue" dot>Active</Badge>
            ) : (
              <Badge variant="neutral">Offline</Badge>
            )}
          </div>

          {health?.llm ? (
            <div className="space-y-2">
              {/* LLM config row */}
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-100/70 text-blue-700 text-[11px] font-mono">
                  model: {health.llm.model}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-mono">
                  concurrency: {health.llm.maxConcurrency}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-mono">
                  retries: {health.llm.maxRetries}
                </span>
              </div>

              {/* Telemetry row */}
              {health.telemetry && (
                <div className="pt-2 border-t border-blue-100 flex flex-wrap gap-2 items-center">
                  <Cpu className="w-3.5 h-3.5 text-blue-400 shrink-0" aria-hidden="true" />
                  <span className="text-[11px] font-mono text-slate-500">
                    {health.telemetry.cumulativeTokens.toLocaleString()} tokens total
                  </span>
                  <span className="text-slate-300" aria-hidden="true">·</span>
                  <span className="text-[11px] font-mono text-emerald-600 font-semibold">
                    ~${health.telemetry.estimatedCostUsd.toFixed(4)} USD
                  </span>
                  <span className="text-slate-300" aria-hidden="true">·</span>
                  <span className="text-[11px] font-mono text-slate-500">
                    {health.telemetry.totalCalls} calls
                  </span>
                  <span className="text-slate-300" aria-hidden="true">·</span>
                  <span className="text-[11px] font-mono text-slate-500">
                    {health.memory?.heapUsedMb} MB heap
                  </span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-400">
              Connect backend to view LLM resilience telemetry.
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-center gap-2 text-xs text-amber-800">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" aria-hidden="true" />
          <span>
            Notice: Backend server is currently not responding on {BACKEND_ORIGIN}. If running locally, start backend with <code className="font-mono font-semibold bg-amber-100 px-1 py-0.5 rounded">npm run dev</code> in the backend folder.
          </span>
        </div>
      )}
    </Card>
  );
};
