import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Extend the Express Request type to include 'user'
export interface AuthRequest extends Request {
    user?: any;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    // 1. Get token from header (Format: "Bearer <token>")
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: "Access Denied. No token provided." });
    }

    // 2. Verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key_change_me');
        req.user = decoded;
        next(); // Pass control to the next handler
    } catch (error) {
        return res.status(403).json({ error: "Invalid Token" });
    }
};