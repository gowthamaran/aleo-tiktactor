import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

const bodySchema = z.object({
  marketId: z.string(),
  outcome: z.enum(['YES', 'NO']),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const json = await req.json().catch(() => null);
  const parse = bodySchema.safeParse(json);
  if (!parse.success) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });

  const { marketId, outcome } = parse.data;

  const market = await prisma.market.findUnique({ where: { id: marketId } });
  if (!market || market.status === 'RESOLVED') return NextResponse.json({ error: 'Invalid market' }, { status: 400 });

  const result = await prisma.$transaction(async (tx) => {
    const resolved = await tx.market.update({
      where: { id: marketId },
      data: { status: 'RESOLVED', resolvedAt: new Date(), resolvedOutcome: outcome },
    });

    const bets = await tx.bet.findMany({ where: { marketId } });

    for (const bet of bets) {
      const won = bet.outcome === outcome;
      const payout = won ? bet.amount * 2 : 0; // simple 2x payout for winners

      await tx.bet.update({ where: { id: bet.id }, data: { settled: true, payout } });

      if (won) {
        await tx.user.update({
          where: { id: bet.userId },
          data: {
            balance: { increment: payout },
            wins: { increment: 1 },
            streakCurrent: { increment: 1 },
            predictionsCorrect: { increment: 1 },
            profit: { increment: payout - bet.amount },
          },
        });
      } else {
        await tx.user.update({
          where: { id: bet.userId },
          data: {
            losses: { increment: 1 },
            streakCurrent: 0,
            profit: { decrement: bet.amount },
          },
        });
      }
    }

    // Recompute each user's best streak after updates
    const affectedUsers = [...new Set(bets.map((b) => b.userId))];
    for (const userId of affectedUsers) {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) continue;
      const streakBest = Math.max(user.streakBest, user.streakCurrent);
      await tx.user.update({ where: { id: userId }, data: { streakBest } });
    }

    return resolved;
  });

  return NextResponse.json({ ok: true, market: result });
}
