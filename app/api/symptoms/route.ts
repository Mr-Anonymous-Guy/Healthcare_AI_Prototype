import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma/client';
import { symptomSchema } from '@/lib/validations/symptoms';

/**
 * GET /api/symptoms
 * Fetch symptom logs for current authenticated user
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
    const symptoms = await prisma.symptom.findMany({
      where: { userId: user.id },
      orderBy: { loggedAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({ symptoms });
  } catch (error: any) {
    console.error('Fetch symptoms error:', error);
    return NextResponse.json({ error: 'Failed to fetch symptoms' }, { status: 500 });
  }
}

/**
 * POST /api/symptoms
 * Create new symptom log for current user
 */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validated = symptomSchema.parse(body);

    const symptom = await prisma.symptom.create({
      data: {
        userId: user.id,
        symptomName: validated.symptomName,
        severity: validated.severity,
        duration: validated.duration || null,
        notes: validated.notes || null,
        loggedAt: validated.loggedAt ? new Date(validated.loggedAt) : new Date(),
      },
    });

    return NextResponse.json({ success: true, symptom }, { status: 201 });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    console.error('Create symptom error:', error);
    return NextResponse.json({ error: error.message || 'Failed to log symptom' }, { status: 500 });
  }
}
