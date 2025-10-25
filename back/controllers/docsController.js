import fs from "fs/promises";
import * as pdfParse from "pdf-parse";
import { PrismaClient } from "@prisma/client";
import { QdrantClient } from "@qdrant/js-client-rest";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();
const prisma = new PrismaClient();
console.log("🔹 Prisma Client initialized");

// Gemini setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const embeddingModel = genAI.getGenerativeModel({
  model: "text-embedding-004",
});
console.log("🔹 Gemini embedding model initialized");

// Qdrant setup
const COLLECTION_NAME = process.env.QDRANT_COLLECTION || "documents_vectors_v2";
const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_URL ,
  apiKey: process.env.QDRANT_API_KEY,
});
console.log(`🔹 Qdrant client configured for collection: ${COLLECTION_NAME}`);

// Helper: generate embedding
async function generateEmbedding(text) {
  console.log("🟡 Generating embedding for text chunk...");
  const result = await embeddingModel.embedContent(text);
  console.log("✅ Embedding generated");
  return result.embedding.values;
}

function chunkText(text, chunkSize = 400, overlap = 100) {
  const words = text.split(/\s+/);
  const chunks = [];

  for (let i = 0; i < words.length; i += (chunkSize - overlap)) {
    const chunk = words.slice(i, i + chunkSize).join(" ");
    chunks.push(chunk);
    if (i + chunkSize >= words.length) break; // avoid empty last chunk
  }

  console.log(`🔹 Text split into ${chunks.length} chunks with ${overlap} words overlap`);
  return chunks;
}


// Ensure collection exists with payload schema
async function ensureCollection() {
  console.log(
    `🟡 Checking if Qdrant collection "${COLLECTION_NAME}" exists...`
  );
  const collections = await qdrantClient.getCollections();
  const exists = collections.collections.some(
    (c) => c.name === COLLECTION_NAME
  );

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
    console.log(
      `✅ Created Qdrant collection: ${COLLECTION_NAME} with payload schema`
    );
  } else {
    console.log(`🔹 Qdrant collection "${COLLECTION_NAME}" already exists`);
  }
}

// Upload PDF handler
export const uploadPDF = async (req, res) => {
  const { country } = req.body;
  if (!country || !req.file) {
    console.warn("⚠️ Missing country or PDF file in request");
    return res.status(400).json({ error: "Country & PDF required" });
  }

  try {
    console.log("🟡 Saving PDF metadata in Postgres...");
    const document = await prisma.document.create({
      data: { filename: req.file.filename, country },
    });
    console.log(`✅ PDF metadata saved: documentId=${document.id}`);

    console.log("🟡 Reading PDF file...");
    const pdfBuffer = await fs.readFile(req.file.path);
    const parser = new pdfParse.PDFParse({ data: pdfBuffer });
    const result = await parser.getText();
    const text = result.text;
    console.log(
      `✅ PDF read successfully, total length: ${text.length} characters`
    );

    const chunks = chunkText(text, 800);
    await ensureCollection();

    console.log("🟡 Generating embeddings and preparing points for Qdrant...");
    const points = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunkTextContent = chunks[i];
      const dbChunk = await prisma.documentChunk.create({
        data: {
          documentId: document.id,
          chunkIndex: i,
          text: chunkTextContent,
        },
      });
      console.log(
        `🔹 Chunk saved in Postgres: chunkIndex=${i}, chunkId=${dbChunk.id}`
      );

      const embedding = await generateEmbedding(chunkTextContent);
      points.push({
        id: dbChunk.id,
        vector: embedding,
        payload: {
          documentId: String(document.id),
          chunkIndex: i,
          text: chunkTextContent,
        },
      });
    }

    console.log("🟡 Upserting points into Qdrant...");
    await qdrantClient.upsert(COLLECTION_NAME, { wait: true, points });
    console.log(`✅ Successfully upserted ${points.length} points into Qdrant`);

    console.log("🟡 Deleting uploaded PDF file...");
    await fs.unlink(req.file.path);
    console.log("✅ Uploaded PDF file deleted");

    res.status(201).json({
  message: "PDF processed & embedded in Qdrant successfully",
  documentId: document.id, 
});
  } catch (err) {
    console.error("❌ Server error during PDF processing:", err);
    res.status(500).json({ error: "Server error during PDF processing" });
  }
};
