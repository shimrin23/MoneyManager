import express, { Application } from 'express';
import { json } from 'body-parser';
import cors from 'cors';
import transactionsRoutes from './routes/transactions.routes';
import authRoutes from './routes/auth.routes'; 
import errorHandler from './middlewares/errorHandler';

const app: Application = express();

// Middleware
app.use(cors());
app.use(json());

// Routes
app.use('/api/auth', authRoutes); // Auth Routes
app.use('/api/transactions', transactionsRoutes); // Transaction Routes

// Global Error Handler (Must be after routes)
app.use(errorHandler);


export default app;