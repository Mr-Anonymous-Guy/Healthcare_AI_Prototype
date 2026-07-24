import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma/client';

/**
 * GET /api/admin/stats
 * Admin dashboard overview stats: user count, report breakdown, appointments, audit logs count
 * Gated behind ADMIN role check
 */
export async function GET() {
  const user = await getCurrentUser();

  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Forbidden: Admin access required' },
      { status: 403 }
    );
  }

  try {
    const [
      totalUsers,
      totalReports,
      pendingReports,
      processedReports,
      totalAppointments,
      totalVitals,
      totalAuditLogs,
      recentAuditLogs,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.medicalReport.count(),
      prisma.medicalReport.count({ where: { status: 'PENDING' } }),
      prisma.medicalReport.count({ where: { status: 'PROCESSED' } }),
      prisma.appointment.count(),
      prisma.vital.count(),
      prisma.auditLog.count(),
      prisma.auditLog.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          actor: {
            select: { email: true, role: true },
          },
        },
      }),
    ]);

    return NextResponse.json({
      stats: {
        totalUsers,
        reports: {
          total: totalReports,
          pending: pendingReports,
          processed: processedReports,
          failed: totalReports - (pendingReports + processedReports),
        },
        totalAppointments,
        totalVitals,
        totalAuditLogs,
      },
      recentAuditLogs,
    });
  } catch (error: any) {
    console.error('Fetch admin stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch admin stats' }, { status: 500 });
  }
}
