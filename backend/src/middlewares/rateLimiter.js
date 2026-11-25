/**
 * Phase 6 — Reliability & Production Hardening
 * Pure in-memory sliding-window rate limiter middleware factory.
 * No external packages required.
 */

/**
 * @typedef {{ timestamps: number[] }} WindowEntry
 * @type {Map<string, WindowEntry>}
 */
const ipWindows = new Map();

/**
 * Creates an Express rate-limiter middleware using a sliding-window algorithm.
 *
 * @param {{ windowMs: number, maxRequests: number, message?: string }} options
 * @returns {import('express').RequestHandler}
 */
export const createRateLimiter = ({ windowMs, maxRequests, message }) => {
  const errorMessage = message || 'Too many requests. Please wait before retrying.';

  return (req, res, next) => {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    // Use a limiter-specific key so different limiters share the same Map safely
    const limiterKey = `${windowMs}:${maxRequests}:${ip}`;
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!ipWindows.has(limiterKey)) {
      ipWindows.set(limiterKey, { timestamps: [] });
    }

    const entry = ipWindows.get(limiterKey);

    // Prune timestamps outside the current window
    entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);

    const remaining = maxRequests - entry.timestamps.length;

    // Set informational headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, remaining - 1));

    if (entry.timestamps.length >= maxRequests) {
      // Calculate how many seconds until the oldest request leaves the window
      const oldestTs = entry.timestamps[0];
      const retryAfterMs = Math.ceil((oldestTs + windowMs - now) / 1000);
      res.setHeader('Retry-After', retryAfterMs);

      return res.status(429).json({
        success: false,
        message: errorMessage,
        retryAfter: retryAfterMs,
      });
    }

    entry.timestamps.push(now);
    next();
  };
};

// Pre-built general API rate limiter (120 req/min)
import { RELIABILITY_CONFIG } from '../config/reliability.js';

export const generalRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: RELIABILITY_CONFIG.rateLimitGeneralRpm,
  message: 'API rate limit reached. Please slow down your requests.',
});

// Pre-built LLM-specific rate limiter (15 req/min)
export const llmRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: RELIABILITY_CONFIG.rateLimitLlmRpm,
  message: 'LLM simulation rate limit reached. Please wait before launching another simulation.',
});
