const express = require('express');
const { register, login, validateRegister, validateLogin } = require('../controllers/authContro');
const authRateLimiter = require('../middlewares/authRate');

const router = express.Router();

// Apply rate limiter only on sensitive endpoints
router.post('/register', authRateLimiter, validateRegister, register);
router.post('/login', authRateLimiter, validateLogin, login);

module.exports = router;
