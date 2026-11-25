/** Phase 6 — Enriched /api/health response type definitions */

export interface HealthLlm {
  model: string;
  maxConcurrency: number;
  maxRetries: number;
  timeoutMs: number;
}

export interface HealthTelemetry {
  totalCalls: number;
  successfulCalls: number;
  retries: number;
  cumulativePromptTokens: number;
  cumulativeCompletionTokens: number;
  cumulativeTokens: number;
  estimatedCostUsd: number;
  lastCallDurationMs: number;
}

export interface HealthMemory {
  heapUsedMb: number;
  heapTotalMb: number;
  rssMb: number;
}

export interface HealthResponse {
  status: string;
  service: string;
  uptime: number;
  timestamp: string;
  database: {
    status: string;
  };
  llm: HealthLlm;
  telemetry: HealthTelemetry;
  memory: HealthMemory;
}
