import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma/client';
import { logAuditEvent } from '@/lib/audit';

/**
 * GET /api/admin/users
 * Returns list of all users in system with role, profile metadata, and real table counts.
 * Gated behind ADMIN role check (server-side DB verification).
 */
export async function GET() {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Forbidden: Admin access required' },
      { status: 403 }
    );
  }

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        profile: {
          select: {
            fullName: true,
            phone: true,
            bloodType: true,
          },
        },
        _count: {
          select: {
            medicalReports: true,
            appointments: true,
            vitals: true,
            symptoms: true,
          },
        },
      },
    });

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error('Fetch users list error:', error);
    return NextResponse.json({ error: 'Failed to fetch user list' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/users
 * Explicit Admin-Only role reassignment.
 * Re-verifies caller is ADMIN from DB before mutating user role.
 */
export async function PATCH(request: Request) {
  const currentUser = await getCurrentUser();

  // Strict server-side RBAC check from DB
  if (!currentUser || currentUser.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Forbidden: Admin authorization required' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { userId, role } = body as { userId: string; role: 'PATIENT' | 'ADMIN' | 'DOCTOR' };

    if (!userId || !role || !['PATIENT', 'ADMIN', 'DOCTOR'].includes(role)) {
      return NextResponse.json({ error: 'Invalid userId or role specified' }, { status: 400 });
    }

    // Fetch existing target user to get old role
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }

    const oldRole = targetUser.role;

    // Update user role on User model (single source of truth in database)
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, email: true, role: true },
    });

    // Audit log entry tracking actor, target user, old role, new role, and timestamp
    const timestamp = new Date().toISOString();
    await logAuditEvent({
      actorId: currentUser.id,
      action: 'CHANGE_USER_ROLE',
      resource: `User:${userId}`,
      details: {
        actorEmail: currentUser.email,
        targetUserId: userId,
        targetEmail: targetUser.email,
        oldRole,
        newRole: role,
        timestamp,
      },
    });

    return NextResponse.json({
      message: `Role for ${targetUser.email} updated from ${oldRole} to ${role}`,
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('Update user role error:', error);
    return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 });
  }
}
