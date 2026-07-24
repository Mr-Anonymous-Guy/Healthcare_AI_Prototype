import OpenAI from 'openai';

/**
 * Singleton OpenAI-compatible client configured for OpenRouter.
 * Used for both chat completions and embeddings.
 */
let clientInstance: OpenAI | null = null;

export function getAIClient(): OpenAI {
  if (!clientInstance) {
    const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('Missing OPENROUTER_API_KEY or OPENAI_API_KEY environment variable');
    }

    clientInstance = new OpenAI({
      apiKey,
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': process.env.SITE_URL || 'http://localhost:8080',
        'X-Title': 'HealthAI Prototype',
      },
    });
  }
  return clientInstance;
}

/** Models used across the application */
export const AI_MODELS = {
  CHAT: 'openai/gpt-4o-mini',
  EMBEDDING: 'openai/text-embedding-3-small',
} as const;

/** Embedding vector dimensions for text-embedding-3-small */
export const EMBEDDING_DIMENSIONS = 1536;
