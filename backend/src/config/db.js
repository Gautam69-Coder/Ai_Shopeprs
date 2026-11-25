import mongoose from 'mongoose';

const CONNECTION_STATES = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

/**
 * Returns current MongoDB connection state.
 * @returns {'disconnected' | 'connected' | 'connecting' | 'disconnecting' | 'unknown'}
 */
export const getDbStatus = () => {
  return CONNECTION_STATES[mongoose.connection.readyState] || 'unknown';
};

/**
 * Connects to MongoDB asynchronously.
 * If connection fails, logs warning and allows the application to proceed gracefully.
 */
export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn('[DB] Warning: MONGODB_URI is not set. Operating without database connection.');
    return;
  }

  try {
    console.log('[DB] Connecting to MongoDB...');
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('[DB] MongoDB connected successfully.');
  } catch (error) {
    console.warn(`[DB] Warning: MongoDB connection error (${error.message}). Server running in degraded mode.`);
  }
};

mongoose.connection.on('disconnected', () => {
  console.log('[DB] MongoDB disconnected.');
});

mongoose.connection.on('error', (err) => {
  console.error(`[DB] MongoDB error event: ${err.message}`);
});
