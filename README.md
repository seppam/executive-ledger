# Executive Ledger — AI-Powered Personal Expense Tracker

A personal expense tracker with multi-user collaboration, AI spending insights, recurring transactions, budget alerts, and exportable PDF/CSV reports.

---

## 🎯 Features

### Phase 1 (MVP) — Complete
- ✅ Add transactions (income / expense) with category, date, and description
- ✅ Dashboard with live balance from database
- ✅ Transaction ledger with filter by type (income/expense) and category
- ✅ Edit and delete any transaction
- ✅ Receipt scanning via AI (Gemini)
- ✅ AI spending insights and chat
- ✅ Responsive Material Design 3 UI
- ✅ No sign-up required (local key entry)

### Phase 2 — Now Available
- ✅ **Multi-user with invitations** — invite editors or viewers via a shareable link
- ✅ **Income + Expense** — full support with type toggle in the modal
- ✅ **Recurring transactions** — set daily/weekly/monthly auto-logging (lazy-log on page load)
- ✅ **Monthly budget limits** — set a limit per category, see progress bars on dashboard
- ✅ **Budget alerts** — warning at 80%, exceeded at 100%
- ✅ **CSV & PDF export** — download transaction reports
- ✅ **Email reports** — send PDF reports via Gmail SMTP
- ✅ **JWT authentication** — secure, token-based auth
- ✅ **Role-based access** — editor (default new user) or viewer

### Coming Soon
- Monthly PDF reports auto-scheduled via cron
- Advanced charts and analytics
- Mobile app

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite + Tailwind CSS |
| Backend | Node.js + Express 5 |
| Database | SQLite via Prisma ORM |
| Auth | JWT + bcrypt |
| AI | Google Gemini (1.5 Flash / 2.0 Flash) |
| Email | Nodemailer + Gmail SMTP |
| Export | pdfkit (server-side PDF) |
| Routing | React Router v7 |

---

