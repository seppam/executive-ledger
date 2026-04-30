/**
 * server/routes/ai.js
 * ─────────────────────────────────────────────────────────────────────────────
 * POST /api/ai/insights  — Pulls last 10 expenses, sends to Gemini
 * POST /api/ai/chat      — Free-form finance Q&A
 * POST /api/ai/scan      — Receipt OCR via base64 image
 *
 * API Key resolution (user flexibility):
 *   1. If x-api-key header is present  → use it (user-provided key)
 *   2. Otherwise → use GEMINI_API_KEY from server .env
 *   3. If neither exists              → return friendly error (no crash)
 */

import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import prisma from '../../lib/prisma.js';

const router = express.Router();

// ── Resolve API key: header > env > none ────────────────────────────────────
function getGeminiClient(req) {
  const headerKey = req.headers['x-api-key'];
  const envKey    = process.env.GEMINI_API_KEY;
  const apiKey    = headerKey || envKey;

  if (!apiKey) {
    const err = new Error(
      'No Gemini API key found. ' +
      'Set GEMINI_API_KEY in backend/.env, or enter your key in Settings (frontend). ' +
      'Get your free key at https://aistudio.google.com/apikey'
    );
    err.code = 'NO_API_KEY';
    throw err;
  }

  return new GoogleGenerativeAI(apiKey);
}

// ── Detect quota errors ────────────────────────────────────────────────────────
function isQuotaError(err) {
  const msg = err.message || '';
  return (
    msg.includes('429') ||
    msg.includes('quota') ||
    msg.includes('QUOTA_EXCEEDED') ||
    msg.includes('rate limit') ||
    msg.includes('Too Many Requests')
  );
}

// ── System prompt ─────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are a senior financial advisor with 20 years of experience.
Look at the provided expense data and provide one specific, actionable tip to save money.
Be concise — maximum 2 sentences. Do not use generic advice.
Respond in JSON with this exact format:
{
  "title": "<short headline of the insight, max 6 words>",
  "summary": "<your 1-2 sentence tip>",
  "tips": ["<specific tip 1>", "<specific tip 2>", "<specific tip 3>"]
}`;

// ── Helper: format expenses into a readable prompt block ──────────────────────
function formatExpenses(expenses) {
  if (!expenses || expenses.length === 0) return 'No expense data available.';
  return expenses
    .map((e, i) => `${i + 1}. ${e.description} | $${Number(e.amount).toFixed(2)} | ${e.category} | ${e.date}`)
    .join('\n');
}

// ── POST /api/ai/insights ─────────────────────────────────────────────────────
router.post('/insights', async (req, res) => {
  let expenses = [];
  try {
    expenses = await prisma.expense.findMany({
      orderBy: { created_at: 'desc' },
      take: 10,
    });

    if (expenses.length === 0) {
      return res.status(200).json({
        title:      'No Expenses Found',
        summary:    'Add some expenses first so AI can analyse your spending patterns.',
        tips:       ['Use the "New Transaction" button to add your first expense.'],
        generatedAt: new Date().toISOString(),
      });
    }

    const genAI = getGeminiClient(req);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });

    const prompt = `${SYSTEM_PROMPT}\n\nExpense Data (last ${expenses.length} transactions):\n${formatExpenses(expenses)}`;
    const result = await model.generateContent(prompt);
    const text  = result.response.text();

    let insight;
    try { insight = JSON.parse(text); }
    catch { insight = { title: 'AI Insight', summary: text.trim(), tips: [] }; }

    return res.status(200).json({
      ...insight,
      expenseCount: expenses.length,
      generatedAt:  new Date().toISOString(),
    });

  } catch (err) {
    if (err.code === 'NO_API_KEY') {
      return res.status(400).json({ code: 'NO_API_KEY', message: err.message });
    }
    if (isQuotaError(err)) {
      return res.status(200).json({
        title:      'API Quota Exceeded',
        summary:    'Your Gemini free-tier quota is exhausted. ' +
                    'Options: (1) Wait for quota reset, ' +
                    '(2) Get a new free key at https://aistudio.google.com/apikey, ' +
                    '(3) Enter the new key in Settings.',
        tips:       [
          'Get a new key: https://aistudio.google.com/apikey (free, 15 req/min)',
          'Enter your new key in Settings → AI Configuration',
          'Free tier resets daily (1500 requests/day for Gemini 2.0 Flash)',
        ],
        expenseCount: expenses.length,
        generatedAt:  new Date().toISOString(),
      });
    }
    console.error('[POST /api/ai/insights]', err.message);
    return res.status(500).json({ message: err.message || 'Internal server error.' });
  }
});

// ── POST /api/ai/chat ─────────────────────────────────────────────────────────
router.post('/chat', async (req, res) => {
  try {
    const { question } = req.body;
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ message: 'question is required.' });
    }

    const expenses = await prisma.expense.findMany({
      orderBy: { created_at: 'desc' },
      take: 30,
    });

    const genAI = getGeminiClient(req);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `You are a senior financial advisor.
Recent expenses:\n${formatExpenses(expenses)}\n\nUser question: ${question}
Answer clearly and concisely in plain text (no markdown).`;

    const result = await model.generateContent(prompt);
    return res.status(200).json({ answer: result.response.text().trim() });

  } catch (err) {
    if (err.code === 'NO_API_KEY') {
      return res.status(400).json({ code: 'NO_API_KEY', message: err.message });
    }
    if (isQuotaError(err)) {
      return res.status(200).json({
        answer: 'Your Gemini API quota has been exhausted for today. ' +
                'The free tier resets daily. Alternatively, add a new key in Settings → AI Configuration.',
      });
    }
    console.error('[POST /api/ai/chat]', err.message);
    return res.status(500).json({ message: err.message || 'Internal server error.' });
  }
});

// ── POST /api/ai/scan ─────────────────────────────────────────────────────────
router.post('/scan', async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ message: 'Image data is required.' });

    const matches = image.match(/^data:(.+);base64,(.+)$/);
    if (!matches) return res.status(400).json({ message: 'Invalid image format.' });

    const genAI = getGeminiClient(req);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });

    const prompt = `Extract the Total Amount, Merchant Name, and Category from this receipt.
Return ONLY a JSON object with keys:
- amount (number)
- merchant (string)
- category (string from: Food & Dining, Transport, Rent & Utilities, Entertainment, Software/SaaS, Travel, Investments, Health, Others)`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: matches[2], mimeType: matches[1] } },
    ]);

    const data = JSON.parse(result.response.text());
    return res.status(200).json({
      amount:   data.amount   || 0,
      merchant:  data.merchant || 'Unknown Merchant',
      category: data.category || 'Others',
    });

  } catch (err) {
    if (err.code === 'NO_API_KEY') {
      return res.status(400).json({ code: 'NO_API_KEY', message: err.message });
    }
    if (isQuotaError(err)) {
      return res.status(200).json({
        amount: 0, merchant: 'Quota exceeded — enter amount manually', category: 'Others',
      });
    }
    console.error('[POST /api/ai/scan]', err.message);
    return res.status(500).json({ message: err.message || 'Internal server error.' });
  }
});

export default router;
