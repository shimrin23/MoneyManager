


# 💰 MoneyManager (AI-Powered PFM)

MoneyManager is a dynamic Personal Financial Management (PFM) system designed to act as a personal financial coach. Unlike traditional banking apps that just show history, MoneyManager uses **Generative AI (Google Gemini)** to analyze spending habits, predict risks, and offer actionable financial advice.

## 🚀 Key Features

* **🤖 AI Financial Analyst:** Integrated with **Google Gemini API** to analyze transaction patterns and generate natural language advice.
* **📊 Financial Health Score:** innovative 0-100 scoring system based on liquidity, debt, and spending consistency.
* **🔄 Bank Sync Simulation:** Simulates fetching transaction data from multiple financial sources (Accounts, Credit Cards).
* **🛡️ Risk Assessment:** automatically flags high-risk spending behavior and suggests "Snowball" or "Avalanche" debt repayment strategies.
* **🔒 Secure Architecture:** Environment variable management for API security.

## 🛠️ Tech Stack

* **Frontend:** React.js (Planned), Tailwind CSS
* **Backend:** Node.js, Express.js
* **Language:** TypeScript
* **Database:** MongoDB
* **AI Engine:** Google Gemini 1.5 Flash
* **Tools:** Dotenv, Mongoose

## ⚙️ Installation & Setup

Follow these steps to get the project running on your local machine.

### 1. Clone the Repository
```bash
git clone [https://github.com/shimrin23/MoneyManager.git](https://github.com/shimrin23/MoneyManager.git)
cd MoneyManager
````

### 2\. Install Dependencies

```bash
npm install
```

### 3\. Configure Environment Variables (IMPORTANT)

This project uses environmental variables for security. You will not find a `.env` file in the repo.

1.  Locate the `.env.example` file in the root directory.
2.  Create a new file named `.env`.
3.  Copy the contents of `.env.example` into `.env`.
4.  Fill in your specific keys:

<!-- end list -->

```env
# Inside your new .env file:
PORT=5000
MONGO_URI=mongodb://localhost:27017/moneymanager
GEMINI_API_KEY=your_google_gemini_api_key_here
```

*\> **Note:** You can get a free Gemini API key from [Google AI Studio](https://aistudio.google.com/).*

### 4\. Run the Application

```bash
# Run in development mode
npm run dev
```

## 🔮 Roadmap

  - [x] Backend Setup & Database Connection
  - [x] Transaction Data Sync
  - [x] AI Agent Integration (Gemini)
  - [ ] React Frontend Dashboard
  - [ ] Cash Flow Forecasting Charts
  - [ ] Debt Repayment Simulator




### How to update this on GitHub:
1.  Go to your project folder in VS Code.
2.  Open (or create) the `README.md` file.
3.  Delete whatever is currently there and paste the text above.
4.  Save the file.
5.  Open **GitHub Desktop**.
6.  You will see `README.md` in the "Changes" list.
7.  Type a summary like "Update README with installation instructions".
8.  Click **Commit to main** -> **Push origin**.

Now, refresh your GitHub page, and it will look professional!
```
