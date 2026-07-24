import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { getAdminChatTranscript } from '@/services/adminService';

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
    const conversation = await getAdminChatTranscript(id);
    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }
    return NextResponse.json({ conversation });
  } catch (error: any) {
    console.error('Fetch transcript error:', error);
    return NextResponse.json({ error: 'Failed to fetch transcript' }, { status: 500 });
  }
}
