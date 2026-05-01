/**
 * server.js — Express entry point (Phase 2: Auth + Budgets + Recurring + Export)
 */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes    from './server/routes/auth.js';
import expenseRoutes from './server/routes/expenses.js';
import { budgetsRouter } from './server/routes/budgets.js';
import recurringRoutes from './server/routes/recurring.js';
import aiRoutes       from './server/routes/ai.js';
import exportRoutes   from './server/routes/export.js';

const app  = express();
const PORT = process.env.PORT || 4000;

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','x-api-key'],
}));
app.use(express.json({ limit: '5mb' }));

// ── Health ────────────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Executive Ledger API', timestamp: new Date().toISOString() });
});

// ── Auth routes (no auth needed for register/login/accept-invite) ──────────────
app.use('/api/auth', authRoutes);

// ── Protected routes ────────────────────────────────────────────────────────────
app.use('/api/expenses',  expenseRoutes);
app.use('/api/budgets',   budgetsRouter);
app.use('/api/recurring', recurringRoutes);
app.use('/api/export',    exportRoutes);
app.use('/api/ai',        aiRoutes);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ message: 'Route not found.' }));

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[Unhandled Error]', err);
  res.status(500).json({ message: 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`\n🚀  Executive Ledger API running at http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health\n`);
});
