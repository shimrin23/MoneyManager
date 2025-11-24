import express, { Application } from 'express';
import { json } from 'body-parser';
import cors from 'cors';
import transactionsRoutes from './routes/transactions.routes';
import authRoutes from './routes/auth.routes';
import { userRoutes } from './routes/user.routes';
import errorHandler from './middlewares/errorHandler';
import { authenticateToken } from './middlewares/authMiddleware';

const app: Application = express();

// Middleware
app.use(cors());
app.use(json());

// Routes
app.use('/api/auth', authRoutes); // Auth Routes
app.use('/api/transactions', transactionsRoutes); // Transaction Routes
app.use('/api', authenticateToken, userRoutes); // User management routes (protected)

// Global Error Handler (Must be after routes)
app.use(errorHandler);


export default app;