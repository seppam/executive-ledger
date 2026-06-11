/**
 * services/geminiService.js
 * Demo version — AI responses are simulated.
 * If user has a real API key stored, we can optionally use real Gemini.
 */
import { getApiKey } from './localStorage';

// ── Real Gemini integration (if user provides their own key) ──────────────────

async function callGeminiReal(prompt) {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 512, temperature: 0.7 },
        }),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch {
    return null;
  }
}

// ── Smart mock responses ────────────────────────────────────────────────────────

const INSIGHT_TEMPLATES = [
  {
    title: 'Spending Alert 🚨',
    summary:
      'Food & Dining makes up 42% of your monthly spending — Rp 3.2M so far. ' +
      'That\'s Rp 800K above your budget limit. Try meal-prepping on Sundays to trim costs.',
  },
  {
    title: 'Savings Opportunity 💡',
    summary:
      'Your Transport category jumped 68% vs last month (Rp 4.1M vs Rp 2.4M). ' +
      'Consider bundling errands into fewer trips or switching to a monthly pass to save ~Rp 400K.',
  },
  {
    title: 'Great Month! 🎉',
    summary:
      'Your spending is 23% below last month\'s average. ' +
      'Entertainment costs dropped by half — keep it up! ' +
      'Consider moving Rp 500K of savings into your Q4 portfolio goal.',
  },
];

const CHAT_RESPONSES = [
  "Based on your transactions, Food & Dining has been your biggest expense at 38% of total spending. Look for subscription bundles or meal-prep strategies to bring this down.",
  "Your spending pattern shows a spike every Friday and Saturday in the Food & Dining category. This is common — weekend dining out adds up quickly. Try setting a weekly dining budget of Rp 1.5M.",
  "Comparing this month to last: your Transport costs dropped 22% — great discipline! Entertainment spending is steady at Rp 1.2M. Overall, you're tracking well.",
  "The biggest opportunity for you right now is Rent & Utilities — it's your second-largest category. Check if you're eligible for a cheaper internet plan or if you can reduce electricity usage during peak hours.",
  "Your income this month (Rp 17.5M) comfortably exceeds expenses (Rp 8.2M). That's a 53% savings rate — excellent! I'd suggest moving the surplus into a high-yield deposit while keeping 3 months of expenses as emergency fund.",
];

function getMockInsight(expenses) {
  const total = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const byCat = {};
  expenses.forEach((e) => { byCat[e.category] = (byCat[e.category] || 0) + Number(e.amount); });
  const top = Object.entries(byCat).sort((a, b) => b[1] - a[1])[0];

  if (top && top[1] / total > 0.35) {
    return {
      title: `⚠️ ${top[0]} Dominates Spending`,
      summary:
        `${top[0]} accounts for ${Math.round((top[1] / total) * 100)}% of your total expenses (Rp ${top[1].toLocaleString('id-ID')}). ` +
        'Review if this is sustainable or if there are ways to optimize.',
    };
  }
  return INSIGHT_TEMPLATES[Math.floor(Math.random() * INSIGHT_TEMPLATES.length)];
}

function getMockChatResponse(question, expenses) {
  const q = question.toLowerCase();
  if (q.includes('food') || q.includes('makan')) {
    const food = expenses.filter((e) => e.category === 'Food & Dining');
    const total = food.reduce((s, e) => s + Number(e.amount), 0);
    return `You've spent Rp ${total.toLocaleString('id-ID')} on Food & Dining across ${food.length} transactions. That's an average of Rp ${Math.round(total / Math.max(food.length, 1)).toLocaleString('id-ID')} per transaction. Consider meal prepping on Sundays to reduce this.`;
  }
  if (q.includes('transport') || q.includes('transport')) {
    const t = expenses.filter((e) => e.category === 'Transport');
    return `Transport spending: Rp ${t.reduce((s, e) => s + Number(e.amount), 0).toLocaleString('id-ID')} across ${t.length} trips. Consider grouping errands to reduce rideshare costs.`;
  }
  if (q.includes('save') || q.includes('budget')) {
    const income = expenses.filter((e) => e.type === 'income').reduce((s, e) => s + Number(e.amount), 0);
    const expense = expenses.filter((e) => e.type === 'expense').reduce((s, e) => s + Number(e.amount), 0);
    const rate = income > 0 ? Math.round(((income - expense) / income) * 100) : 0;
    return `Your savings rate this period is ${rate}%. Income: Rp ${income.toLocaleString('id-ID')}, Expenses: Rp ${expense.toLocaleString('id-ID')}. A healthy target is 20%+ savings rate.`;
  }
  return CHAT_RESPONSES[Math.floor(Math.random() * CHAT_RESPONSES.length)];
}

// ── Public API ─────────────────────────────────────────────────────────────────

export async function getSpendingInsights(expenses = []) {
  const real = await callGeminiReal(
    `Analyze these expenses and give a brief spending insight in JSON format: ${JSON.stringify(expenses.slice(0, 20))}`
  );
  if (real) {
    // Try to parse as JSON, fallback to raw text
    try { return JSON.parse(real); } catch { return { title: 'AI Insight', summary: real }; }
  }
  return getMockInsight(expenses);
}

export async function askGemini(question, expenses = []) {
  const real = await callGeminiReal(
    `Context: expense tracker. User asks: "${question}". Transactions: ${JSON.stringify(expenses.slice(0, 15))}. Give a helpful, concise answer.`
  );
  if (real) return real;
  return getMockChatResponse(question, expenses);
}
