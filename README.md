# MoneyManager - AI-Powered Personal Financial Management

MoneyManager is an AI-powered Personal Financial Management tool that helps users manage their finances with smart insights, automated budgets, anomaly detection, and subscription tracking.

## 🛠 Tech Stack

- **Frontend:** React 19, Vite, TypeScript
- **Backend:** Node.js, Express, TypeScript
- **Database:** MongoDB
- **AI Integration:** Google Generative AI (Gemini)

## 🔑 Environment Variables Setup

### Backend (`ai-pfm-backend/.env`)

Create a `.env` file in the `ai-pfm-backend` directory with the following credentials:

```env
# Server Configuration
PORT=5000

# Database Configuration
MONGO_URI=mongodb://localhost:27017/ai-pfm-db

# Google Credentials
GEMINI_API_KEY=your_google_gemini_api_key_here
GOOGLE_CLIENT_ID=your_google_oauth_client_id_here

# Email Service (Resend)
RESEND_API_KEY=your_resend_api_key_here

# Authentication Secret
JWT_SECRET=your_jwt_secret_key_here

# Optional APIs & Bank Integrations
BANK_API_BASE_URL=https://api.fakebank.com
BANK_API_TOKEN=your_bank_api_token_here
BANKING_MOCK_ENABLED=true

# Advanced / Overrides (Defaults provided in code)
FRONTEND_URL=http://localhost:5173
MAIL_FROM="MoneyManager <no-reply@snis.app>"
GEMINI_MODEL=gemini-2.5-flash
BANK_SYNC_ENABLED=true
BANK_SYNC_CRON="0 0 * * *"
```

*(Note: The frontend does not strictly require a `.env` file unless explicitly overriding the API URL default in Vite.)*

## 🚀 How to Run

1. **Start the Backend Server**
   ```bash
   cd ai-pfm-backend
   npm install
   npm run dev
   ```

2. **Start the Frontend Application**
   ```bash
   cd ai-pfm-frontend
   npm install
   npm run dev
   ```

3. **Access the App**
   Open your browser and navigate to `http://localhost:5173`.
