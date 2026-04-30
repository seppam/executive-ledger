/**
 * server/routes/expenses.js
 * ─────────────────────────────────────────────────────────────────────────────
 * GET  /api/expenses       — Fetch all expenses (newest first)
 * POST /api/expenses       — Create a new expense
 * PUT  /api/expenses/:id   — Update an existing expense
 * DELETE /api/expenses/:id — Delete an expense
 * GET  /api/expenses/stats — Aggregated stats (total, monthly breakdown)
 */

import express from 'express';
import prisma from '../../lib/prisma.js';

const router = express.Router();

// ── GET /api/expenses ─────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const expenses = await prisma.expense.findMany({
      orderBy: { date: 'desc' },
    });
    return res.status(200).json(expenses);
  } catch (err) {
    console.error('[GET /api/expenses]', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

// ── GET /api/expenses/stats ───────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const expenses = await prisma.expense.findMany({ orderBy: { date: 'desc' } });

    const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

    // Monthly breakdown for current year
    const currentYear = new Date().getFullYear();
    const byMonth = {};
    for (let m = 1; m <= 12; m++) byMonth[m] = 0;
    expenses
      .filter((e) => e.date.startsWith(String(currentYear)))
      .forEach((e) => {
        const month = parseInt(e.date.split('-')[1], 10);
        if (byMonth[month] !== undefined) byMonth[month] += Number(e.amount);
      });

    // Category breakdown (all time)
    const byCategory = {};
    expenses.forEach((e) => {
      byCategory[e.category] = (byCategory[e.category] || 0) + Number(e.amount);
    });

    return res.status(200).json({
      total,
      count: expenses.length,
      byMonth,
      byCategory,
    });
  } catch (err) {
    console.error('[GET /api/expenses/stats]', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

// ── POST /api/expenses ────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { amount, category, description, date } = req.body;

    if (!amount || !category || !description || !date) {
      return res.status(400).json({ message: 'Missing required fields: amount, category, description, date.' });
    }

    const expense = await prisma.expense.create({
      data: {
        amount:      parseFloat(amount),
        category,
        description: description.trim(),
        date,
      },
    });

    return res.status(201).json(expense);
  } catch (err) {
    console.error('[POST /api/expenses]', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

// ── PUT /api/expenses/:id ────────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const { id }    = req.params;
    const { amount, category, description, date } = req.body;

    const existing = await prisma.expense.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: 'Expense not found.' });

    const updated = await prisma.expense.update({
      where: { id },
      data: {
        amount:      amount      !== undefined ? parseFloat(amount)      : existing.amount,
        category:    category    || existing.category,
        description: description !== undefined ? description.trim()     : existing.description,
        date:        date        || existing.date,
      },
    });

    return res.status(200).json(updated);
  } catch (err) {
    console.error('[PUT /api/expenses/:id]', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

// ── DELETE /api/expenses/:id ──────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.expense.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: 'Expense not found.' });

    await prisma.expense.delete({ where: { id } });
    return res.status(200).json({ message: 'Expense deleted.', id });
  } catch (err) {
    console.error('[DELETE /api/expenses/:id]', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

export default router;
