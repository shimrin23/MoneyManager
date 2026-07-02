import { Router } from 'express';
import AuthController from '../controllers/auth.controller';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();
const authController = new AuthController();

// Route: POST /api/auth/signup
router.post('/signup', authController.signup.bind(authController));

// Route: POST /api/auth/login
router.post('/login', authController.login.bind(authController));

// Route: GET /api/auth/verify-email
router.get('/verify-email', authController.verifyEmail.bind(authController));

// Route: POST /api/auth/resend-verification
router.post('/resend-verification', authController.resendVerification.bind(authController));

// Route: POST /api/auth/google-login
router.post('/google-login', authController.googleLogin.bind(authController));

// Route: GET /api/auth/google-client-id
router.get('/google-client-id', authController.getGoogleClientId.bind(authController));

// Route: POST /api/auth/forgot-password
router.post('/forgot-password', authController.forgotPassword.bind(authController));

// Route: POST /api/auth/reset-password
router.post('/reset-password', authController.resetPassword.bind(authController));

// Route: GET /api/auth/profile (protected)
router.get('/profile', authenticateToken, authController.getProfile.bind(authController));
router.put('/profile', authenticateToken, authController.updateProfile.bind(authController));

export default router;
