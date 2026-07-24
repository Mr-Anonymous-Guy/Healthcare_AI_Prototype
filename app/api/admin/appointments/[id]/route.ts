import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { cancelAdminAppointment } from '@/services/adminService';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden: Admin authorization required' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const appointment = await cancelAdminAppointment(id, currentUser.id, currentUser.email);
    return NextResponse.json({ message: 'Appointment cancelled', appointment });
  } catch (error: any) {
    console.error('Cancel appointment error:', error);
    return NextResponse.json({ error: error.message || 'Failed to cancel appointment' }, { status: 500 });
  }
}
