import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redisClient from '../utils/redis.js';
import { ipKeyGenerator } from 'express-rate-limit';

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.body.email || ipKeyGenerator(req);
  },
  handler: (req, res) => {
    res.status(429).json({ error: 'Too many requests. Try again later.' });
  },
  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
  }),
});

export default authRateLimiter;
