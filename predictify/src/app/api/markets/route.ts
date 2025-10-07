import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const category = url.searchParams.get('category') ?? undefined;
  const markets = await prisma.market.findMany({
    where: { status: 'OPEN', ...(category ? { category } : {}) },
    orderBy: { closeAt: 'asc' },
  });
  return NextResponse.json({ markets });
}
