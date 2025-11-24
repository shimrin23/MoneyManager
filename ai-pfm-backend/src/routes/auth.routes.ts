import { Router } from 'express';
import AuthController from '../controllers/auth.controller';

const router = Router();
const authController = new AuthController();

// Route: POST /api/auth/signup
router.post('/signup', authController.signup.bind(authController));

// Route: POST /api/auth/login
router.post('/login', authController.login.bind(authController));

export default router;