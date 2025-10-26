import express from "express";
import { chatHandler } from "../controllers/chatController.js";
import { getChatHistory } from "../controllers/chathistory.js"; // ✅ only from chat history controller
import authenticate from "../middlewares/authMiddle.js";

const router = express.Router();

// 🔹 Create a new chat
router.post("/chat", authenticate, chatHandler);

// 🔹 Get all chat history for the authenticated user
router.get("/history", authenticate, getChatHistory);

export default router;
