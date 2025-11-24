import { createServer } from 'http';
import mongoose from 'mongoose';
import app from './index'; 
import config from './config'; 
import dotenv from 'dotenv';

// Load env vars
dotenv.config();

const server = createServer(app);
const PORT: number = Number(config.port) || 3000;

// 1. Connect to MongoDB
mongoose.connect(config.mongoUri)
    .then(() => {
        console.log('---------------------------------------');
        console.log('MongoDB Connected Successfully');
        console.log('---------------------------------------');
        
        // 2. Only start the server if DB connects
        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log('---------------------------------------');
        });
    })
    .catch((err) => {
        console.error('MongoDB Connection Error:', err);
        process.exit(1); // Exit if we can't connect to the DB
    });