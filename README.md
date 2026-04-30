# Executive Ledger — AI-Powered Personal Expense Tracker

A personal expense tracker with a polished dashboard, receipt scanning via AI, and spending insights powered by Gemini — no sign-up required.

---

## 🎯 Features

### Core Features
- **Add Transactions** — amount, description, category, and date via a modal form
- **Receipt Scanning** — photograph a receipt and let AI extract the amount, merchant, and category automatically
- **Dashboard** — live balance (from database), 7-month bar chart, recent transactions, and monthly comparison
- **Transactions Ledger** — full list with category filters, per-category totals, and delete
- **AI Spending Insights** — send your last 10 transactions to Gemini and get actionable, personalized tips
- **AI Chat** — ask free-form questions about your spending (e.g. "Where am I spending the most?")
- **Settings** — enter your own Gemini API key, set monthly budget, toggle dark mode

### MVP (Current Release)
All core MVP features are functional and deployable.

### Planned (Coming Soon)
- Edit existing transactions
- Budget alerts
- Monthly reports / exports
- Account linking

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite + Tailwind CSS (Material Design 3 tokens) |
| Backend | Node.js + Express 5 |
| Database | SQLite via Prisma ORM |
| AI | Google Gemini (1.5 Flash for scan, 2.0 Flash for insights) |
| Fonts | Manrope + Inter + Material Symbols |
| Routing | React Router v7 |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js 18+**
- **Git**

### 1. Clone the repo
```bash
git clone https://github.com/seppam/executive-ledger.git
cd executive-ledger
```

### 2. Set up the backend

```bash
cd backend

# Create .env — configure your port and (optional) Gemini API key
cp .env.example .env    # if an example exists, or create manually:
# PORT=4000
# CLIENT_URL=http://localhost:5173
# GEMINI_API_KEY=        ← optional; users can also set this in the app UI
# DATABASE_URL="file:./dev.db"
```

**Using a Gemini API key:**

| Method | How | Best for |
|--------|-----|----------|
| **Frontend UI** | Settings → AI Configuration → paste key | Non-technical users — no env setup needed |
| **Backend `.env`** | `GEMINI_API_KEY=your_key_here` | Self-hosted deployments with a shared key |

> **Both methods can be used at the same time.** The backend checks for a user-provided key first (via `x-api-key` header), then falls back to the env key. If neither is set, a friendly error is shown — no crashes.

**Get a free Gemini API key:**
👉 [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey)
- Free tier: **1,500 requests/day** on Gemini 2.0 Flash
- No credit card required

### 3. Install and initialize the database

```bash
npm install
npx prisma generate
npx prisma db push          # creates the SQLite DB at ./dev.db
```

### 4. (Optional) Seed sample data

```bash
npm run seed                # inserts 10 sample expenses
npm run seed -- --fresh     # clears DB first, then inserts
npm run seed -- --count=5   # insert only the first 5
```

### 5. Start the backend

```bash
npm run dev        # runs with --watch (auto-restarts on changes)
# or
npm start          # plain start
```

Backend runs at `http://localhost:4000`
Health check: `http://localhost:4000/api/health`

### 6. Set up and start the frontend

```bash
cd ../frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

### Quick start (both at once)

```bash
# Terminal 1 — backend
cd backend && npm run dev

