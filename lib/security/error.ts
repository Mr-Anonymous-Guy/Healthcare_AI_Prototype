import { NextResponse } from 'next/server';

/**
 * Build a safe error response for API routes.
 *
 * In production: Hides raw stack traces and internal exception details, returning a clean, generic message.
 * In development: Includes error.message for developer debugging.
 * Always logs the full error to server-side logs.
 */
export function handleServerError(
  error: unknown,
  fallbackMessage: string = 'An unexpected error occurred. Please try again later.',
  status: number = 500
) {
  console.error('[API_ERROR]', error);

  const isProd = process.env.NODE_ENV === 'production';
  const errObj = error as { message?: string };
  
  const clientMessage = isProd
    ? fallbackMessage
    : errObj?.message || fallbackMessage;

  return NextResponse.json({ error: clientMessage }, { status });
}
