/**
 * server/routes/budgets.js
 * GET  /api/budgets           — list all budgets
 * POST /api/budgets            — create/update a budget (upsert)
 * GET  /api/budgets/progress   — current month progress per category
 * DELETE /api/budgets/:id      — delete a budget
 */
import express from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import prisma from '../../lib/prisma.js';

const router = express.Router();
router.use(authenticate);

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const CATEGORIES = [
  'Food & Dining','Transport','Rent & Utilities','Entertainment',
  'Software/SaaS','Travel','Investments','Health','Salary','Others',
];

// ── GET /api/budgets ─────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { month, year } = req.query;
    const m = month ? parseInt(month) : new Date().getMonth() + 1;
    const y = year  || String(new Date().getFullYear());

    const budgets = await prisma.budget.findMany({
      where: { userId: req.user.id, month: m, year: parseInt(y) },
    });
    return res.status(200).json(budgets);
  } catch (err) {
    console.error('[GET /api/budgets]', err);
    return res.status(500).json({ message: 'Failed to fetch budgets.' });
  }
});

// ── GET /api/budgets/progress ─────────────────────────────────────────────────
router.get('/progress', async (req, res) => {
  try {
    const now    = new Date();
    const m      = now.getMonth() + 1;
    const y      = now.getFullYear();
    const today  = now.toISOString().split('T')[0];

    const [budgets, expenses] = await Promise.all([
      prisma.budget.findMany({ where: { userId: req.user.id, month: m, year: y } }),
      prisma.expense.findMany({
        where: { userId: req.user.id, type: 'expense', date: { gte: `${y}-${String(m).padStart(2,'0')}-01`, lte: today } },
      }),
    ]);

    const spent = {};
    expenses.forEach((e) => {
      spent[e.category] = (spent[e.category] || 0) + Number(e.amount);
    });

    const progress = budgets.map((b) => ({
      category: b.category,
      limit:    b.limit,
      spent:    spent[b.category] || 0,
      percent:  Math.min(100, Math.round(((spent[b.category] || 0) / b.limit) * 100)),
    }));

    // Budget alerts: categories where spending >= 80%
    const alerts = progress
      .filter((p) => p.percent >= 80)
      .map((p) => ({ category: p.category, percent: p.percent, status: p.percent >= 100 ? 'exceeded' : 'warning' }));

    return res.status(200).json({ budgets: progress, alerts, month: m, year: y });
  } catch (err) {
    console.error('[GET /api/budgets/progress]', err);
    return res.status(500).json({ message: 'Failed to fetch budget progress.' });
  }
});

// ── POST /api/budgets (upsert) ────────────────────────────────────────────────
router.post('/', requireRole('owner','editor'), async (req, res) => {
  try {
    const { category, limit, month, year } = req.body;
    if (!CATEGORIES.includes(category)) return res.status(400).json({ message: 'Invalid category.' });
    if (!limit || limit <= 0) return res.status(400).json({ message: 'Invalid limit.' });

    const m = month !== undefined ? parseInt(month) : new Date().getMonth() + 1;
    const y = year  || new Date().getFullYear();

    const budget = await prisma.budget.upsert({
      where: { userId_category_month_year: { userId: req.user.id, category, month: m, year: y } },
      update: { limit: parseFloat(limit) },
      create: { category, limit: parseFloat(limit), month: m, year: y, userId: req.user.id },
    });
    return res.status(201).json(budget);
  } catch (err) {
    console.error('[POST /api/budgets]', err);
    return res.status(500).json({ message: 'Failed to save budget.' });
  }
});

// ── DELETE /api/budgets/:id ───────────────────────────────────────────────────
router.delete('/:id', requireRole('owner','editor'), async (req, res) => {
  try {
    const budget = await prisma.budget.findUnique({ where: { id: req.params.id } });
    if (!budget) return res.status(404).json({ message: 'Budget not found.' });
    if (budget.userId !== req.user.id) return res.status(403).json({ message: 'Not your budget.' });
    await prisma.budget.delete({ where: { id: req.params.id } });
    return res.status(200).json({ message: 'Budget deleted.' });
  } catch (err) {
    console.error('[DELETE /api/budgets]', err);
    return res.status(500).json({ message: 'Failed to delete budget.' });
  }
});

export { router as budgetsRouter, CATEGORIES };
