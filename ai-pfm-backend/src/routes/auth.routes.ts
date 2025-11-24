import { Router } from 'express';
import AuthController from '../controllers/auth.controller';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();
const authController = new AuthController();

// Route: POST /api/auth/signup
router.post('/signup', authController.signup.bind(authController));

// Route: POST /api/auth/login
router.post('/login', authController.login.bind(authController));

// Route: GET /api/auth/profile (protected)
router.get('/profile', authenticateToken, authController.getProfile.bind(authController));

export default router;