import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma/client';
import { appointmentSchema } from '@/lib/validations/appointments';
import { sendAppointmentConfirmationEmail } from '@/services/emailService';

/**
 * GET /api/appointments
 * List appointments for current authenticated user
 */
export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get('status');
  const limitParam = searchParams.get('limit');
  const limit = limitParam ? parseInt(limitParam, 10) : undefined;

  try {
    const appointments = await prisma.appointment.findMany({
      where: {
        userId: user.id,
        ...(statusParam ? { status: statusParam as any } : {}),
      },
      orderBy: { appointmentDate: 'asc' },
      take: limit,
    });

    return NextResponse.json({ appointments });
  } catch (error: any) {
    console.error('Fetch appointments error:', error);
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
  }
}

/**
 * POST /api/appointments
 * Schedule a new appointment for current user
 */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validated = appointmentSchema.parse(body);

    const appointmentDate = new Date(validated.appointmentDate);

    // 1. Create Appointment record
    const appointment = await prisma.appointment.create({
      data: {
        userId: user.id,
        doctorName: validated.doctorName,
        department: validated.department || null,
        appointmentDate,
        notes: validated.notes || null,
        status: validated.status || 'SCHEDULED',
      },
    });

    // 2. Create in-app Notification record
    const formattedDate = appointmentDate.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'Appointment Scheduled',
        message: `Your appointment with ${validated.doctorName} is confirmed for ${formattedDate}.`,
        type: 'APPOINTMENT_REMINDER',
        scheduledFor: appointmentDate,
      },
    });

    // 3. Send email confirmation via Resend (async non-blocking)
    sendAppointmentConfirmationEmail({
      toEmail: user.email,
      patientName: user.fullName || 'Patient',
      doctorName: validated.doctorName,
      department: validated.department,
      appointmentDate: validated.appointmentDate,
      notes: validated.notes,
    }).catch((err) => console.warn('Email dispatch warning:', err));

    return NextResponse.json({ success: true, appointment }, { status: 201 });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    console.error('Create appointment error:', error);
    return NextResponse.json({ error: error.message || 'Failed to schedule appointment' }, { status: 500 });
  }
}
