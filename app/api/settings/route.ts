import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma/client';
import { settingsSchema } from '@/lib/validations/settings';
import { logAuditEvent } from '@/lib/audit';

/**
 * GET /api/settings
 * Fetch settings and profile info for currently logged-in user
 */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      profile,
      preferences: {
        emailNotifications: true,
        appointmentReminders: true,
        vitalAlerts: true,
        theme: 'light',
      },
    });
  } catch (error: any) {
    console.error('Fetch settings error:', error);
    return NextResponse.json({ error: 'Failed to fetch user settings' }, { status: 500 });
  }
}

/**
 * PATCH /api/settings
 * Update user profile details, notification preferences, and role toggle (for testing)
 */
export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validatedData = settingsSchema.parse(body);

    // Update profile
    const updatedProfile = await prisma.profile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        fullName: validatedData.fullName,
        phone: validatedData.phone || null,
        bloodType: validatedData.bloodType || null,
        emergencyContact: validatedData.emergencyContact || null,
        medicalHistory: validatedData.medicalHistory || null,
        allergies: validatedData.allergies || null,
      },
      update: {
        fullName: validatedData.fullName,
        phone: validatedData.phone || null,
        bloodType: validatedData.bloodType || null,
        emergencyContact: validatedData.emergencyContact || null,
        medicalHistory: validatedData.medicalHistory || null,
        allergies: validatedData.allergies || null,
      },
    });

    await logAuditEvent({
      actorId: user.id,
      action: 'UPDATE_SETTINGS',
      resource: `Profile:${updatedProfile.id}`,
      details: { updatedFields: Object.keys(validatedData) },
    });

    return NextResponse.json({
      message: 'Settings updated successfully',
      profile: updatedProfile,
      role: user.role,
    });
  } catch (error: any) {
    console.error('Update settings error:', error);
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
