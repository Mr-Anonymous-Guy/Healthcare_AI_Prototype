import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma/client';
import { getAIClient, AI_MODELS } from '@/lib/ai/client';
import { searchSimilarChunks } from '@/services/embeddingService';
import { applyRateLimit, RATE_LIMIT_PRESETS } from '@/lib/security/rateLimit';
import { handleServerError } from '@/lib/security/error';

// ─── System Prompt ──────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are HealthAI Assistant — a medical records assistant that helps users understand their uploaded medical documents.

CRITICAL RULES YOU MUST ALWAYS FOLLOW:
1. You are NOT a doctor. You CANNOT diagnose conditions, prescribe medications, or recommend specific treatments.
2. You may ONLY answer based on the medical records provided in the CONTEXT section below. If the context is empty or doesn't contain the needed information, say: "I don't have enough information in your uploaded records to answer this question. Please upload relevant medical documents first."
3. NEVER fabricate or hallucinate lab values, dates, medication names, or medical findings that are not explicitly present in the context.
4. When referencing information from the context, cite the source (e.g., "According to your records...").
5. For general health education questions not requiring record context, you may provide brief factual information, but always clarify it's general knowledge — not personalised medical advice.
6. If a user asks for a diagnosis or treatment recommendation, firmly decline and recommend they consult their healthcare provider.

CONTEXT FROM USER'S MEDICAL RECORDS:
{context}

CONVERSATION INSTRUCTIONS:
- Be concise, clear, and helpful.
- Use bullet points for lists.
- When citing record data, be precise about values and dates.
- Always end your response with:
  "⚠️ This is not medical advice. Please consult your healthcare provider for medical decisions."`;

// ─── POST /api/chat ─────────────────────────────────────────────────
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit check (AI preset: 10 req/min)
  const blocked = applyRateLimit(`chat:${user.id}`, RATE_LIMIT_PRESETS.AI);
  if (blocked) return blocked;

  try {
    const body = await request.json();
    const { message, conversationId } = body as {
      message: string;
      conversationId?: string;
    };

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // 1. Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = await prisma.conversation.findFirst({
        where: { id: conversationId, userId: user.id },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            take: 20, // Last 20 messages for context
          },
        },
      });

      if (conversation) {
        const messageCount = await prisma.message.count({
          where: { conversationId: conversation.id },
        });
        if (messageCount >= 50) {
          return NextResponse.json(
            { error: 'Conversation limit reached (50 messages max). Please start a new chat session.' },
            { status: 400 }
          );
        }
      }
    }

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          userId: user.id,
          title: message.substring(0, 60).trim(),
        },
        include: { messages: true },
      });
    }

    // 2. Search for relevant document chunks
    let relevantChunks: Awaited<ReturnType<typeof searchSimilarChunks>> = [];
    try {
      relevantChunks = await searchSimilarChunks(message, user.id, 5, 0.25);
    } catch (err: any) {
      console.warn('Chunk retrieval failed (continuing without context):', err.message);
    }

    // 3. Build context from retrieved chunks
    const contextText =
      relevantChunks.length > 0
        ? relevantChunks
            .map(
              (c, i) =>
                `[Source ${i + 1} | Similarity: ${(c.similarity * 100).toFixed(1)}%]\n${c.chunkText}`
            )
            .join('\n\n---\n\n')
        : 'No relevant medical records found. The user has not uploaded documents matching this query.';

    // 4. Build messages array for the LLM
    const systemMessage = SYSTEM_PROMPT.replace('{context}', contextText);

    const chatMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemMessage },
    ];

    // Add conversation history (exclude system messages)
    for (const msg of conversation.messages) {
      if (msg.role === 'USER') {
        chatMessages.push({ role: 'user', content: msg.content });
      } else if (msg.role === 'ASSISTANT') {
        chatMessages.push({ role: 'assistant', content: msg.content });
      }
    }

    // Add the new user message
    chatMessages.push({ role: 'user', content: message });

    // 5. Save user message to DB
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'USER',
        content: message,
      },
    });

    // 6. Stream the AI response
    const client = getAIClient();
    const stream = await client.chat.completions.create({
      model: AI_MODELS.CHAT,
      messages: chatMessages,
      stream: true,
      max_tokens: 1500,
      temperature: 0.3, // Lower temperature for factual accuracy
    });

    // Create a ReadableStream to forward SSE chunks to the client
    const encoder = new TextEncoder();
    let fullResponse = '';

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              fullResponse += content;
              const ssePayload = JSON.stringify({
                content,
                conversationId: conversation!.id,
              });
              controller.enqueue(encoder.encode(`data: ${ssePayload}\n\n`));
            }
          }

          // Save the complete assistant response
          await prisma.message.create({
            data: {
              conversationId: conversation!.id,
              role: 'ASSISTANT',
              content: fullResponse,
              sources: relevantChunks.length > 0 ? JSON.stringify(relevantChunks) : undefined,
            },
          });

          // Update conversation title if it's the first exchange
          if (conversation!.messages.length === 0) {
            await prisma.conversation.update({
              where: { id: conversation!.id },
              data: { title: message.substring(0, 60).trim() },
            });
          }

          // Send done signal
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ done: true, conversationId: conversation!.id })}\n\n`
            )
          );
          controller.close();
        } catch (error: any) {
          console.error('Streaming error:', error);
          const errorPayload = JSON.stringify({
            error: 'An error occurred while generating the response.',
            conversationId: conversation!.id,
          });
          controller.enqueue(encoder.encode(`data: ${errorPayload}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (error: any) {
    return handleServerError(error, 'An error occurred while processing your chat request.');
  }
}
