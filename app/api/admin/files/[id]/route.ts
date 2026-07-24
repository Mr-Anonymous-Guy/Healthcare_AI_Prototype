import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { deleteAdminFile } from '@/services/adminService';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden: Admin authorization required' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const result = await deleteAdminFile(id, currentUser.id, currentUser.email);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Delete file error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete file' }, { status: 500 });
  }
}
