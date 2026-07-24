import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { getAdminUserDetail } from '@/services/adminService';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden: Admin authorization required' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const userDetail = await getAdminUserDetail(id);
    if (!userDetail) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ user: userDetail });
  } catch (error: any) {
    console.error('Fetch user detail error:', error);
    return NextResponse.json({ error: 'Failed to fetch user details' }, { status: 500 });
  }
}
