'use server';

import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma/client';
import { revalidatePath } from 'next/cache';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function getUserFilesAction() {
  const user = await getCurrentUser();
  if (!user) return { error: 'Unauthorized' };

  try {
    const files = await prisma.file.findMany({
      where: { userId: user.id },
      include: {
        medicalReport: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, files };
  } catch (error: any) {
    console.error('Error fetching files:', error);
    return { error: 'Failed to fetch user files' };
  }
}

export async function deleteFileAction(fileId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: 'Unauthorized' };

  try {
    const file = await prisma.file.findFirst({
      where: { id: fileId, userId: user.id },
    });

    if (!file) return { error: 'File not found' };

    // Initialize Supabase client to remove file from Supabase Storage
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

    // Remove from Supabase storage
    await supabase.storage.from('medical-records').remove([file.fileKey]);

    // Delete record from database (cascade deletes linked MedicalReport)
    await prisma.file.delete({
      where: { id: fileId },
    });

    revalidatePath('/medical-records');
    revalidatePath('/dashboard');

    return { success: true, message: 'File deleted successfully' };
  } catch (error: any) {
    console.error('Error deleting file:', error);
    return { error: 'Failed to delete file' };
  }
}
