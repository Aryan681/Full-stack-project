const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis').default;
const redisClient = require('../utils/redis');
const { ipKeyGenerator } = require('express-rate-limit');

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
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

module.exports = authRateLimiter;
