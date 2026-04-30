/**
 * seed.js — Populates SQLite with realistic sample expenses via Prisma
 *
 * Usage:
 *   npm run seed              → insert 10 default expenses
 *   npm run seed -- --fresh   → wipe all expenses first, then insert
 */

import 'dotenv/config';
import prisma from './lib/prisma.js';

const SEED_EXPENSES = [
  { description: 'Starbucks',            amount: 6.50,   category: 'Food',          date: '2024-03-01' },
  { description: 'Netflix',              amount: 15.00,  category: 'Entertainment', date: '2024-03-02' },
  { description: 'Grab (Taxi)',          amount: 12.00,  category: 'Transport',     date: '2024-03-03' },
  { description: 'Spotify Premium',      amount: 9.99,   category: 'Entertainment', date: '2024-03-04' },
  { description: 'Monthly Rent',         amount: 850.00, category: 'Rent',          date: '2024-03-05' },
  { description: "McDonald's Lunch",     amount: 8.50,   category: 'Food',          date: '2024-03-07' },
  { description: 'Amazon Web Services',  amount: 42.00,  category: 'Infrastructure',date: '2024-03-10' },
  { description: 'Gym Membership',       amount: 30.00,  category: 'Health',        date: '2024-03-12' },
  { description: 'Adobe Creative Cloud', amount: 54.99,  category: 'Software',      date: '2024-03-15' },
  { description: 'Tokopedia Groceries',  amount: 27.60,  category: 'Food',          date: '2024-03-20' },
];

async function seed() {
  const args   = process.argv.slice(2);
  const fresh  = args.includes('--fresh');
  const countArg = args.find(arg => arg.startsWith('--count='));
  const count = countArg ? parseInt(countArg.split('=')[1], 10) : SEED_EXPENSES.length;

  const expensesToSeed = SEED_EXPENSES.slice(0, count);

  console.log('\n── Expense Tracker Seed ────────────────────────────────────────');

  if (fresh) {
    const deleted = await prisma.expense.deleteMany();
    console.log(`🗑  Cleared ${deleted.count} existing expense(s).`);
  }

  // Insert all seed expenses
  const created = await prisma.expense.createMany({ data: expensesToSeed });
  console.log(`✅  Inserted ${created.count} expenses into SQLite.\n`);

  // Show what's now in the DB
  const all = await prisma.expense.findMany({ orderBy: { date: 'asc' } });
  console.table(
    all.map(({ description, amount, category, date }) => ({
      description,
      amount: `$${amount.toFixed(2)}`,
      category,
      date,
    }))
  );

  const total = all.reduce((s, e) => s + e.amount, 0);
  console.log(`\nTotal in DB: $${total.toFixed(2)} across ${all.length} expense(s).\n`);

  await prisma.$disconnect();
}

seed().catch(async (err) => {
  console.error('Seed failed:', err);
  await prisma.$disconnect();
  process.exit(1);
});
