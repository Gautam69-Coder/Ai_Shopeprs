import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { notFoundHandler, errorHandler } from './middlewares/errorHandler.js';
import { generalRateLimiter } from './middlewares/rateLimiter.js';

const app = express();

// Trust first reverse proxy (e.g., Render) so req.ip uses X-Forwarded-For
app.set('trust proxy', 1);

const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://ai-shoppers.pages.dev',
];

const CLOUDFLARE_PREVIEW_ORIGIN_RE = /^https:\/\/[a-z0-9-]+\.ai-shoppers\.pages\.dev$/i;

const normalizeOrigin = (url) => url.trim().replace(/\/+$/, '');

export const getAllowedOrigins = () => {
  const envOrigins = [process.env.FRONTEND_URL, process.env.CORS_ORIGINS]
    .filter(Boolean)
    .flatMap((value) => value.split(','))
    .map(normalizeOrigin)
    .filter(Boolean);

  return Array.from(new Set([...DEFAULT_ALLOWED_ORIGINS, ...envOrigins]));
};

export const isOriginAllowed = (origin, allowedOrigins = getAllowedOrigins()) => {
  if (!origin) return true;
  const normalized = normalizeOrigin(origin);
  return allowedOrigins.includes(normalized) || CLOUDFLARE_PREVIEW_ORIGIN_RE.test(normalized);
};

// Configure CORS (resolved per-request so dotenv values loaded in server.js are respected)
app.use(cors({
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }
    const err = new Error(`CORS policy: Origin ${origin} is not allowed`);
    err.statusCode = 403;
    return callback(err);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

// Standard body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Phase 6: Global general-purpose rate limiter on all API requests
app.use('/api', generalRateLimiter);

// Register application routes
app.use(routes);

// Register 404 and global error handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
