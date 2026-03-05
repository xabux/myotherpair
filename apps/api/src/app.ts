import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRouter from './routes/auth.js';
import usersRouter from './routes/users.js';
import listingsRouter from './routes/listings.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env['ALLOWED_ORIGINS']?.split(',') ?? ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

// ─── Health ───────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/listings', listingsRouter);

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ─── Error handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

export default app;
