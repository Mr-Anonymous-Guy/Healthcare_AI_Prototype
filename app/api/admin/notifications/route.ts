import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { getAdminNotifications } from '@/services/adminService';

export async function GET(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden: Admin authorization required' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const isRead = searchParams.get('isRead') || undefined;

    const notifications = await getAdminNotifications(search, isRead);
    return NextResponse.json({ notifications });
  } catch (error: any) {
    console.error('Fetch admin notifications error:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications log' }, { status: 500 });
  }
}
