# MoneyManager – AI-Powered Personal Financial Management System

MoneyManager is a Personal Financial Management (PFM) system designed to function as a financial coach. It utilizes Google Gemini AI to analyze spending behavior, identify risks, and provide actionable financial insights.

## Key Features

* **AI Financial Analyst:** Integrates with the Google Gemini API to analyze transaction patterns and generate natural-language financial advice.
* **Financial Health Score:** A 0–100 scoring system based on liquidity, debt, and spending consistency.
* **Bank Sync Simulation:** Simulates multi-source transaction syncing across accounts and credit cards.
* **Risk Assessment:** Automatically identifies high-risk spending and recommends debt repayment strategies such as Snowball or Avalanche.
* **Secure Architecture:** Uses environment variables for secure API key and configuration management.

## Tech Stack

* **Frontend:** React.js (planned), Tailwind CSS
* **Backend:** Node.js, Express.js
* **Language:** TypeScript
* **Database:** MongoDB
* **AI Engine:** Google Gemini 1.5 Flash
* **Tools:** Dotenv, Mongoose

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/shimrin23/MoneyManager.git
cd MoneyManager
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory and include:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/moneymanager
GEMINI_API_KEY=your_google_gemini_api_key_here
```

### 4. Run the Application

```bash
npm run dev
```

## Roadmap

* [x] Backend setup and database connection
* [x] Transaction data synchronization
* [x] AI agent integration (Gemini)
* [ ] React frontend dashboard
* [ ] Cash flow forecasting charts
* [ ] Debt repayment simulator