## 🚀 Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/seppam/executive-ledger.git
cd executive-ledger
```

### 2. Start the backend

```bash
cd backend
npm install
npx prisma generate          # generate Prisma client
npx prisma db push           # create SQLite DB
npm run dev                  # starts at http://localhost:4000
```

### 3. Start the frontend

```bash
cd frontend
npm install
npm run dev                  # starts at http://localhost:5173
```

---

## 🔑 API Key Setup (Two Options)

### Option A — In the App UI (Recommended for Personal Use)
1. Open the app → **Settings → AI Configuration**
2. Paste your Gemini API key
3. Click **Update Key**
4. The key is stored in your browser (`localStorage`) — never sent to third parties

### Option B — In Backend `.env` (For Self-Hosting)
```bash
# backend/.env
GEMINI_API_KEY=AIzaSy...
JWT_SECRET=your-random-secret-here
```
> Get a free key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey) — 1,500 requests/day free.

**Both methods work together.** The backend checks for a user-provided `x-api-key` header first, then falls back to `GEMINI_API_KEY` from `.env`.

---

## 👥 Multi-User & Invitations

### Roles
| Role | Can Do |
|------|--------|
| **Editor** (default for new registered users) | Add, edit, delete transactions, manage budgets, invite others |
| **Viewer** | Read-only access — view transactions and dashboard |

### How to Invite Someone
1. Sign in to your account
2. Go to **Settings → Invite Team Members**
3. Enter their email address and choose a role (Editor or Viewer)
4. Click **Send Invite**
5. Copy the generated link and send it to your colleague
6. They open the link → create an account → automatically join your data workspace

> All team members share the same transaction data filtered by authorization.

### Invitation Expiry
- Invitation links expire after **7 days**
- Pending invitations can be revoked from Settings
- A new invite can be sent if it expires

---

## 💰 Income vs. Expense

Toggle between **Income** and **Expense** when adding a transaction. Each type:
- Has its own category set
- Is displayed with distinct colors (+ green for income, red for expense)
- Is tracked separately in stats and exports

---

## 🔁 Recurring Transactions

When adding a transaction, select a frequency:
- **One-time** — logged once, never auto-repeated
- **Daily** — auto-logged every day
- **Weekly** — auto-logged every week
- **Monthly** — auto-logged on the same day each month

Auto-logging is **lazy** — it happens automatically the next time the app loads and the due date has passed. Each auto-logged transaction is fully editable and deletable after the fact.

---

## 📊 Budget Alerts

Set a monthly spending limit per category in **Settings → Monthly Budget Limits**. On the dashboard, you'll see:
- Progress bar per category
- **Warning** (orange) at **80%** of budget used
- **Exceeded** (red) at **100%** of budget used
- Badge on the notifications icon when any alert is active

---

## 📤 Export & Email Reports

### Download Manually
- **CSV** — `/api/export/csv?from=YYYY-MM-DD&to=YYYY-MM-DD`
- **PDF Monthly Report** — `/api/export/pdf?month=MM&year=YYYY`

### Email Reports (requires SMTP setup)
1. Go to **Settings → Email Setup**
2. Toggle it **ON**
3. Follow the on-screen instructions to set up Gmail SMTP with an App Password
4. Enter: `smtp.gmail.com`, port `587`, your Gmail address, and your App Password
5. Click **Send Test Email**

> **What is an App Password?**
> A 16-character password generated from your Google Account specifically for this app.
> Go to [myaccount.google.com/security](https://myaccount.google.com/security) → Enable 2-Step Verification → App passwords → create one for "Mail".

---

## 🔐 Authentication

All API routes (except register/login) require a JWT token:

```
Authorization: Bearer <token>
```

Tokens expire after **30 days** and are stored in localStorage.

---

## 📁 Project Structure

```
Expense Tracker/
├── backend/
│   ├── lib/
│   │   └── prisma.js              # Prisma singleton
│   ├── middleware/
│   │   └── auth.js               # JWT verify + role guard
│   ├── server/
│   │   ├── routes/
│   │   │   ├── auth.js          # register, login, invite, accept
│   │   │   ├── expenses.js      # CRUD + lazy-recurring log
│   │   │   ├── budgets.js       # budget CRUD + progress + alerts
│   │   │   ├── recurring.js    # recurring rule CRUD
│   │   │   ├── ai.js           # insights, chat, scan
│   │   │   └── export.js       # CSV, PDF, email
│   │   └── server.js            # Express entry point
│   ├── prisma/
│   │   └── schema.prisma        # Full schema
│   └── .env                     # GEMINI_API_KEY, JWT_SECRET, EMAIL_*
│
└── frontend/src/
    ├── contexts/
    │   └── AuthContext.jsx      # Auth state + token management
    ├── components/
    │   ├── AddExpenseModal.jsx  # Income/expense + recurring
    │   ├── AIInsightCard.jsx
    │   ├── BalanceCard.jsx
    │   ├── Layout.jsx
    │   ├── Sidebar.jsx
    │   └── TransactionRow.jsx
    ├── pages/
    │   ├── Dashboard.jsx        # Dashboard v2 with budget bars
    │   ├── Expenses.jsx          # Transactions with type/category filter
    │   ├── Settings.jsx        # API key, budgets, invite, email, export
    │   ├── Login.jsx
    │   ├── Register.jsx
    │   └── AcceptInvite.jsx
    └── services/
        ├── apiClient.js         # Centralised auth-fetch wrapper
        ├── expenseService.js
        └── geminiService.js
```

---

## 🗄 Database Schema

```prisma
User            { id, email, password, name, role }
Invitation      { id, token, email, role, invitedById, accepted, expiresAt }
Expense         { id, amount, type, category, description, date, isRecurring, recurringRuleId, userId }
Budget          { id, category, limit, month, year, userId }  @@unique([userId, category, month, year])
RecurringRule   { id, amount, type, category, description, frequency, startDate, lastLoggedAt, isActive, userId }
```

---

## 🌐 Environment Variables

### Backend (`backend/.env`)
```env
PORT=4000
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=           # optional
JWT_SECRET=change-me-in-production

# Email (optional — for sending reports)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:4000
```

---

## 🚢 Deployment

**Backend (Railway, Render, Fly.io):**
```bash
# Build command
npm install && npx prisma generate && npx prisma db push
# Start command
npm start
```

**Frontend:**
```bash
npm install && npm run build
# Serve `dist/` as static files, set VITE_API_URL to your backend URL
```

---

## ✏️ Author

**seppam** — [github.com/seppam](https://github.com/seppam)
