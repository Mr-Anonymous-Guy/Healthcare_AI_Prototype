import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { getAdminAIChatSessions } from '@/services/adminService';

export async function GET(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden: Admin authorization required' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;

    const conversations = await getAdminAIChatSessions(search);
    return NextResponse.json({ conversations });
  } catch (error: any) {
    console.error('Fetch admin AI sessions error:', error);
    return NextResponse.json({ error: 'Failed to fetch AI chat sessions' }, { status: 500 });
  }
}
