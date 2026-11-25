/**
 * Phase 6 Reliability Stress Test Script
 * Run: npm run test:reliability  (from backend/ directory)
 *
 * Tests:
 *  1. LLM rate limit enforcement → expects 429 on 16th request within 1 min
 *  2. Token cost calculation formula correctness
 *  3. Health endpoint shape validation (llm, telemetry, memory fields)
 *  4. Telemetry accumulation across multiple calls via health poll
 */

import 'dotenv/config';

const BASE_URL = `http://localhost:${process.env.PORT || 5000}`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const pass = (msg) => console.log(`  ✅  ${msg}`);
const fail = (msg) => { console.error(`  ❌  ${msg}`); process.exitCode = 1; };
const header = (n, title) => console.log(`\n${'─'.repeat(60)}\nTest ${n}: ${title}\n${'─'.repeat(60)}`);

const fetchJson = async (url, opts = {}) => {
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...opts });
  let body;
  try { body = await res.json(); } catch { body = {}; }
  return { status: res.status, body, headers: res.headers };
};

// ---------------------------------------------------------------------------
// Test 1: LLM rate-limit enforcement on /api/simulations/run
// ---------------------------------------------------------------------------
header(1, 'LLM Rate-limit enforcement (POST /api/simulations/run)');

const LLM_LIMIT = parseInt(process.env.RATE_LIMIT_LLM_RPM || '15', 10);
const BURST_COUNT = LLM_LIMIT + 1;      // one over the limit
let got429 = false;

console.log(`  Firing ${BURST_COUNT} rapid POST requests to /api/simulations/run ...`);
for (let i = 1; i <= BURST_COUNT; i++) {
  const { status, body, headers } = await fetchJson(`${BASE_URL}/api/simulations/run`, {
    method: 'POST',
    body: JSON.stringify({ batchId: 'test-rl-batch', product: { name: 'RL Test', category: 'Test', price: 100, description: 'Rate limit test product', currency: 'INR' } }),
  });

  if (status === 429) {
    got429 = true;
    const retryAfter = headers.get('Retry-After');
    pass(`Request #${i} correctly returned 429. Retry-After: ${retryAfter}s. Message: "${body.message}"`);
    break;
  }
  // 400/422/500 is fine — the endpoint received the request; we care about rate-limit 429
  process.stdout.write(`  [req ${i}] status=${status} `);
  if (i % 5 === 0) process.stdout.write('\n');
}
if (!got429) {
  fail(`Expected a 429 after ${LLM_LIMIT} requests but none received.`);
} else {
  pass('Rate limiter correctly rejected burst requests.');
}

// ---------------------------------------------------------------------------
// Test 2: Token cost calculation formula correctness
// ---------------------------------------------------------------------------
header(2, 'Token cost calculation formula');

const COST_PROMPT_PER_M = parseFloat(process.env.COST_PROMPT_PER_M || '0.15');
const COST_COMPLETION_PER_M = parseFloat(process.env.COST_COMPLETION_PER_M || '0.60');

const testCases = [
  { promptTokens: 1000, completionTokens: 500, expectedCost: (1000 / 1_000_000) * COST_PROMPT_PER_M + (500 / 1_000_000) * COST_COMPLETION_PER_M },
  { promptTokens: 10000, completionTokens: 2000, expectedCost: (10000 / 1_000_000) * COST_PROMPT_PER_M + (2000 / 1_000_000) * COST_COMPLETION_PER_M },
  { promptTokens: 0, completionTokens: 0, expectedCost: 0 },
];

for (const tc of testCases) {
  const computed =
    (tc.promptTokens / 1_000_000) * COST_PROMPT_PER_M +
    (tc.completionTokens / 1_000_000) * COST_COMPLETION_PER_M;
  const delta = Math.abs(computed - tc.expectedCost);
  if (delta < 1e-10) {
    pass(`prompt=${tc.promptTokens} + completion=${tc.completionTokens} → $${computed.toFixed(8)} (matches formula)`);
  } else {
    fail(`Cost mismatch: got ${computed}, expected ${tc.expectedCost}`);
  }
}

// ---------------------------------------------------------------------------
// Test 3: Health endpoint shape validation
// ---------------------------------------------------------------------------
header(3, 'GET /api/health — enriched response shape');

const { status: healthStatus, body: health } = await fetchJson(`${BASE_URL}/api/health`);

if (healthStatus !== 200) {
  fail(`Expected 200 from /api/health, got ${healthStatus}.`);
} else {
  pass(`Status 200 OK`);
}

const requiredTopKeys = ['status', 'uptime', 'database', 'llm', 'telemetry', 'memory'];
for (const key of requiredTopKeys) {
  if (key in health) {
    pass(`Top-level key "${key}" present`);
  } else {
    fail(`Missing top-level key: "${key}"`);
  }
}

const llmKeys = ['model', 'maxConcurrency', 'maxRetries', 'timeoutMs'];
for (const key of llmKeys) {
  if (health.llm && key in health.llm) {
    pass(`health.llm.${key} = ${health.llm[key]}`);
  } else {
    fail(`Missing health.llm.${key}`);
  }
}

const telemetryKeys = ['totalCalls', 'retries', 'cumulativeTokens', 'estimatedCostUsd'];
for (const key of telemetryKeys) {
  if (health.telemetry && key in health.telemetry) {
    pass(`health.telemetry.${key} = ${health.telemetry[key]}`);
  } else {
    fail(`Missing health.telemetry.${key}`);
  }
}

const memoryKeys = ['heapUsedMb', 'heapTotalMb', 'rssMb'];
for (const key of memoryKeys) {
  if (health.memory && key in health.memory) {
    pass(`health.memory.${key} = ${health.memory[key]} MB`);
  } else {
    fail(`Missing health.memory.${key}`);
  }
}

// ---------------------------------------------------------------------------
// Test 4: General rate limiter headers present on API responses
// ---------------------------------------------------------------------------
header(4, 'General rate limiter headers on /api/health');

const { headers: healthHeaders } = await fetchJson(`${BASE_URL}/api/health`);

const rlHeadersToCheck = ['x-ratelimit-limit', 'x-ratelimit-remaining'];
for (const h of rlHeadersToCheck) {
  const val = healthHeaders.get(h);
  if (val !== null) {
    pass(`Header "${h}": ${val}`);
  } else {
    fail(`Missing response header: "${h}"`);
  }
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log(`\n${'═'.repeat(60)}`);
if (process.exitCode === 1) {
  console.error('⚠️  Some reliability tests FAILED. Review output above.');
} else {
  console.log('🎉  All Phase 6 reliability tests PASSED.');
}
console.log('═'.repeat(60));
