# **Project: AI Expense Tracker (Pilot)**

## **1\. Technical Stack**

* **Frontend:** React (Vite) \+ Tailwind CSS  
* **Backend:** Node.js (Express)  
* **Database:** PostgreSQL (via Supabase or local Docker)  
* **AI Engine:** Gemini API (Google AI Studio)

## **2\. Core Features (MVP)**

* **Manual Entry:** Form to add Amount, Category, and Date.  
* **Dashboard:** Total balance, monthly spending chart, and recent transactions.  
* **AI Insight:** A "Generate Advice" button that sends the last 30 days of data to Gemini 1.5 Flash API to find spending leaks.

## **3\. Database Schema**

* **Table: expenses**  
  * id (UUID, Primary Key)  
  * amount (Decimal)  
  * category (String: Food, Transport, Rent, etc.)  
  * description (Text)  
  * created\_at (Timestamp)

## **4\. UI/UX Requirements**

* **Theme:** \[Clean White Minimalist\]  
* **Layout:** Sidebar navigation with a main content area.  
* **Folder Structure:** Modular (Components, Pages, Hooks, Services).