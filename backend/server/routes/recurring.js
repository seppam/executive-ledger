/**
 * server/routes/recurring.js
 * GET  /api/recurring          — list recurring rules
 * POST /api/recurring           — create rule
 * PUT  /api/recurring/:id       — update rule
 * DELETE /api/recurring/:id     — delete rule
 */
import express from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import prisma from '../../lib/prisma.js';

const router = express.Router();
router.use(authenticate);

// ── GET /api/recurring ───────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const rules = await prisma.recurringRule.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json(rules);
  } catch (err) {
    console.error('[GET /api/recurring]', err);
    return res.status(500).json({ message: 'Failed to fetch recurring rules.' });
  }
});

// ── POST /api/recurring ───────────────────────────────────────────────────────
router.post('/', requireRole('owner','editor'), async (req, res) => {
  try {
    const { amount, type, category, description, frequency, startDate } = req.body;
    if (!amount || !type || !category || !description || !frequency || !startDate) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }
    if (!['income','expense'].includes(type)) return res.status(400).json({ message: 'type must be income or expense.' });
    if (!['daily','weekly','monthly'].includes(frequency)) return res.status(400).json({ message: 'frequency must be daily, weekly, or monthly.' });

    const rule = await prisma.recurringRule.create({
      data: { amount: parseFloat(amount), type, category, description: description.trim(), frequency, startDate, userId: req.user.id },
    });
    return res.status(201).json(rule);
  } catch (err) {
    console.error('[POST /api/recurring]', err);
    return res.status(500).json({ message: 'Failed to create recurring rule.' });
  }
});

// ── PUT /api/recurring/:id ────────────────────────────────────────────────────
router.put('/:id', requireRole('owner','editor'), async (req, res) => {
  try {
    const existing = await prisma.recurringRule.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ message: 'Rule not found.' });
    if (existing.userId !== req.user.id) return res.status(403).json({ message: 'Not your rule.' });

    const { amount, type, category, description, frequency, startDate, isActive } = req.body;
    const updated = await prisma.recurringRule.update({
      where: { id: req.params.id },
      data: {
        amount:      amount      !== undefined ? parseFloat(amount)       : existing.amount,
        type:        type        !== undefined ? type                   : existing.type,
        category:    category    !== undefined ? category               : existing.category,
        description: description !== undefined ? description.trim()     : existing.description,
        frequency:   frequency   !== undefined ? frequency             : existing.frequency,
        startDate:   startDate   !== undefined ? startDate             : existing.startDate,
        isActive:    isActive    !== undefined ? isActive              : existing.isActive,
      },
    });
    return res.status(200).json(updated);
  } catch (err) {
    console.error('[PUT /api/recurring/:id]', err);
    return res.status(500).json({ message: 'Failed to update rule.' });
  }
});

// ── DELETE /api/recurring/:id ─────────────────────────────────────────────────
router.delete('/:id', requireRole('owner','editor'), async (req, res) => {
  try {
    const existing = await prisma.recurringRule.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ message: 'Rule not found.' });
    if (existing.userId !== req.user.id) return res.status(403).json({ message: 'Not your rule.' });
    await prisma.recurringRule.delete({ where: { id: req.params.id } });
    return res.status(200).json({ message: 'Rule deleted.' });
  } catch (err) {
    console.error('[DELETE /api/recurring/:id]', err);
    return res.status(500).json({ message: 'Failed to delete rule.' });
  }
});

export default router;
