import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { computeUserInsights } from '@/lib/insights';

export async function GET() {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const data = await computeUserInsights(session.userId);
  return NextResponse.json(data);
}
