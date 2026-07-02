import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import axios from 'axios';
import User from '../schemas/user.schema';
import { sendVerificationEmail, sendWelcomeEmail, sendResetPasswordEmail } from '../utils/email';
import dotenv from 'dotenv';

dotenv.config();

export default class AuthController {
    
    // POST /api/auth/signup
    async signup(req: Request, res: Response) {
        try {
            const { name, email, password } = req.body;
            console.log("\n📥 POST /api/auth/signup received:", { name, email });
            
            // 1. Validation
            if (!name || !email || !password) {
                return res.status(400).json({ error: "Please provide all fields" });
            }

            // 2. Check if user already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                // Account linking case: user has a Google account but no email/password set up yet
                if (!existingUser.passwordHash && existingUser.isGoogleAccount) {
                    const salt = await bcrypt.genSalt(10);
                    existingUser.passwordHash = await bcrypt.hash(password, salt);
                    existingUser.isVerified = true; // Google accounts are pre-verified
                    await existingUser.save();
                    return res.status(201).json({ 
                        message: "Password added. Your account is now linked and verified." 
                    });
                }
                return res.status(400).json({ error: "User already exists" });
            }

            // 3. Hash the password
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);

            // 4. Generate verification token (expires in 1 hour)
            const token = crypto.randomBytes(32).toString('hex');
            const tokenExpires = new Date(Date.now() + 3600000);

            // 5. Create the User
            const newUser = await User.create({
                name,
                email,
                passwordHash,
                isVerified: false,
                verificationToken: token,
                verificationTokenExpires: tokenExpires
            });

            // 6. Send verification email
            await sendVerificationEmail(newUser.email, token);

