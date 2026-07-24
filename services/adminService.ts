import { prisma } from '@/lib/prisma/client';
import { logAuditEvent } from '@/lib/audit';

export interface AdminOverviewStats {
  totalUsers: number;
  totalFiles: number;
  appointmentsThisWeek: number;
  totalConversations: number;
  totalVitalsLogged: number;
  totalSymptomsLogged: number;
  totalAuditLogs: number;
}

/**
 * Fetch real aggregate system statistics for Admin Overview
 */
export async function getAdminOverviewStats(): Promise<AdminOverviewStats> {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  const [
    totalUsers,
    totalFiles,
    appointmentsThisWeek,
    totalConversations,
    totalVitalsLogged,
    totalSymptomsLogged,
    totalAuditLogs,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.file.count(),
    prisma.appointment.count({
      where: {
        appointmentDate: {
          gte: startOfWeek,
          lt: endOfWeek,
        },
      },
    }),
    prisma.conversation.count(),
    prisma.vital.count(),
    prisma.symptom.count(),
    prisma.auditLog.count(),
  ]);

  return {
    totalUsers,
    totalFiles,
    appointmentsThisWeek,
    totalConversations,
    totalVitalsLogged,
    totalSymptomsLogged,
    totalAuditLogs,
  };
}

/**
 * Fetch paginated list of uploaded files across all users with text extraction status
 */
export async function getAdminFiles(search?: string, status?: string) {
  const where: any = {};

  if (search) {
    where.OR = [
      { fileName: { contains: search, mode: 'insensitive' } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
      { user: { profile: { fullName: { contains: search, mode: 'insensitive' } } } },
    ];
  }

  const files = await prisma.file.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      fileName: true,
      fileKey: true,
      fileUrl: true,
      fileSize: true,
      mimeType: true,
      extractedText: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          email: true,
          profile: {
            select: {
              fullName: true,
            },
          },
        },
      },
    },
  });

  return files.map((f) => ({
    ...f,
    status: f.extractedText && f.extractedText.trim().length > 0 ? 'PARSED' : 'PENDING',
  }));
}

/**
 * Admin action: Delete a medical PDF file + emit Audit Log
 */
export async function deleteAdminFile(fileId: string, actorId: string, actorEmail: string) {
  const targetFile = await prisma.file.findUnique({
    where: { id: fileId },
    select: { id: true, fileName: true, userId: true },
  });

  if (!targetFile) {
    throw new Error('File not found');
  }

  await prisma.file.delete({
    where: { id: fileId },
  });

  await logAuditEvent({
    actorId,
    action: 'DELETE_MEDICAL_FILE',
    resource: `File:${fileId}`,
    details: {
      actorEmail,
      fileId,
      fileName: targetFile.fileName,
      targetUserId: targetFile.userId,
      timestamp: new Date().toISOString(),
    },
  });

  return { success: true, message: `File "${targetFile.fileName}" deleted successfully` };
}

/**
 * Fetch all appointments system-wide with filters
 */
export async function getAdminAppointments(status?: string, search?: string) {
  const where: any = {};

  if (status && status !== 'ALL') {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { doctorName: { contains: search, mode: 'insensitive' } },
      { department: { contains: search, mode: 'insensitive' } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
      { user: { profile: { fullName: { contains: search, mode: 'insensitive' } } } },
    ];
  }

  return await prisma.appointment.findMany({
    where,
    orderBy: { appointmentDate: 'desc' },
    select: {
      id: true,
      doctorName: true,
      appointmentDate: true,
      status: true,
      department: true,
      notes: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          email: true,
          profile: {
            select: {
              fullName: true,
              phone: true,
            },
          },
        },
      },
    },
  });
}

/**
 * Admin action: Cancel an appointment on patient behalf + emit Audit Log
 */
export async function cancelAdminAppointment(appointmentId: string, actorId: string, actorEmail: string) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    select: { id: true, doctorName: true, status: true, userId: true, user: { select: { email: true } } },
  });

  if (!appointment) {
    throw new Error('Appointment not found');
  }

  const oldStatus = appointment.status;

  const updated = await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: 'CANCELLED' },
  });

  await logAuditEvent({
    actorId,
    action: 'CANCEL_APPOINTMENT',
    resource: `Appointment:${appointmentId}`,
    details: {
      actorEmail,
      appointmentId,
      patientEmail: appointment.user.email,
      doctorName: appointment.doctorName,
      oldStatus,
      newStatus: 'CANCELLED',
      timestamp: new Date().toISOString(),
    },
  });

  return updated;
}

/**
 * Fetch aggregated vitals and symptoms with clinical anomaly flags
 */
