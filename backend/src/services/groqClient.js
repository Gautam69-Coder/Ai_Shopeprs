import Groq from 'groq-sdk';
import { RELIABILITY_CONFIG } from '../config/reliability.js';

let groqInstance = null;

/**
 * Returns a singleton Groq API client instance.
 * Reads GROQ_API_KEY from environment variables.
 */
export const getGroqClient = () => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY environment variable is not configured.');
  }

  if (!groqInstance) {
    groqInstance = new Groq({ apiKey });
  }

  return groqInstance;
};

// ---------------------------------------------------------------------------
// Global in-memory LLM telemetry accumulator (singleton)
// ---------------------------------------------------------------------------

/** @type {{ totalCalls: number, successfulCalls: number, totalRetries: number, cumulativePromptTokens: number, cumulativeCompletionTokens: number, cumulativeTotalTokens: number, cumulativeCostUsd: number, lastCallDurationMs: number }} */
const llmTelemetry = {
  totalCalls: 0,
  successfulCalls: 0,
  totalRetries: 0,
  cumulativePromptTokens: 0,
  cumulativeCompletionTokens: 0,
  cumulativeTotalTokens: 0,
  cumulativeCostUsd: 0,
  lastCallDurationMs: 0,
};

/** Returns a snapshot of the global LLM telemetry counters */
export const getGlobalLlmTelemetry = () => ({ ...llmTelemetry });

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns true when the error code/status warrants an automatic retry.
 * Non-retryable: 400 (bad request / schema), 401 (auth failure).
 */
const isRetryable = (error) => {
  const status = error?.status ?? error?.statusCode ?? null;
  if (status === 400 || status === 401) return false;
  if ([429, 500, 502, 503, 504].includes(status)) return true;
  const code = error?.code || '';
  if (['ETIMEDOUT', 'ECONNRESET', 'ECONNREFUSED', 'ENOTFOUND'].includes(code)) return true;
  // Network / fetch errors with no status
  if (!status) return true;
  return false;
};

/**
 * Jittered exponential backoff delay (ms).
 * Formula: min(maxDelay, baseDelay * 2^attempt + random(0..500))
 */
const backoffDelay = (attempt) => {
  const { baseRetryDelayMs, maxRetryDelayMs } = RELIABILITY_CONFIG;
  const exponential = baseRetryDelayMs * Math.pow(2, attempt);
  const jitter = Math.random() * 500;
  return Math.min(maxRetryDelayMs, exponential + jitter);
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ---------------------------------------------------------------------------
// Core function
// ---------------------------------------------------------------------------

/**
 * Executes a structured chat completion using the Groq API with:
 *  - Automatic exponential backoff retries for transient failures
 *  - Per-call timeout via AbortSignal
 *  - Token usage extraction & cost accounting
 *  - Global telemetry accumulation
 *
 * @param {Object} options
 * @param {Array<{role: string, content: string}>} options.messages
 * @param {string} [options.model]
 * @param {number} [options.temperature=0.7]
 * @returns {Promise<{ content: string, usage: { promptTokens: number, completionTokens: number, totalTokens: number, estimatedCostUsd: number, durationMs: number, retryCount: number } }>}
 */
export const executeChatCompletion = async ({
  messages,
  model = process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
  temperature = 0.7,
}) => {
  const client = getGroqClient();
  const { maxRetries, llmTimeoutMs, promptTokenCostPerMillion, completionTokenCostPerMillion } =
    RELIABILITY_CONFIG;

  llmTelemetry.totalCalls++;
  const callStart = Date.now();
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutHandle = setTimeout(() => controller.abort(), llmTimeoutMs);

      let response;
      try {
        response = await client.chat.completions.create(
          {
            model,
            messages,
            temperature,
            response_format: { type: 'json_object' },
          },
          { signal: controller.signal }
        );
      } finally {
        clearTimeout(timeoutHandle);
      }

      const content = response.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('Empty response received from Groq LLM API.');
      }

      // ---- Token usage & cost accounting ----
      const promptTokens = response.usage?.prompt_tokens ?? 0;
      const completionTokens = response.usage?.completion_tokens ?? 0;
      const totalTokens = response.usage?.total_tokens ?? promptTokens + completionTokens;
      const estimatedCostUsd =
        (promptTokens / 1_000_000) * promptTokenCostPerMillion +
        (completionTokens / 1_000_000) * completionTokenCostPerMillion;
      const durationMs = Date.now() - callStart;

      // ---- Accumulate global telemetry ----
      llmTelemetry.successfulCalls++;
      llmTelemetry.totalRetries += attempt;
      llmTelemetry.cumulativePromptTokens += promptTokens;
      llmTelemetry.cumulativeCompletionTokens += completionTokens;
      llmTelemetry.cumulativeTotalTokens += totalTokens;
      llmTelemetry.cumulativeCostUsd += estimatedCostUsd;
      llmTelemetry.lastCallDurationMs = durationMs;

      return {
        content,
        usage: {
          promptTokens,
          completionTokens,
          totalTokens,
          estimatedCostUsd,
          durationMs,
          retryCount: attempt,
        },
      };
    } catch (error) {
      lastError = error;
      const retryable = isRetryable(error);

      if (!retryable || attempt >= maxRetries) {
        console.error(
          `[Groq Client] Non-retryable error or max retries exhausted (attempt ${attempt + 1}):`,
          error.message
        );
        break;
      }

      const delay = backoffDelay(attempt);
      console.warn(
        `[Groq Client] Transient error (attempt ${attempt + 1}/${maxRetries + 1}). Retrying in ${Math.round(delay)}ms. Error: ${error.message}`
      );
      await sleep(delay);
    }
  }

  throw lastError;
};
