import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { getAdminFiles } from '@/services/adminService';

export async function GET(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden: Admin authorization required' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;

    const files = await getAdminFiles(search);
    return NextResponse.json({ files });
  } catch (error: any) {
    console.error('Fetch admin files error:', error);
    return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 });
  }
}
