import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { DataAPIClient } from '@datastax/astra-db-ts';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables from .env file
dotenv.config();

// Prisma setup
const prisma = new PrismaClient();

// Gemini setup
if (!process.env.GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY is missing in .env');
  process.exit(1);
}
const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const embeddingModel = gemini.getGenerativeModel({ model: 'text-embedding-004' });

// Astra DB setup
if (!process.env.ASTRA_DB_APPLICATION_TOKEN || !process.env.ASTRA_DB_API_ENDPOINT || !process.env.ASTRA_DB_COLLECTION) {
  console.error('❌ Astra DB credentials missing in .env');
  process.exit(1);
}
const astraClient = new DataAPIClient(process.env.ASTRA_DB_APPLICATION_TOKEN);
const db = astraClient.db(process.env.ASTRA_DB_API_ENDPOINT);
const collectionName = process.env.ASTRA_DB_COLLECTION;

// Generate embedding via Gemini
async function generateEmbedding(text) {
  try {
    const result = await embeddingModel.embedContent(text);
    return result.embedding.values;
  } catch (err) {
    console.error('❌ Error generating embedding:', err.message);
    return null;
  }
}

// Migrate chunks to Astra
async function migrateChunksToAstra() {
  console.log('🚀 Starting migration of document chunks...');
  
  const collection = await db.collection(collectionName);
  const chunks = await prisma.documentChunk.findMany();
  
  console.log(`Found ${chunks.length} chunks to process.`);

  for (const chunk of chunks) {
    try {
      const embedding = await generateEmbedding(chunk.text);
      if (!embedding) continue;

      // Use the correct method: insertOne()
      await collection.insertOne({
        _id: chunk.id.toString(), // Use _id for the document identifier
        documentId: chunk.documentId,
        chunkIndex: chunk.chunkIndex,
        text: chunk.text,
        $vector: embedding,
      });

      console.log(`✅ Migrated chunk ${chunk.id}`);
    } catch (err) {
      console.error(`❌ Failed to migrate chunk ${chunk.id}:`, err.message);
    }
  }
  
  console.log('🎯 Migration completed!');
  process.exit(0);
}

// Run migration
(async () => {
  try {
    const colls = await db.listCollections();
    console.log('Connected to AstraDB:', colls.map(c => c.name));
    await migrateChunksToAstra();
  } catch (err) {
    console.error('❌ Error connecting to AstraDB:', err.message);
    process.exit(1);
  }
})();

