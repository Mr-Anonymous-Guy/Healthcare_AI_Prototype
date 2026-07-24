import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma/client';
import { vitalSchema } from '@/lib/validations/vitals';

/**
 * GET /api/vitals
 * Fetch vitals for current authenticated user
 */
export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get('limit');
  const limit = limitParam ? parseInt(limitParam, 10) : undefined;

  try {
    const vitals = await prisma.vital.findMany({
      where: { userId: user.id },
      orderBy: { recordedAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({ vitals });
  } catch (error: any) {
    console.error('Fetch vitals error:', error);
    return NextResponse.json({ error: 'Failed to fetch vitals' }, { status: 500 });
  }
}

/**
 * POST /api/vitals
 * Log new vitals for current authenticated user
 */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validated = vitalSchema.parse(body);

    const vital = await prisma.vital.create({
      data: {
        userId: user.id,
        heartRate: validated.heartRate ?? null,
        bloodPressureSystolic: validated.bloodPressureSystolic ?? null,
        bloodPressureDiastolic: validated.bloodPressureDiastolic ?? null,
        temperature: validated.temperature ?? null,
        glucose: validated.glucose ?? null,
        spO2: validated.spO2 ?? null,
        recordedAt: validated.recordedAt ? new Date(validated.recordedAt) : new Date(),
      },
    });

    return NextResponse.json({ success: true, vital }, { status: 201 });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    console.error('Create vital error:', error);
    return NextResponse.json({ error: error.message || 'Failed to record vitals' }, { status: 500 });
  }
}
