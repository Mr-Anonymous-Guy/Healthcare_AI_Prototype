import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { embedFileChunks, getEmbeddingCount } from '@/services/embeddingService';
import { applyRateLimit, RATE_LIMIT_PRESETS } from '@/lib/security/rateLimit';

/**
 * POST /api/embeddings/generate
 * Trigger embedding generation for a specific file's chunks.
 * Body: { fileId: string }
 */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit check (EMBEDDING preset: 5 req/min)
  const blocked = applyRateLimit(`embed:${user.id}`, RATE_LIMIT_PRESETS.EMBEDDING);
  if (blocked) return blocked;

  try {
    const { fileId } = await request.json();

    if (!fileId) {
      return NextResponse.json({ error: 'fileId is required' }, { status: 400 });
    }

    const embeddedCount = await embedFileChunks(fileId, user.id);

    return NextResponse.json({
      success: true,
      fileId,
      embeddedChunks: embeddedCount,
      message: `Successfully embedded ${embeddedCount} chunks`,
    });
  } catch (error: any) {
    console.error('Embedding generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate embeddings' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/embeddings/generate?fileId=xxx
 * Check embedding status for a specific file.
 */
export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get('fileId');

  if (!fileId) {
    return NextResponse.json({ error: 'fileId is required' }, { status: 400 });
  }

  try {
    const count = await getEmbeddingCount(fileId);
    return NextResponse.json({ fileId, embeddingCount: count });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
