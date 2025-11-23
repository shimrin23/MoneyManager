import express, { Application } from 'express';
import { json } from 'body-parser';
import cors from 'cors'; // You installed it, so let's use it!
import transactionsRoutes from './routes/transactions.routes';
import errorHandler from './middlewares/errorHandler';

const app: Application = express();

// Middleware
app.use(cors());
app.use(json());

// Routes
app.use('/api/transactions', transactionsRoutes);

// Global Error Handler (Must be after routes)
app.use(errorHandler);

export default app;