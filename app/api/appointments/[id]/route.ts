import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma/client';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const existing = await prisma.appointment.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        ...(body.doctorName ? { doctorName: body.doctorName } : {}),
        ...(body.department !== undefined ? { department: body.department } : {}),
        ...(body.appointmentDate ? { appointmentDate: new Date(body.appointmentDate) } : {}),
        ...(body.status ? { status: body.status } : {}),
        ...(body.notes !== undefined ? { notes: body.notes } : {}),
      },
    });

    // Create notification entry for update
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: body.status === 'CANCELLED' ? 'Appointment Cancelled' : 'Appointment Updated',
        message: `Appointment with ${updated.doctorName} was ${
          body.status === 'CANCELLED' ? 'cancelled' : 'updated'
        }.`,
        type: 'APPOINTMENT_REMINDER',
      },
    });

    return NextResponse.json({ success: true, appointment: updated });
  } catch (error: any) {
    console.error('Update appointment error:', error);
    return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const existing = await prisma.appointment.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    await prisma.appointment.delete({ where: { id } });

    // Create notification entry for cancellation
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'Appointment Cancelled',
        message: `Your appointment with ${existing.doctorName} has been cancelled.`,
        type: 'APPOINTMENT_REMINDER',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete appointment error:', error);
    return NextResponse.json({ error: 'Failed to cancel appointment' }, { status: 500 });
  }
}