export async function getAdminVitalsSymptoms(search?: string) {
  const whereUser: any = {};
  if (search) {
    whereUser.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { profile: { fullName: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const [vitals, symptoms] = await Promise.all([
    prisma.vital.findMany({
      where: search ? { user: whereUser } : undefined,
      orderBy: { recordedAt: 'desc' },
      take: 100,
      select: {
        id: true,
        heartRate: true,
        bloodPressureSystolic: true,
        bloodPressureDiastolic: true,
        temperature: true,
        glucose: true,
        spO2: true,
        recordedAt: true,
        user: {
          select: {
            id: true,
            email: true,
            profile: { select: { fullName: true } },
          },
        },
      },
    }),
    prisma.symptom.findMany({
      where: search ? { user: whereUser } : undefined,
      orderBy: { loggedAt: 'desc' },
      take: 100,
      select: {
        id: true,
        symptomName: true,
        severity: true,
        duration: true,
        loggedAt: true,
        notes: true,
        user: {
          select: {
            id: true,
            email: true,
            profile: { select: { fullName: true } },
          },
        },
      },
    }),
  ]);

  // Flag anomalous vitals
  const flaggedVitals = vitals.map((v) => {
    let isAnomalous = false;
    let anomalyReason = '';

    if (v.spO2 !== null && v.spO2 !== undefined && v.spO2 < 95) {
      isAnomalous = true;
      anomalyReason = `Low Oxygen Saturation (${v.spO2}%)`;
    } else if (v.heartRate !== null && v.heartRate !== undefined && (v.heartRate > 100 || v.heartRate < 50)) {
      isAnomalous = true;
      anomalyReason = v.heartRate > 100 ? `Tachycardia (${v.heartRate} bpm)` : `Bradycardia (${v.heartRate} bpm)`;
    } else if (v.temperature !== null && v.temperature !== undefined && v.temperature > 38.0) {
      isAnomalous = true;
      anomalyReason = `Fever / High Temp (${v.temperature}°C)`;
    } else if (v.bloodPressureSystolic !== null && v.bloodPressureSystolic !== undefined && v.bloodPressureSystolic > 140) {
      isAnomalous = true;
      anomalyReason = `High Blood Pressure (${v.bloodPressureSystolic}/${v.bloodPressureDiastolic || ''} mmHg)`;
    }

    return {
      ...v,
      isAnomalous,
      anomalyReason,
    };
  });

  return { vitals: flaggedVitals, symptoms };
}

/**
 * Fetch AI Chat conversations list across all users
 */
export async function getAdminAIChatSessions(search?: string) {
  const where: any = {};
  if (search) {
    where.user = {
      OR: [
        { email: { contains: search, mode: 'insensitive' } },
        { profile: { fullName: { contains: search, mode: 'insensitive' } } },
      ],
    };
  }

  const conversations = await prisma.conversation.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      title: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          email: true,
          profile: { select: { fullName: true } },
        },
      },
      _count: {
        select: { messages: true },
      },
    },
  });

  return conversations;
}

/**
 * Read-only transcript viewer for safety/QA review
 */
export async function getAdminChatTranscript(conversationId: string) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: {
      id: true,
      title: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          email: true,
          profile: { select: { fullName: true } },
        },
      },
      messages: {
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          role: true,
          content: true,
          createdAt: true,
        },
      },
    },
  });

  return conversation;
}

/**
 * Fetch system notifications log across all users
 */
export async function getAdminNotifications(search?: string, isRead?: string) {
  const where: any = {};
  if (isRead === 'true') where.isRead = true;
  if (isRead === 'false') where.isRead = false;

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { message: { contains: search, mode: 'insensitive' } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
      { user: { profile: { fullName: { contains: search, mode: 'insensitive' } } } },
    ];
  }

  return await prisma.notification.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      message: true,
      type: true,
      isRead: true,
      scheduledFor: true,
      sentAt: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          email: true,
          profile: { select: { fullName: true } },
        },
      },
    },
  });
}

/**
 * Fetch full patient detail overview for /admin/users/[id]
 */
export async function getAdminUserDetail(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      profile: true,
      files: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          fileName: true,
          fileSize: true,
          mimeType: true,
          createdAt: true,
        },
      },
      appointments: {
        orderBy: { appointmentDate: 'desc' },
        select: {
          id: true,
          doctorName: true,
          appointmentDate: true,
          status: true,
          department: true,
        },
      },
      vitals: {
        orderBy: { recordedAt: 'desc' },
        take: 20,
        select: {
          id: true,
          heartRate: true,
          bloodPressureSystolic: true,
          bloodPressureDiastolic: true,
          temperature: true,
          glucose: true,
          spO2: true,
          recordedAt: true,
        },
      },
      symptoms: {
        orderBy: { loggedAt: 'desc' },
        take: 20,
        select: {
          id: true,
          symptomName: true,
          severity: true,
          duration: true,
          loggedAt: true,
        },
      },
      conversations: {
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          title: true,
          createdAt: true,
          _count: { select: { messages: true } },
        },
      },
    },
  });

  return user;
}
