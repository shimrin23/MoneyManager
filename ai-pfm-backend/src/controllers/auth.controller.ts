import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../schemas/user.schema';
import dotenv from 'dotenv';

dotenv.config();

export default class AuthController {
    
    // POST /api/auth/signup
    async signup(req: Request, res: Response) {
        try {
            const { name, email, password } = req.body;
            
            // 1. Validation
            if (!name || !email || !password) {
                return res.status(400).json({ error: "Please provide all fields" });
            }

            // 2. Check if user already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ error: "User already exists" });
            }

            // 3. Hash the password
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);

            // 4. Create the User
            const newUser = await User.create({
                name,
                email,
                passwordHash
            });

            res.status(201).json({ 
                message: "User registered successfully", 
                userId: newUser._id 
            });

        } catch (error) {
            console.error("Signup Error:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }

    // POST /api/auth/login
    async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;

            // 1. Find user by email
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ error: "Invalid credentials" });
            }

            // 2. Compare password
            const isMatch = await bcrypt.compare(password, user.passwordHash);
            if (!isMatch) {
                return res.status(400).json({ error: "Invalid credentials" });
            }

            // 3. Generate JWT Token
            // This token acts as the user's "ID Card" for future requests
            const token = jwt.sign(
                { id: user._id }, 
                process.env.JWT_SECRET || 'fallback_secret_key_change_me', 
                { expiresIn: '1d' } // Token expires in 1 day
            );

            res.json({ 
                message: "Login successful",
                token, 
                user: { id: user._id, name: user.name, email: user.email } 
            });

        } catch (error) {
            console.error("Login Error:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
}