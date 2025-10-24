import fs from "fs/promises";
import * as pdfParse from "pdf-parse"; // ✅ Correct import for ESM and CJS compatibility
import { PrismaClient } from "@prisma/client";
import { DataAPIClient } from "@datastax/astra-db-ts";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();
const prisma = new PrismaClient();

// Gemini setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

// Astra DB setup
const astraClient = await new DataAPIClient(process.env.ASTRA_DB_APPLICATION_TOKEN);
const db = astraClient.db(process.env.ASTRA_DB_API_ENDPOINT);
const collection = db.collection(process.env.ASTRA_DB_COLLECTION);

async function generateEmbedding(text) {
  const result = await embeddingModel.embedContent(text);
  return result.embedding.values;
}

// Helper: split text into ~800-word chunks
function chunkText(text, chunkSize = 800) {
  const words = text.split(/\s+/);
  const chunks = [];
  for (let i = 0; i < words.length; i += chunkSize) {
    chunks.push(words.slice(i, i + chunkSize).join(" "));
  }
  return chunks;
}

// Upload PDF handler
export const uploadPDF = async (req, res) => {
  const { country } = req.body;
  if (!country || !req.file) return res.status(400).json({ error: "Country & PDF required" });

  try {
    // 1️⃣ Save PDF metadata
    const document = await prisma.document.create({
      data: { filename: req.file.filename, country },
    });

    // 2️⃣ Read PDF and parse text
    const pdfBuffer = await fs.readFile(req.file.path);
    // Use the reliable class-based API
    const parser = new pdfParse.PDFParse({ data: pdfBuffer });
    const result = await parser.getText();
    const text = result.text;

    // 3️⃣ Split text into chunks
    const chunks = chunkText(text, 800);

    // 4️⃣ Save chunks and embeddings
    for (let i = 0; i < chunks.length; i++) {
      const chunkText = chunks[i];

      // Save in Postgres
      const dbChunk = await prisma.documentChunk.create({
        data: { documentId: document.id, chunkIndex: i, text: chunkText },
      });

      // Generate embedding
      const embedding = await generateEmbedding(chunkText);

      // Push to Astra DB
      await collection.insertOne({
        _id: dbChunk.id.toString(),
        documentId: document.id,
        chunkIndex: i,
        text: chunkText,
        $vector: embedding,
      });
    }

    // 5️⃣ Delete uploaded file
    await fs.unlink(req.file.path);

    res.status(201).json({ message: "PDF processed & embedded automatically" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error during PDF processing" });
  }
};
