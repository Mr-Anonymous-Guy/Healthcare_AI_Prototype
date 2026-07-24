'use server';

import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma/client';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { rateLimit, RATE_LIMIT_PRESETS } from '@/lib/security/rateLimit';

export type AuthActionResult = {
  error?: string;
  success?: boolean;
  message?: string;
};

async function checkAuthRateLimit(email: string): Promise<AuthActionResult | null> {
  const reqHeaders = await headers();
  const clientIp =
    reqHeaders.get('x-forwarded-for')?.split(',')[0].trim() ||
    reqHeaders.get('x-real-ip') ||
    '127.0.0.1';

  const ipLimit = rateLimit(`auth_action_ip:${clientIp}`, RATE_LIMIT_PRESETS.AUTH);
  if (!ipLimit.allowed) {
    return { error: 'Too many authentication attempts from this IP. Please try again in 15 minutes.' };
  }

  if (email) {
    const emailLimit = rateLimit(`auth_action_email:${email.toLowerCase().trim()}`, RATE_LIMIT_PRESETS.AUTH);
    if (!emailLimit.allowed) {
      return { error: 'Too many authentication attempts for this account. Please try again in 15 minutes.' };
    }
  }

  return null;
}

export async function signUpAction(formData: {
  email: string;
  password: string;
  fullName: string;
}): Promise<AuthActionResult> {
  const rateLimitError = await checkAuthRateLimit(formData.email);
  if (rateLimitError) return rateLimitError;

  const supabase = await createClient();
  const origin = (await headers()).get('origin') || process.env.SITE_URL || 'http://localhost:8080';

  const { data, error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      emailRedirectTo: `${origin}/api/auth/callback`,
      data: {
        full_name: formData.fullName,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.user) {
    try {
      // Sync user and profile to Prisma database
      await prisma.user.upsert({
        where: { id: data.user.id },
        update: { email: formData.email },
        create: {
          id: data.user.id,
          email: formData.email,
          role: 'PATIENT',
          profile: {
            create: {
              fullName: formData.fullName,
            },
          },
        },
      });
    } catch (dbError) {
      console.error('Error syncing user to database:', dbError);
    }
  }

  return {
    success: true,
    message: 'Registration successful! Please check your email to verify your account.',
  };
}

export async function signInWithPasswordAction(formData: {
  email: string;
  password: string;
}): Promise<AuthActionResult> {
  const rateLimitError = await checkAuthRateLimit(formData.email);
  if (rateLimitError) return rateLimitError;

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.email,
    password: formData.password,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function signInWithMagicLinkAction(email: string): Promise<AuthActionResult> {
  const rateLimitError = await checkAuthRateLimit(email);
  if (rateLimitError) return rateLimitError;

  const supabase = await createClient();
  const origin = (await headers()).get('origin') || process.env.SITE_URL || 'http://localhost:8080';

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/api/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return {
    success: true,
    message: 'Magic link sent! Check your email to sign in.',
  };
}

export async function forgotPasswordAction(email: string): Promise<AuthActionResult> {
  const rateLimitError = await checkAuthRateLimit(email);
  if (rateLimitError) return rateLimitError;

  const supabase = await createClient();
  const origin = (await headers()).get('origin') || process.env.SITE_URL || 'http://localhost:8080';

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/reset-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return {
    success: true,
    message: 'Password reset link sent! Check your inbox for instructions.',
  };
}

export async function resetPasswordAction(password: string): Promise<AuthActionResult> {
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return { error: error.message };
  }

  return {
    success: true,
    message: 'Your password has been updated successfully.',
  };
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