# Terminal 2 — frontend
cd frontend && npm run dev
```

---

## 🔑 API Key Configuration

The app supports **two ways** to provide a Gemini API key, so it works for both IT and non-IT users:

### Option A — Enter key in the app UI (easiest, recommended)
1. Open the app → **Settings** → **AI Configuration**
2. Paste your Gemini API key
3. Click **Update Key**
4. The key is stored in your browser (`localStorage`) — never sent to any third party

> This is the recommended path for personal use. No terminal, no `.env` file needed.

### Option B — Set via backend `.env` (for self-hosting / shared deployments)
```bash
# backend/.env
GEMINI_API_KEY=AIzaSy...
```

**How it works internally:**
- Frontend checks `localStorage` for `expense_tracker_api_key`
- If found, it sends the key to the backend as the `x-api-key` HTTP header
- Backend uses that key for the request
- If no header is present, backend falls back to `GEMINI_API_KEY` in `.env`
- If neither exists, the API returns a **friendly error message** (no crash, no 500)

### What to do if the AI feature stops working

| Problem | Solution |
|---------|----------|
| "API Quota Exceeded" | Free tier resets daily (1,500 req/day for 2.0 Flash). Wait or use a new key. |
| "No API Key found" | Enter your key in **Settings → AI Configuration**, or set `GEMINI_API_KEY` in `backend/.env` |
| Invalid API key | Get a fresh key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |

---

## 📁 Project Structure

```
Expense Tracker/
├── backend/
│   ├── lib/
│   │   └── prisma.js          # Prisma singleton client
│   ├── server/
│   │   ├── routes/
│   │   │   ├── ai.js          # AI endpoints (insights, chat, scan)
│   │   │   └── expenses.js    # CRUD + stats for expenses
│   │   └── server.js          # Express entry point
│   ├── prisma/
│   │   ├── schema.prisma      # DB schema
│   │   └── dev.db             # SQLite database (gitignored)
│   ├── seed.js                # Seed script
│   ├── .env                   # Backend env vars (gitignored)
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── AddExpenseModal.jsx
    │   │   ├── AIInsightCard.jsx
    │   │   ├── BalanceCard.jsx
    │   │   ├── Layout.jsx
    │   │   ├── Sidebar.jsx
    │   │   └── TransactionRow.jsx
    │   ├── pages/
    │   │   ├── Dashboard.jsx
    │   │   ├── Expenses.jsx
    │   │   ├── Settings.jsx
    │   │   ├── Profile.jsx
    │   │   └── ComingSoon.jsx
    │   ├── services/
    │   │   ├── expenseService.js   # CRUD API calls
    │   │   └── geminiService.js    # AI API calls
    │   ├── App.jsx
    │   └── index.css
    ├── .env                    # VITE_API_URL (gitignored)
    └── package.json
```

---

## 🔧 Database Schema

```prisma
model Expense {
  id          String   @id @default(uuid())
  amount      Float
  category    String
  description String
  date        String   // "YYYY-MM-DD"
  created_at  DateTime @default(now())
}
```

Categories: `Food & Dining | Transport | Rent & Utilities | Entertainment | Software/SaaS | Travel | Investments | Health | Others`

---

## 🌐 Environment Variables

### Backend (`backend/.env`)
```env
PORT=4000
CLIENT_URL=http://localhost:5173
# Optional — can be blank; users will enter their own key in the app
GEMINI_API_KEY=
DATABASE_URL="file:./dev.db"
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:4000
```

---

## 🚢 Deployment

### Self-hosting (Railway, Render, Fly.io)

**Backend:**
- Set `PORT`, `CLIENT_URL` (your frontend URL), and `GEMINI_API_KEY` (optional) in the host's env vars
- Build command: `npm install && npx prisma generate && npx prisma db push`
- Start command: `npm start`

**Frontend:**
- Set `VITE_API_URL` to your deployed backend URL
- Build: `npm install && npm run build`
- Serve the `dist/` folder as static files

### Docker Compose (future)
A `docker-compose.yml` for one-command deployment is planned.

---

## 📊 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/expenses` | List all expenses |
| GET | `/api/expenses/stats` | Total, by-month, by-category |
| POST | `/api/expenses` | Create expense |
| PUT | `/api/expenses/:id` | Update expense |
| DELETE | `/api/expenses/:id` | Delete expense |
| POST | `/api/ai/insights` | Generate AI spending insight |
| POST | `/api/ai/chat` | Free-form AI question |
| POST | `/api/ai/scan` | Receipt OCR scan |

> All `/api/ai/*` endpoints accept an optional `x-api-key` header. If omitted, the backend falls back to `GEMINI_API_KEY` from `.env`.

---

## ✏️ Author

**seppam** — [github.com/seppam](https://github.com/seppam)
