import { Router } from 'express';
import AuthController from '../controllers/auth.controller';
import { authenticateToken } from '../middlewares/authMiddleware';
import { loginLimiter, emailLimiter, resetLimiter } from '../middlewares/rateLimit';

const router = Router();
const authController = new AuthController();

// Route: POST /api/auth/signup
router.post('/signup', authController.signup.bind(authController));

// Route: POST /api/auth/login (rate limited)
router.post('/login', loginLimiter, authController.login.bind(authController));

// Route: GET /api/auth/verify-email
router.get('/verify-email', authController.verifyEmail.bind(authController));

// Route: POST /api/auth/resend-verification (rate limited)
router.post('/resend-verification', emailLimiter, authController.resendVerification.bind(authController));

// Route: POST /api/auth/google-login
router.post('/google-login', authController.googleLogin.bind(authController));

// Route: GET /api/auth/google-client-id
router.get('/google-client-id', authController.getGoogleClientId.bind(authController));

// Route: POST /api/auth/forgot-password (rate limited)
router.post('/forgot-password', emailLimiter, authController.forgotPassword.bind(authController));

// Route: POST /api/auth/reset-password (rate limited)
router.post('/reset-password', resetLimiter, authController.resetPassword.bind(authController));

// Route: PUT /api/auth/change-password (logged-in user)
router.put('/change-password', authenticateToken, authController.changePassword.bind(authController));

// Route: GET /api/auth/profile (protected)
router.get('/profile', authenticateToken, authController.getProfile.bind(authController));
router.put('/profile', authenticateToken, authController.updateProfile.bind(authController));

export default router;
