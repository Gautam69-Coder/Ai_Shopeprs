import { getDbStatus } from '../config/db.js';
import { getGlobalLlmTelemetry } from '../services/groqClient.js';
import { RELIABILITY_CONFIG } from '../config/reliability.js';

/**
 * GET /
 * Root welcome endpoint
 */
export const getWelcome = (req, res) => {
  res.status(200).json({
    message: 'Welcome to Synthetic Shopper API',
    status: 'active',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
    },
  });
};

/**
 * GET /api/health
 * Phase 6 — Enriched health endpoint:
 *  - LLM configuration & concurrency settings
 *  - Global telemetry counters (tokens, cost, retries)
 *  - Node.js process memory metrics
 */
export const getHealth = (req, res) => {
  const dbStatus = getDbStatus();
  const telemetry = getGlobalLlmTelemetry();
  const mem = process.memoryUsage();

  res.status(200).json({
    status: 'ok',
    service: 'synthetic-shopper-backend',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatus,
    },
    llm: {
      model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
      maxConcurrency: RELIABILITY_CONFIG.maxConcurrentLlmCalls,
      maxRetries: RELIABILITY_CONFIG.maxRetries,
      timeoutMs: RELIABILITY_CONFIG.llmTimeoutMs,
    },
    telemetry: {
      totalCalls: telemetry.totalCalls,
      successfulCalls: telemetry.successfulCalls,
      retries: telemetry.totalRetries,
      cumulativePromptTokens: telemetry.cumulativePromptTokens,
      cumulativeCompletionTokens: telemetry.cumulativeCompletionTokens,
      cumulativeTokens: telemetry.cumulativeTotalTokens,
      estimatedCostUsd: parseFloat(telemetry.cumulativeCostUsd.toFixed(6)),
      lastCallDurationMs: telemetry.lastCallDurationMs,
    },
    memory: {
      heapUsedMb: parseFloat((mem.heapUsed / 1024 / 1024).toFixed(1)),
      heapTotalMb: parseFloat((mem.heapTotal / 1024 / 1024).toFixed(1)),
      rssMb: parseFloat((mem.rss / 1024 / 1024).toFixed(1)),
    },
  });
};
