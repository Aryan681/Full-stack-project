import dotenv from "dotenv";
dotenv.config();

import { PrismaClient } from "@prisma/client";
import { QdrantClient } from "@qdrant/js-client-rest";
import { GoogleGenerativeAI } from "@google/generative-ai";

const prisma = new PrismaClient();
console.log("🔹 Prisma Client initialized");

// Gemini setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
console.log("🔹 Gemini embedding model initialized");

// Qdrant setup
const COLLECTION_NAME = process.env.QDRANT_COLLECTION || "documents_vectors_v2";
const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});
console.log(`🔹 Qdrant client configured for collection: ${COLLECTION_NAME}`);

// Ensure collection exists
async function ensureCollection() {
  console.log("🟡 Checking Qdrant collection...");
  const collections = await qdrantClient.getCollections();
  const exists = collections.collections.some((c) => c.name === COLLECTION_NAME);
  const EMBEDDING_SIZE = 768;

  if (!exists) {
    await qdrantClient.recreateCollection(COLLECTION_NAME, {
      vectors: { size: EMBEDDING_SIZE, distance: "Cosine" },
      payloadSchema: {
        documentId: { type: "keyword" },
        chunkIndex: { type: "integer" },
        text: { type: "keyword" },
      },
    });
    console.log(`✅ Created Qdrant collection: ${COLLECTION_NAME}`);
  } else {
    console.log(`🔹 Qdrant collection "${COLLECTION_NAME}" exists`);
  }
}

// Generate embedding
async function generateEmbedding(text) {
  console.log("🟡 Generating embedding for input text...");
  const result = await embeddingModel.embedContent(text);
  console.log("✅ Embedding generated successfully");
  return result.embedding.values;
}

// Chat handler
export const chatHandler = async (req, res) => {
  try {
    const { question, documentId } = req.body;

    if (!question || !documentId) {
      console.warn("⚠️ Missing question or documentId in request");
      return res.status(400).json({ error: "Question and documentId are required" });
    }

    console.log("🔹 Received chat request:");
    console.log("   Question:", question);
    console.log("   Document ID:", documentId, "| Type:", typeof documentId);

    console.log("🟡 Creating embedding for question...");
    const questionVector = await generateEmbedding(question);

    console.log("🟡 Ensuring Qdrant collection exists...");
    await ensureCollection();

    console.log("🟡 Performing initial vector search in Qdrant...");
    console.log("   Using filter -> documentId:", String(documentId));

    // 1️⃣ Perform semantic vector search
    const searchResult = await qdrantClient.search(COLLECTION_NAME, {
      vector: questionVector,
      limit: 15,
      with_payload: true,
      with_vectors: false,
      filter: { must: [{ key: "documentId", match: { value: String(documentId) } }] },
    });

    console.log("🧩 Qdrant search completed. Raw results count:", searchResult?.length || 0);

    if (!searchResult || searchResult.length === 0) {
      console.warn("⚠️ No relevant matches found for this documentId.");
      return res.json({ answer: "No relevant information found in this document." });
    }

    // 2️⃣ Semantic re-ranking
    const scoredResults = searchResult
      .map((r) => ({
        ...r,
        relevance: 1 - r.score,
      }))
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 5);

    console.log(`🧠 Semantic re-ranking applied. Using top ${scoredResults.length} chunks for context.`);

    // Log top 3 hits
    scoredResults.slice(0, 3).forEach((hit, index) => {
      console.log(`   🔸 Semantic Match [${index + 1}]:`, {
        id: hit.id,
        score: hit.score,
        similarity: hit.relevance.toFixed(4),
        textSnippet: hit.payload.text?.slice(0, 100) + "...",
      });
    });

    // 3️⃣ Build enriched context
    const contextText = scoredResults.map((r) => r.payload.text).join("\n\n");

    console.log("🟢 Building prompt for Gemini model...");
    const llm = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `
Use ONLY the information from the following document context to answer the question.
If the context does not contain the answer, state that you cannot answer based on the provided document.

Context:
${contextText}

Question:
${question}

Answer:
`;

    console.log("🟡 Sending prompt to Gemini for answer generation...");
    const response = await llm.generateContent(prompt);

    const answer =
      typeof response.response.text === "function"
        ? await response.response.text()
        : response.response.text;

    console.log("✨ Gemini Answer Generated:");
    console.log("────────────────────────────────────────────");
    console.log(answer);
    console.log("────────────────────────────────────────────");

    console.log("✅ Gemini response received. Storing in Prisma...");
   await prisma.chat.create({
data: {
    question,
    answer,
    user: { connect: { id: req.user.userId } },
    document: { connect: { id: Number(documentId) } }, // direct link
  },
});

    console.log("💾 Chat entry saved successfully in Prisma.");
    return res.json({ answer });
  } catch (err) {
    console.error("❌ Error in chatHandler:", err);
    return res.status(500).json({ error: "Server error during chat processing" });
  }
};
