import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma/client';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { extractTextFromPDF, cleanText, chunkText, TextChunk } from '@/services/pdfService';
import { embedFileChunks } from '@/services/embeddingService';
import { applyRateLimit, RATE_LIMIT_PRESETS } from '@/lib/security/rateLimit';
import { handleServerError } from '@/lib/security/error';

const ALLOWED_MIME_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit check (UPLOAD preset: 5 req/min)
  const blocked = applyRateLimit(`upload:${user.id}`, RATE_LIMIT_PRESETS.UPLOAD);
  if (blocked) return blocked;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const reportType = (formData.get('reportType') as string) || 'LAB_REPORT';
    const customTitle = formData.get('title') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file format. Only PDF and image files (PNG, JPEG, WEBP) are allowed.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds maximum 10MB limit.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Initialize Supabase Storage client
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options as any)
            );
          },
        },
      }
    );

    const timeStamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileKey = `${user.id}/${timeStamp}_${sanitizedFileName}`;

    // 1. Upload to Supabase Storage bucket
    const { error: uploadError } = await supabase.storage
      .from('medical-records')
      .upload(fileKey, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error('Supabase Storage Upload Error:', uploadError);
      return NextResponse.json(
        { error: `Storage upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Get Public/Signed URL
    const { data: urlData } = supabase.storage.from('medical-records').getPublicUrl(fileKey);
    const fileUrl = urlData?.publicUrl || '';

    // 2. Extract, clean, and chunk PDF text
    let rawText = '';
    let cleaned = '';
    let chunks: TextChunk[] = [];

    if (file.type === 'application/pdf') {
      try {
        rawText = await extractTextFromPDF(buffer);
        cleaned = cleanText(rawText);
        chunks = chunkText(cleaned, { chunkSize: 500, overlap: 100 });
      } catch (pdfErr: any) {
        console.warn('PDF text extraction notice:', pdfErr.message);
        cleaned = `[PDF Document: ${file.name}]`;
      }
    } else {
      cleaned = `[Medical Image: ${file.name}]`;
    }

    // 3. Save File record in database via Prisma
    const fileRecord = await prisma.file.create({
      data: {
        userId: user.id,
        fileName: file.name,
        fileKey: fileKey,
        fileUrl: fileUrl,
        fileSize: file.size,
        mimeType: file.type,
        extractedText: cleaned,
      },
    });

    // 4. Save MedicalReport record linked to File
    const reportTitle = customTitle || file.name.replace(/\.[^/.]+$/, '');
    const summaryPayload = JSON.stringify({
      totalChunks: chunks.length,
      chunks: chunks,
    });

    const medicalReport = await prisma.medicalReport.create({
      data: {
        userId: user.id,
        fileId: fileRecord.id,
        title: reportTitle,
        reportType: reportType,
        reportDate: new Date(),
        summary: summaryPayload,
        extractedText: cleaned,
        status: 'PROCESSED',
      },
    });

    // 5. Trigger embedding generation asynchronously (non-blocking)
    let embeddedCount = 0;
    if (chunks.length > 0) {
      try {
        embeddedCount = await embedFileChunks(fileRecord.id, user.id);
      } catch (embedErr: any) {
        console.warn('Auto-embedding notice (non-fatal):', embedErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      file: fileRecord,
      report: medicalReport,
      extraction: {
        totalCharacters: cleaned.length,
        totalChunks: chunks.length,
        embeddedChunks: embeddedCount,
        sampleChunks: chunks.slice(0, 3),
      },
    });
  } catch (error: any) {
    return handleServerError(error, 'An error occurred during file upload processing.');
  }
}
