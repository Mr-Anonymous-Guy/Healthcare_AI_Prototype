import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma/client';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      try {
        // Sync user and profile record in Prisma upon email verification / PKCE exchange
        await prisma.user.upsert({
          where: { id: data.user.id },
          update: { email: data.user.email || '' },
          create: {
            id: data.user.id,
            email: data.user.email || '',
            role: 'PATIENT',
            profile: {
              create: {
                fullName: data.user.user_metadata?.full_name || '',
              },
            },
          },
        });
      } catch (dbError) {
        console.error('Error syncing user on callback:', dbError);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return the user to an error page or login with an error query param
  return NextResponse.redirect(`${origin}/login?error=Could%20not%20verify%20email%20session`);
}
