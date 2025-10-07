import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { Outcome, Bet, User } from "@prisma/client";

const resolveSchema = z.object({
  marketId: z.string().min(1),
  outcome: z.enum(["YES", "NO"]),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = (await req.json()) as unknown;
    const parsed = resolveSchema.parse(body);

    const market = await prisma.market.findUnique({ where: { id: parsed.marketId } });
    if (!market) {
      return NextResponse.json({ error: "Market not found" }, { status: 404 });
    }
    if (market.resolvedOutcome) {
      return NextResponse.json({ error: "Market already resolved" }, { status: 400 });
    }

    const now = new Date();
    const { betsToSettle, usersAffected } = await prisma.$transaction(async (tx): Promise<{ betsToSettle: number; usersAffected: number }> => {
      const updatedMarket = await tx.market.update({
        where: { id: market.id },
        data: { resolvedOutcome: parsed.outcome as Outcome, resolvedAt: now, active: false },
      });

      const unsettled: Bet[] = await tx.bet.findMany({ where: { marketId: market.id, settled: false } });

      const userCurrentStreak = new Map<string, { current: number; best: number }>();

      for (const bet of unsettled) {
        const won = bet.outcome === parsed.outcome;
        const profit = won ? bet.amount : -bet.amount;
        // pay 2x back to winner: return stake + profit
        if (won) {
          await tx.user.update({
            where: { id: bet.userId },
            data: { balance: { increment: bet.amount * 2 } },
          });
        }
        await tx.bet.update({
          where: { id: bet.id },
          data: { settled: true, profit, won },
        });

        // update streaks
        if (!userCurrentStreak.has(bet.userId)) {
          const u: User | null = await tx.user.findUnique({ where: { id: bet.userId } });
          userCurrentStreak.set(bet.userId, { current: u?.streakCurrent ?? 0, best: u?.streakBest ?? 0 });
        }
        const streak = userCurrentStreak.get(bet.userId)!;
        streak.current = won ? streak.current + 1 : 0;
        if (streak.current > streak.best) streak.best = streak.current;
        await tx.user.update({ where: { id: bet.userId }, data: { streakCurrent: streak.current, streakBest: streak.best } });
      }

      return { betsToSettle: unsettled.length, usersAffected: userCurrentStreak.size };
    });

    return NextResponse.json({ ok: true, settledBets: betsToSettle, usersAffected });
  } catch (err: unknown) {
    if (err && typeof err === "object" && "name" in err && (err as { name?: string }).name === "ZodError") {
      const e = err as { flatten?: () => unknown };
      return NextResponse.json({ error: e.flatten?.() ?? "Invalid input" }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Failed to resolve market" }, { status: 500 });
  }
}
