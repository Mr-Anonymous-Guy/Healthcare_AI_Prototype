import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma/client';

export interface TimelineItem {
  id: string;
  type: 'VITAL' | 'SYMPTOM' | 'REPORT' | 'LOG';
  title: string;
  subtitle?: string;
  details?: Record<string, any>;
  timestamp: string;
}

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get('limit');
  const limit = limitParam ? parseInt(limitParam, 10) : 50;

  try {
    const [vitals, symptoms, reports, logs] = await Promise.all([
      prisma.vital.findMany({
        where: { userId: user.id },
        orderBy: { recordedAt: 'desc' },
        take: limit,
      }),
      prisma.symptom.findMany({
        where: { userId: user.id },
        orderBy: { loggedAt: 'desc' },
        take: limit,
      }),
      prisma.medicalReport.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      prisma.healthLog.findMany({
        where: { userId: user.id },
        orderBy: { loggedAt: 'desc' },
        take: limit,
      }),
    ]);

    const timeline: TimelineItem[] = [];

    // Format vitals
    vitals.forEach((v) => {
      const parts: string[] = [];
      if (v.heartRate) parts.push(`HR: ${v.heartRate} bpm`);
      if (v.bloodPressureSystolic && v.bloodPressureDiastolic)
        parts.push(`BP: ${v.bloodPressureSystolic}/${v.bloodPressureDiastolic} mmHg`);
      if (v.spO2) parts.push(`SpO2: ${v.spO2}%`);
      if (v.glucose) parts.push(`Glucose: ${v.glucose} mg/dL`);
      if (v.temperature) parts.push(`Temp: ${v.temperature}°F`);

      timeline.push({
        id: `vital-${v.id}`,
        type: 'VITAL',
        title: 'Vitals Recorded',
        subtitle: parts.join(' | ') || 'Vital sign entry',
        details: {
          heartRate: v.heartRate,
          bp: v.bloodPressureSystolic ? `${v.bloodPressureSystolic}/${v.bloodPressureDiastolic}` : null,
          temperature: v.temperature,
          glucose: v.glucose,
          spO2: v.spO2,
        },
        timestamp: v.recordedAt.toISOString(),
      });
    });

    // Format symptoms
    symptoms.forEach((s) => {
      timeline.push({
        id: `symptom-${s.id}`,
        type: 'SYMPTOM',
        title: s.symptomName,
        subtitle: `Severity: ${s.severity}/10${s.duration ? ` • Duration: ${s.duration}` : ''}`,
        details: {
          severity: s.severity,
          duration: s.duration,
          notes: s.notes,
        },
        timestamp: s.loggedAt.toISOString(),
      });
    });

    // Format medical reports
    reports.forEach((r) => {
      timeline.push({
        id: `report-${r.id}`,
        type: 'REPORT',
        title: r.title,
        subtitle: `Medical Record (${r.reportType || 'General'})`,
        details: {
          status: r.status,
          reportType: r.reportType,
        },
        timestamp: r.createdAt.toISOString(),
      });
    });

    // Format health logs
    logs.forEach((l) => {
      timeline.push({
        id: `log-${l.id}`,
        type: 'LOG',
        title: l.title,
        subtitle: l.logType,
        details: {
          content: l.content,
        },
        timestamp: l.loggedAt.toISOString(),
      });
    });

    // Sort combined timeline descending by timestamp
    timeline.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return NextResponse.json({ timeline: timeline.slice(0, limit) });
  } catch (error: any) {
    console.error('Timeline fetch error:', error);
    return NextResponse.json({ error: 'Failed to aggregate health timeline' }, { status: 500 });
  }
}
