const express = require('express');
const { register, login, logout, validateRegister, validateLogin } = require('../controllers/authContro');
const authRateLimiter = require('../middlewares/authRate');
const authenticate = require('../middlewares/authMiddle'); 

const router = express.Router();

router.post('/register', authRateLimiter, validateRegister, register);
router.post('/login', authRateLimiter, validateLogin, login);
router.post('/logout', authenticate, logout);

module.exports = router;