            res.status(201).json({ 
                message: "User registered successfully. Please check your email to verify your account.", 
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
            console.log("\n📥 POST /api/auth/login received for email:", email);

            // 1. Find user by email
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ error: "Invalid credentials" });
            }

            // If account has no password set (only Google sign-in)
            if (!user.passwordHash && user.isGoogleAccount) {
                return res.status(400).json({ 
                    error: "This account was created using Google Sign-In. Please click 'Continue with Google'." 
                });
            }

            // 2. Compare password
            const isMatch = await bcrypt.compare(password, user.passwordHash || '');
            if (!isMatch) {
                return res.status(400).json({ error: "Invalid credentials" });
            }

            // 3. Check email verification status
            if (!user.isVerified) {
                return res.status(403).json({ 
                    error: "Please verify your email address before logging in.",
                    unverified: true,
                    email: user.email
                });
            }

            // 4. Generate JWT Token
            const token = jwt.sign(
                { id: user._id }, 
                process.env.JWT_SECRET || 'fallback_secret_key_change_me', 
                { expiresIn: '1d' }
            );

            res.json({
                message: "Login successful",
                token,
                role: user.role,
                user: { id: user._id, name: user.name, email: user.email, role: user.role }
            });

        } catch (error) {
            console.error("Login Error:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }

    // GET /api/auth/verify-email
    async verifyEmail(req: Request, res: Response) {
        try {
            const token = req.query.token as string;
            console.log("\n📥 GET /api/auth/verify-email received with token:", token);

            if (!token) {
                return res.status(400).json({ error: "Verification token is required" });
            }

            // Find user with active token
            const user = await User.findOne({
                verificationToken: token,
                verificationTokenExpires: { $gt: new Date() }
            });

            if (!user) {
                return res.status(400).json({ error: "Verification link is invalid or has expired." });
            }

            // Mark user as verified
            user.isVerified = true;
            user.verificationToken = undefined;
            user.verificationTokenExpires = undefined;
            await user.save();

            // Send welcome email after verification success
            await sendWelcomeEmail(user.email, user.name);

            // Generate JWT Token for Auto-Login
            const jwtToken = jwt.sign(
                { id: user._id }, 
                process.env.JWT_SECRET || 'fallback_secret_key_change_me', 
                { expiresIn: '1d' }
            );

            res.json({ 
                message: "Email verified successfully! Logging you in...",
                token: jwtToken,
                role: user.role,
                user: { id: user._id, name: user.name, email: user.email, role: user.role }
            });

        } catch (error) {
            console.error("Verification Error:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }

    // POST /api/auth/resend-verification
    async resendVerification(req: Request, res: Response) {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({ error: "Email address is required" });
            }

            const user = await User.findOne({ email });

            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            if (user.isVerified) {
                return res.status(400).json({ error: "Email is already verified" });
            }

            // Generate new token
            const token = crypto.randomBytes(32).toString('hex');
            const tokenExpires = new Date(Date.now() + 3600000); // 1 hour

            user.verificationToken = token;
            user.verificationTokenExpires = tokenExpires;
            await user.save();

            // Send email
            await sendVerificationEmail(user.email, token);

            res.json({ message: "Verification link resent successfully! Please check your email." });

        } catch (error) {
            console.error("Resend Error:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }

    // POST /api/auth/forgot-password
    async forgotPassword(req: Request, res: Response) {
        try {
            const { email } = req.body;
            console.log("\n📥 POST /api/auth/forgot-password received for:", email);

            if (!email) {
                return res.status(400).json({ error: "Email address is required" });
            }

            const user = await User.findOne({ email });

            // For security, do not disclose if the email exists or not
            if (!user) {
                return res.json({ 
                    message: "If an account matches that email, a password reset link has been sent." 
                });
            }

            // Generate reset token (expires in 1 hour)
            const token = crypto.randomBytes(32).toString('hex');
            const tokenExpires = new Date(Date.now() + 3600000);

            user.resetPasswordToken = token;
            user.resetPasswordExpires = tokenExpires;
            await user.save();

            // Send password reset email
            await sendResetPasswordEmail(user.email, token);

            res.json({ 
                message: "If an account matches that email, a password reset link has been sent." 
            });

        } catch (error) {
            console.error("Forgot Password Error:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }

    // POST /api/auth/reset-password
    async resetPassword(req: Request, res: Response) {
        try {
            const { token, password } = req.body;
            console.log("\n📥 POST /api/auth/reset-password received");

            if (!token || !password) {
                return res.status(400).json({ error: "Token and password are required" });
            }

            // Find user with matching unexpired reset token
            const user = await User.findOne({
                resetPasswordToken: token,
                resetPasswordExpires: { $gt: new Date() }
            });

            if (!user) {
                return res.status(400).json({ error: "Password reset link is invalid or has expired." });
            }

            // Hash the new password
            const salt = await bcrypt.genSalt(10);
            user.passwordHash = await bcrypt.hash(password, salt);
            
            // Clear reset token fields
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            
            // Mark verified if they weren't (since they verified email ownership)
            user.isVerified = true;

            await user.save();

            res.json({ message: "Password has been reset successfully! You can now log in." });

        } catch (error) {
            console.error("Reset Password Error:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }

    // POST /api/auth/google-login
    async googleLogin(req: Request, res: Response) {
        try {
            const { credential } = req.body;

            if (!credential) {
                return res.status(400).json({ error: "Google credential is required" });
            }

            // Verify Google Token via TokenInfo API
            let googlePayload;
            try {
                const googleResponse = await axios.get(
                    `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`
                );
                googlePayload = googleResponse.data;
            } catch (err: any) {
                console.error("Google Token Verification Failed:", err.message);
                return res.status(400).json({ error: "Invalid Google credential" });
            }

            const { email, name, email_verified } = googlePayload;

            if (!email) {
                return res.status(400).json({ error: "Email not provided by Google account" });
            }

            if (email_verified !== "true" && email_verified !== true) {
                return res.status(400).json({ error: "Google account email is not verified" });
            }

            // Find or create user
            let user = await User.findOne({ email });

            if (user) {
                // Link account if it wasn't marked as Google account yet
                let updated = false;
                if (!user.isVerified) {
                    user.isVerified = true;
                    user.verificationToken = undefined;
                    user.verificationTokenExpires = undefined;
                    updated = true;
                }
                if (!user.isGoogleAccount) {
                    user.isGoogleAccount = true;
                    updated = true;
                }
                if (updated) {
                    await user.save();
                }
            } else {
                // Create new Google verified user
                user = await User.create({
                    name,
                    email,
                    isVerified: true,
                    isGoogleAccount: true,
                    role: 'customer'
                });
            }

            // Generate JWT Token
            const token = jwt.sign(
                { id: user._id }, 
                process.env.JWT_SECRET || 'fallback_secret_key_change_me', 
                { expiresIn: '1d' }
            );

            res.json({
                message: "Login successful",
                token,
                role: user.role,
                user: { id: user._id, name: user.name, email: user.email, role: user.role }
            });

        } catch (error) {
            console.error("Google Login Error:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }

    // GET /api/auth/profile
    async getProfile(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }

            const user = await User.findById(userId).select('-passwordHash');
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json({
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone || '',
                    dateOfBirth: user.dateOfBirth || '',
                    address: user.address || '',
                    occupation: user.occupation || '',
                    monthlyIncome: user.monthlyIncome ?? 0,
                    role: user.role,
                }
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server Error' });
        }
    }

    // PUT /api/auth/profile
    async updateProfile(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }

            const {
                name,
                email,
                phone,
                dateOfBirth,
                address,
                occupation,
                monthlyIncome,
            } = req.body;

            if (!name || !email) {
                return res.status(400).json({ error: 'Name and email are required' });
            }

            const existingUser = await User.findOne({
                email,
                _id: { $ne: userId },
            });

            if (existingUser) {
                return res.status(400).json({ error: 'Email already in use' });
            }

            const user = await User.findByIdAndUpdate(
                userId,
                {
                    name,
                    email,
                    phone: phone || '',
                    dateOfBirth: dateOfBirth || '',
                    address: address || '',
                    occupation: occupation || '',
                    monthlyIncome: typeof monthlyIncome === 'number' ? monthlyIncome : Number(monthlyIncome) || 0,
                },
                { new: true, runValidators: true },
            ).select('-passwordHash');

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json({
                message: 'Profile updated successfully',
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone || '',
                    dateOfBirth: user.dateOfBirth || '',
                    address: user.address || '',
                    occupation: user.occupation || '',
                    monthlyIncome: user.monthlyIncome ?? 0,
                    role: user.role,
                }
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server Error' });
        }
    }

    // GET /api/auth/google-client-id
    async getGoogleClientId(req: Request, res: Response) {
        try {
            res.json({ clientId: process.env.GOOGLE_CLIENT_ID || '' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server Error' });
        }
    }
}
