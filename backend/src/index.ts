import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { config } from '../config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import jobsRouter from './routes/jobs.js';
import inventoryRouter from './routes/inventory.js';
import aiRouter from './routes/ai.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: config.clientUrl, credentials: true }));
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'GaragePro CRM Backend is running 🚗' });
});

// Routes
app.use('/api/jobs', jobsRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/ai', aiRouter);

// Error handler
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`🚀 Backend running on http://localhost:${config.port}`);
  console.log(`📦 Environment: ${config.nodeEnv}`);
});

export default app;
