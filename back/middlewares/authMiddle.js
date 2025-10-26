import jwt from "jsonwebtoken";
import redisClient from "../utils/redis.js"; // Ensure correct path

const authenticate = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔹 Check Redis cache to confirm token validity
    const cachedToken = await redisClient.get(`auth:${decoded.userId}`);
    if (!cachedToken || cachedToken !== token) {
      return res.status(401).json({ error: "Token expired or invalidated" });
    }

    // 🔹 Attach only the user's ID to req.user for easy access
    req.user = { id: decoded.userId };

    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid token" });
  }
};

export default authenticate;
