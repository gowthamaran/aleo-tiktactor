import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

const bodySchema = z.object({
  marketId: z.string(),
  outcome: z.enum(['YES', 'NO']),
  amount: z.number().int().positive().max(1_000_000),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parse = bodySchema.safeParse(json);
  if (!parse.success) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });

  const { marketId, outcome, amount } = parse.data;

  const [user, market] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.userId } }),
    prisma.market.findUnique({ where: { id: marketId } }),
  ]);
  if (!user) return NextResponse.json({ error: 'User missing' }, { status: 400 });
  if (!market) return NextResponse.json({ error: 'Market not found' }, { status: 404 });
  // Enforce market closing time; auto-close if passed
  const now = new Date();
  if (now > market.closeAt || market.status !== 'OPEN') {
    if (market.status === 'OPEN') {
      await prisma.market.update({ where: { id: market.id }, data: { status: 'CLOSED' } });
    }
    return NextResponse.json({ error: 'Market closed' }, { status: 400 });
  }
  if (user.balance < amount) return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });

  const bet = await prisma.$transaction(async (tx) => {
    const probYesBefore = market.probYesBps;
    const probNoBefore = market.probNoBps;
    const created = await tx.bet.create({
      data: {
        userId: user.id,
        marketId: market.id,
        outcome,
        amount,
        probYesBpsAtBet: probYesBefore,
        probNoBpsAtBet: probNoBefore,
      },
    });

    // Deduct balance
    await tx.user.update({ where: { id: user.id }, data: { balance: { decrement: amount }, predictionsMade: { increment: 1 } } });

    // Update market pools and implied probabilities (simple bps formula)
    const incYes = outcome === 'YES' ? amount : 0;
    const incNo = outcome === 'NO' ? amount : 0;
    const updated = await tx.market.update({
      where: { id: market.id },
      data: {
        totalYesStake: { increment: incYes },
        totalNoStake: { increment: incNo },
      },
    });

    const yes = updated.totalYesStake;
    const no = updated.totalNoStake;
    const total = yes + no;
    const probYes = total > 0 ? Math.round((yes / total) * 10000) : updated.probYesBps;
    const probNo = 10000 - probYes;

    await tx.market.update({
      where: { id: market.id },
      data: { probYesBps: probYes, probNoBps: probNo },
    });

    return created;
  });

  return NextResponse.json({ bet });
}
