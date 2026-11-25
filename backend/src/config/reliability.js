/**
 * Phase 6 — Reliability & Production Hardening
 * Centralised configuration for LLM retries, concurrency, rate limiting, and cost accounting.
 * All values can be overridden via environment variables.
 */
export const RELIABILITY_CONFIG = {
  // LLM concurrency: max simultaneous Groq API calls per simulation batch
  maxConcurrentLlmCalls: parseInt(process.env.MAX_CONCURRENT_LLM_CALLS || '2', 10),

  // Delay between processing batch chunks (ms) — reduces burst load on the API
  interBatchDelayMs: parseInt(process.env.INTER_BATCH_DELAY_MS || '300', 10),

  // Exponential backoff retry settings
  maxRetries: parseInt(process.env.LLM_MAX_RETRIES || '3', 10),
  baseRetryDelayMs: parseInt(process.env.LLM_BASE_RETRY_DELAY_MS || '1000', 10),
  maxRetryDelayMs: parseInt(process.env.LLM_MAX_RETRY_DELAY_MS || '8000', 10),

  // Per-call LLM timeout (ms)
  llmTimeoutMs: parseInt(process.env.LLM_TIMEOUT_MS || '45000', 10),

  // In-memory rate limiting (requests per minute)
  rateLimitGeneralRpm: parseInt(process.env.RATE_LIMIT_GENERAL_RPM || '120', 10),
  rateLimitLlmRpm: parseInt(process.env.RATE_LIMIT_LLM_RPM || '15', 10),

  // Token cost accounting (USD per 1,000,000 tokens)
  promptTokenCostPerMillion: parseFloat(process.env.COST_PROMPT_PER_M || '0.15'),
  completionTokenCostPerMillion: parseFloat(process.env.COST_COMPLETION_PER_M || '0.60'),
};
