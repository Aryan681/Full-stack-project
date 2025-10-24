const { promises: fs } = require('fs');
const { PDFParse } = require('pdf-parse'); // Use the promise-based version
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper: split text into ~800-word chunks
function chunkText(text, chunkSize = 800) {
  const words = text.split(/\s+/);
  const chunks = [];
  for (let i = 0; i < words.length; i += chunkSize) {
    chunks.push(words.slice(i, i + chunkSize).join(' '));
  }
  return chunks;
}

// Placeholder for embedding generation (Gemini/OpenAI)
async function generateEmbedding(chunk) {
  return Array(1536).fill(0); // dummy vector
}

// Upload PDF handler
const uploadPDF = async (req, res) => {
  const { country } = req.body;

  if (!country) return res.status(400).json({ error: 'Country is required' });
  if (!req.file) return res.status(400).json({ error: 'PDF file is required' });

  try {
    // 1️⃣ Save document metadata in Postgres
    const document = await prisma.document.create({
      data: {
        filename: req.file.filename,
        country,
      },
    });

    // 2️⃣ Read and parse PDF asynchronously
    const pdfBuffer = await fs.readFile(req.file.path); // pdfBuffer is defined here
    const parser = new PDFParse({ data: pdfBuffer });
    const data = await parser.getText();

    // 3️⃣ Split text into chunks
    const chunks = chunkText(data.text, 800);

    // 4️⃣ Create all chunks in a single Prisma transaction for efficiency
    const chunkPromises = chunks.map((chunkText, i) =>
      prisma.documentChunk.create({
        data: {
          documentId: document.id,
          chunkIndex: i,
          text: chunkText,
          // Add your embedding generation here when ready:
          // vector: await generateEmbedding(chunkText),
        },
      })
    );
    await prisma.$transaction(chunkPromises);

    // 5️⃣ Delete uploaded file
    await fs.unlink(req.file.path); // Use the async version

    res.status(201).json({
      message: 'PDF uploaded and processed successfully',
      documentId: document.id,
      chunkCount: chunks.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during PDF processing' });
  }
};

module.exports = { uploadPDF };
