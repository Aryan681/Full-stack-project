import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 🔹 Fetch only the logged-in user's chat history
export const getChatHistory = async (req, res) => {
  try {
    // Ensure authentication
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Unauthorized: User not found in request." });
    }

    const userId = req.user.id;

    // 🔹 Fetch only chats belonging to the logged-in user
    const chats = await prisma.chat.findMany({
      where: { userId },
      include: { document: true },
      orderBy: { createdAt: "desc" },
    });

    res.json(chats);
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
};
