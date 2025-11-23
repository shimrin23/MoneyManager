import dotenv from 'dotenv';

dotenv.config();

const config = {
    port: process.env.PORT || 3000,
    // MongoDB Connection String
    mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/ai-pfm-db', 
    api: {
        bankingApiUrl: process.env.BANKING_API_URL || 'https://api.banking.com',
        aiApiUrl: process.env.AI_API_URL || 'https://api.ai.com',
    },
    jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret',
};

export default config;