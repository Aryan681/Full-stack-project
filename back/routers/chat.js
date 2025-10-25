import express from "express";
import { chatHandler } from "../controllers/chatController.js";
import authenticate from "../middlewares/authMiddle.js";

const router = express.Router();

// Apply authentication middleware
router.post("/chat", authenticate, chatHandler);

export default router;
