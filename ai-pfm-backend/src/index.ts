import express, { Application } from "express";
import { json } from "body-parser";
import cors from "cors";
import transactionsRoutes from "./routes/transactions.routes";
import authRoutes from "./routes/auth.routes";
import { userRoutes } from "./routes/user.routes";
import goalsRoutes from "./routes/goals.routes";
import loansRoutes from "./routes/loans.routes";
import creditcardsRoutes from "./routes/creditcards.routes";
import subscriptionsRoutes from "./routes/subscriptions.routes";
import consentRoutes from "./routes/consent.routes";
import adminConfigRoutes from "./routes/admin-config.routes";
import errorHandler from "./middlewares/errorHandler";
import { authenticateToken } from "./middlewares/authMiddleware";

const app: Application = express();

// Middleware
app.use(cors());
app.use(json());

// Routes
app.use("/api/auth", authRoutes); // Auth Routes
app.use("/api/transactions", transactionsRoutes); // Transaction Routes
app.use("/api/subscriptions", subscriptionsRoutes); // Subscription Routes
app.use("/api/goals", goalsRoutes); // Goals Routes
app.use("/api/loans", loansRoutes); // Loans Routes
app.use("/api/credit-cards", creditcardsRoutes); // Credit Cards Routes
app.use("/api/consent", consentRoutes); // Consent Management Routes (Phase 1)
app.use("/api/admin/config", adminConfigRoutes); // Admin Configuration Routes (Phase 1)
app.use("/api", authenticateToken, userRoutes); // User management routes (protected)

// Global Error Handler (Must be after routes)
app.use(errorHandler);

export default app;
