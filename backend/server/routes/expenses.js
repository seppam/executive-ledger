/**
 * server/routes/expenses.js
 * Full CRUD — all routes require authentication
 * Also handles lazy-logging of recurring transactions
 */
import express from 'express';
import { authenticate } from '../middleware/auth.js';
import prisma from '../../lib/prisma.js';

const router = express.Router();
router.use(authenticate);

// ── Helpers ───────────────────────────────────────────────────────────────────

function isDue(lastLogged, frequency, startDate) {
  const today  = new Date().toISOString().split('T')[0];
  const last   = lastLogged || startDate;

  if (frequency === 'daily') {
    return today !== last;
  }
  if (frequency === 'weekly') {
    const daysDiff = Math.floor((new Date(today) - new Date(last)) / 86400000);
    return daysDiff >= 7;
  }
  if (frequency === 'monthly') {
    const [ly, lm, ld] = last.split('-').map(Number);
    const [ty, tm]     = today.split('-').map(Number);
    const lastMonthEnd = new Date(ly, lm, 0).getDate(); // days in last logged month
    const targetDate   = Math.min(ld, lastMonthEnd);
    return (ty > ly || tm > lm) &&
      `${ty}-${String(tm).padStart(2,'0')}-${String(targetDate).padStart(2,'0')}` <= today;
  }
  return false;
}

// Lazy-log: create expense for any due recurring rule
async function processRecurringRules(userId) {
  const rules = await prisma.recurringRule.findMany({ where: { userId, isActive: true } });
  const today  = new Date().toISOString().split('T')[0];
  const results = [];

  for (const rule of rules) {
    if (isDue(rule.lastLoggedAt, rule.frequency, rule.startDate)) {
      await prisma.expense.create({
        data: {
          amount:          rule.amount,
          type:            rule.type,
          category:        rule.category,
          description:     rule.description,
          date:            today,
          isRecurring:     true,
          recurringRuleId: rule.id,
          userId,
        },
      });
      await prisma.recurringRule.update({
        where: { id: rule.id },
        data: { lastLoggedAt: today },
      });
      results.push(rule.id);
    }
  }
  return results;
}

// ── GET /api/expenses ─────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    // Trigger lazy-log on every fetch
    await processRecurringRules(req.user.id);

    const { type, category, from, to, search } = req.query;
    const where = { userId: req.user.id };

    if (type     && ['income','expense'].includes(type)) where.type     = type;
    if (category)                                           where.category = category;
    if (from     || to) {
      where.date = {};
      if (from) where.date.gte = from;
      if (to)   where.date.lte = to;
    }
    if (search) where.description = { contains: search };

    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { date: 'desc' },
    });
    return res.status(200).json(expenses);
  } catch (err) {
    console.error('[GET /api/expenses]', err);
    return res.status(500).json({ message: 'Failed to fetch expenses.' });
  }
});

// ── GET /api/expenses/stats ────────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const { year } = req.query;
    const y = year || String(new Date().getFullYear());

    const expenses = await prisma.expense.findMany({
      where: { userId: req.user.id, date: { startsWith: y } },
    });

    const totalIncome   = expenses.filter((e) => e.type === 'income').reduce((s, e) => s + Number(e.amount), 0);
    const totalExpense  = expenses.filter((e) => e.type === 'expense').reduce((s, e) => s + Number(e.amount), 0);
    const netBalance    = totalIncome - totalExpense;

    const byMonth = {};
    for (let m = 1; m <= 12; m++) {
      byMonth[m] = { income: 0, expense: 0 };
    }
    expenses.forEach((e) => {
      const month = parseInt(e.date.split('-')[1], 10);
      if (byMonth[month]) byMonth[month][e.type] += Number(e.amount);
    });

    const byCategory = { income: {}, expense: {} };
    expenses.forEach((e) => {
      if (!byCategory[e.type][e.category]) byCategory[e.type][e.category] = 0;
      byCategory[e.type][e.category] += Number(e.amount);
    });

    return res.status(200).json({
      totalIncome, totalExpense, netBalance,
      byMonth, byCategory,
      count: expenses.length,
    });
  } catch (err) {
    console.error('[GET /api/expenses/stats]', err);
    return res.status(500).json({ message: 'Failed to fetch stats.' });
  }
});

// ── POST /api/expenses ────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { amount, type, category, description, date } = req.body;
    if (!amount || !type || !category || !description || !date) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }
    if (!['income','expense'].includes(type)) {
      return res.status(400).json({ message: 'type must be "income" or "expense".' });
    }

    const expense = await prisma.expense.create({
      data: { amount: parseFloat(amount), type, category, description: description.trim(), date, userId: req.user.id },
    });
    return res.status(201).json(expense);
  } catch (err) {
    console.error('[POST /api/expenses]', err);
    return res.status(500).json({ message: 'Failed to create expense.' });
  }
});

// ── PUT /api/expenses/:id ─────────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const existing = await prisma.expense.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ message: 'Not found.' });
    if (existing.userId !== req.user.id) return res.status(403).json({ message: 'Not your transaction.' });

    const { amount, type, category, description, date } = req.body;
    const updated = await prisma.expense.update({
      where: { id: req.params.id },
      data: {
        amount:      amount      !== undefined ? parseFloat(amount)        : existing.amount,
        type:        type        !== undefined ? type                     : existing.type,
        category:    category    !== undefined ? category                 : existing.category,
        description: description !== undefined ? description.trim()        : existing.description,
        date:        date        !== undefined ? date                     : existing.date,
      },
    });
    return res.status(200).json(updated);
  } catch (err) {
    console.error('[PUT /api/expenses/:id]', err);
    return res.status(500).json({ message: 'Failed to update expense.' });
  }
});

// ── DELETE /api/expenses/:id ─────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const existing = await prisma.expense.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ message: 'Not found.' });
    if (existing.userId !== req.user.id) return res.status(403).json({ message: 'Not your transaction.' });

    await prisma.expense.delete({ where: { id: req.params.id } });
    return res.status(200).json({ message: 'Deleted.', id: req.params.id });
  } catch (err) {
    console.error('[DELETE /api/expenses/:id]', err);
    return res.status(500).json({ message: 'Failed to delete expense.' });
  }
});

export default router;
