import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const market = await prisma.market.findUnique({ where: { id: params.id } });
  if (!market) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ market });
}
