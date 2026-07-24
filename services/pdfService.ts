import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

export interface TextChunk {
  chunkIndex: number;
  text: string;
  charCount: number;
  wordCount: number;
}

/**
 * Extract raw text from a PDF Buffer page by page using pdfjs-dist
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const uint8Array = new Uint8Array(buffer);
    const loadingTask = pdfjsLib.getDocument({
      data: uint8Array,
      useSystemFonts: true,
    });

    const pdfDocument = await loadingTask.promise;
    const pageTexts: string[] = [];

    for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      pageTexts.push(`--- Page ${pageNum} ---\n${pageText}`);
    }

    return pageTexts.join('\n\n');
  } catch (error: any) {
    console.error('PDF text extraction error:', error);
    throw new Error(`Failed to extract text from PDF: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Clean extracted text: remove control characters, normalize whitespace,
 * clean up page headers/footers, and format sentences cleanly.
 */
export function cleanText(rawText: string): string {
  if (!rawText) return '';

  return rawText
    // Remove non-printable control characters (except newlines and tabs)
    .replace(/[\x00-\x09\x0B-\x0C\x0E-\x1F\x7F]/g, '')
    // Normalize page markers
    .replace(/---\s*Page\s*\d+\s*---/gi, '\n')
    // Replace multiple spaces/tabs with single space
    .replace(/[ \t]+/g, ' ')
    // Replace 3 or more consecutive newlines with double newline
    .replace(/\n{3,}/g, '\n\n')
    // Trim leading/trailing whitespace per line
    .split('\n')
    .map((line) => line.trim())
    .join('\n')
    .trim();
}

/**
 * Chunk cleaned text using a sentence-boundary aware sliding window.
 * Default: ~500 characters per chunk with ~100 characters overlap.
 */
export function chunkText(
  cleanedText: string,
  options: { chunkSize?: number; overlap?: number } = {}
): TextChunk[] {
  const chunkSize = options.chunkSize || 500;
  const overlap = options.overlap || 100;

  if (!cleanedText || cleanedText.trim().length === 0) {
    return [];
  }

  // Split text into sentences/paragraphs
  const sentences = cleanedText
    .split(/(?<=[.!?\n])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const chunks: TextChunk[] = [];
  let currentChunkSentences: string[] = [];
  let currentLength = 0;

  for (const sentence of sentences) {
    if (currentLength + sentence.length > chunkSize && currentChunkSentences.length > 0) {
      // Create current chunk
      const chunkTextContent = currentChunkSentences.join(' ');
      chunks.push({
        chunkIndex: chunks.length,
        text: chunkTextContent,
        charCount: chunkTextContent.length,
        wordCount: chunkTextContent.split(/\s+/).filter(Boolean).length,
      });

      // Retain overlap sentences for sliding window
      let overlapLength = 0;
      const overlapSentences: string[] = [];
      for (let i = currentChunkSentences.length - 1; i >= 0; i--) {
        const s = currentChunkSentences[i];
        if (overlapLength + s.length <= overlap) {
          overlapSentences.unshift(s);
          overlapLength += s.length;
        } else {
          break;
        }
      }

      currentChunkSentences = overlapSentences;
      currentLength = overlapLength;
    }

    currentChunkSentences.push(sentence);
    currentLength += sentence.length;
  }

  // Add final remaining chunk if present
  if (currentChunkSentences.length > 0) {
    const chunkTextContent = currentChunkSentences.join(' ');
    chunks.push({
      chunkIndex: chunks.length,
      text: chunkTextContent,
      charCount: chunkTextContent.length,
      wordCount: chunkTextContent.split(/\s+/).filter(Boolean).length,
    });
  }

  return chunks;
}
