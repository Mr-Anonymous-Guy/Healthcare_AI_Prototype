import { prisma } from '@/lib/prisma/client';
import { getAIClient, AI_MODELS, EMBEDDING_DIMENSIONS } from '@/lib/ai/client';

export interface EmbeddingChunkResult {
  id: string;
  fileId: string;
  chunkIndex: number;
  chunkText: string;
  similarity: number;
}

/**
 * Generate a single embedding vector for the given text via OpenRouter.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const client = getAIClient();

  // Truncate to ~8000 tokens (~32000 chars) to stay within model limits
  const truncated = text.substring(0, 32000);

  const response = await client.embeddings.create({
    model: AI_MODELS.EMBEDDING,
    input: truncated,
  });

  return response.data[0].embedding;
}

/**
 * Embed all chunks for a given file and store in record_embeddings table.
 * Chunks are read from the MedicalReport.summary JSON.
 */
export async function embedFileChunks(fileId: string, userId: string): Promise<number> {
  // 1. Find the MedicalReport linked to this file
  const report = await prisma.medicalReport.findFirst({
    where: { fileId, userId },
  });

  if (!report || !report.summary) {
    throw new Error('No medical report or summary found for this file');
  }

  // 2. Parse chunks from summary JSON
  let chunks: { chunkIndex: number; text: string }[];
  try {
    const parsed = JSON.parse(report.summary);
    chunks = parsed.chunks || [];
  } catch {
    throw new Error('Failed to parse chunks from report summary');
  }

  if (chunks.length === 0) {
    throw new Error('No chunks found in report summary');
  }

  // 3. Delete existing embeddings for this file (re-embed scenario)
  await prisma.$executeRawUnsafe(
    `DELETE FROM record_embeddings WHERE file_id = $1::uuid`,
    fileId
  );

  // 4. Generate embeddings and insert in batches
  let embedded = 0;

  for (const chunk of chunks) {
    try {
      const embedding = await generateEmbedding(chunk.text);
      const vectorStr = `[${embedding.join(',')}]`;

      await prisma.$executeRawUnsafe(
        `INSERT INTO record_embeddings (id, user_id, file_id, chunk_index, chunk_text, embedding, created_at)
         VALUES (gen_random_uuid(), $1::uuid, $2::uuid, $3::int, $4, $5::vector, NOW())`,
        userId,
        fileId,
        chunk.chunkIndex,
        chunk.text,
        vectorStr
      );

      embedded++;
    } catch (err: any) {
      console.error(`Failed to embed chunk ${chunk.chunkIndex}:`, err.message);
      // Continue with remaining chunks even if one fails
    }
  }

  // 5. Update report status
  await prisma.medicalReport.update({
    where: { id: report.id },
    data: { status: 'PROCESSED' },
  });

  return embedded;
}

/**
 * Search for the most similar chunks to the given query text,
 * scoped to a single user's uploaded documents.
 */
export async function searchSimilarChunks(
  queryText: string,
  userId: string,
  topK: number = 5,
  threshold: number = 0.3
): Promise<EmbeddingChunkResult[]> {
  try {
    const queryEmbedding = await generateEmbedding(queryText);
    const vectorStr = `[${queryEmbedding.join(',')}]`;

    const results = await prisma.$queryRawUnsafe<EmbeddingChunkResult[]>(
      `SELECT
        id::text,
        file_id::text AS "fileId",
        chunk_index AS "chunkIndex",
        chunk_text AS "chunkText",
        (1 - (embedding <=> $1::vector))::float AS similarity
      FROM record_embeddings
      WHERE user_id = $2::uuid
        AND (1 - (embedding <=> $1::vector)) > $4::float
      ORDER BY embedding <=> $1::vector
      LIMIT $3::int`,
      vectorStr,
      userId,
      topK,
      threshold
    );

    return results;
  } catch (err: any) {
    console.error('Similarity search error:', err.message);
    return [];
  }
}

/**
 * Get embedding count for a specific file
 */
export async function getEmbeddingCount(fileId: string): Promise<number> {
  const result = await prisma.$queryRawUnsafe<[{ count: bigint }]>(
    `SELECT COUNT(*) as count FROM record_embeddings WHERE file_id = $1::uuid`,
    fileId
  );
  return Number(result[0]?.count || 0);
}
