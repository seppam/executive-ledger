# Deployment Guide — Executive Ledger (AI Expense Tracker)

This document provides the necessary configuration and commands to deploy and run the **Executive Ledger** on a new machine.

## Prerequisites

- **Node.js**: v18.0.0 or higher
- **NPM**: v8.0.0 or higher
- **Google AI Studio API Key**: Required for Gemini AI insights.

---

## 1. Environment Configuration

You must create `.env` files in both the `backend/` and `frontend/` directories.

### Backend (`/backend/.env`)
```env
PORT=4000
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_URL="file:./dev.db"
CLIENT_URL=http://localhost:5173
```

### Frontend (`/frontend/.env`)
```env
# URL of the backend API (no trailing slash)
VITE_API_URL=http://localhost:4000
```

---

## 2. Database Setup

The project uses **SQLite** via **Prisma ORM**. Follow these steps to initialize the database:

1. **Navigate to backend**:
   ```bash
   cd backend
   ```
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Initialize Database**:
   ```bash
   npx prisma migrate dev --name init
   ```
4. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```
5. **(Optional) Seed Database**:
   Populate the database with 10 sample transactions for testing.
   ```bash
   npm run seed
   ```

---

## 3. Launching the Application

### Start Backend
From the `backend/` directory:
```bash
npm run dev
```
*The server will run at http://localhost:4000.*

### Start Frontend
Open a new terminal, navigate to the `frontend/` directory:
```bash
npm install
npm run dev
```
*The application will be available at http://localhost:5173.*

---

## 4. Key Endpoints

- **Health Check**: `http://localhost:4000/api/health`
- **AI Insights**: `POST http://localhost:4000/api/ai/insights`
- **Transactions**: `GET/POST http://localhost:4000/api/expenses`

---

> [!IMPORTANT]
> **Production Note**: For production deployment, ensure `CLIENT_URL` and `VITE_API_URL` are updated to match your production domains, and consider switching from SQLite to a managed PostgreSQL instance for horizontal scalability.
