import express from 'express';
import { register, login, logout, validateRegister, validateLogin } from '../controllers/authContro.js';
import authRateLimiter from '../middlewares/authRate.js';
import authenticate from '../middlewares/authMiddle.js';

const router = express.Router();

router.post('/register', authRateLimiter, validateRegister, register);
router.post('/login', authRateLimiter, validateLogin, login);
router.post('/logout', authenticate, logout);

export default router;
