import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma/client';
import { redirect } from 'next/navigation';

export async function getSession() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  // Fetch corresponding user record from Prisma database
  try {
    let dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        profile: true,
      },
    });

    // Auto-create user row if it doesn't exist (syncs Supabase Auth → public.users)
    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email!,
          role: 'PATIENT',
          profile: {
            create: {
              fullName: user.user_metadata?.full_name || '',
            },
          },
        },
        include: {
          profile: true,
        },
      });
    }

    return {
      id: user.id,
      email: user.email!,
      role: dbUser?.role || 'PATIENT',
      fullName: dbUser?.profile?.fullName || user.user_metadata?.full_name || '',
      dbUser,
    };
  } catch (err) {
    console.error('Error fetching/creating current user profile:', err);
    return {
      id: user.id,
      email: user.email!,
      role: 'PATIENT',
      fullName: user.user_metadata?.full_name || '',
      dbUser: null,
    };
  }
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }
  return user;
}

export async function requireRole(allowedRoles: Array<'PATIENT' | 'ADMIN' | 'DOCTOR'>) {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role as 'PATIENT' | 'ADMIN' | 'DOCTOR')) {
    redirect('/dashboard');
  }
  return user;
}
