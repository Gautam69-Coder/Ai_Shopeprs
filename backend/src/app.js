import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { notFoundHandler, errorHandler } from './middlewares/errorHandler.js';
import { generalRateLimiter } from './middlewares/rateLimiter.js';

const app = express();

// Configure CORS
const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({
  origin: allowedOrigin,
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
