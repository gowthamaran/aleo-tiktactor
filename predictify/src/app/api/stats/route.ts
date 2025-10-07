import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const user = await getOrCreateUserFromRequest(req);

    const [bets, settledAgg, winsCount, lossesCount, byCategory] = await Promise.all([
      prisma.bet.findMany({ where: { userId: user.id }, include: { market: { include: { category: true } } } }),
      prisma.bet.aggregate({ where: { userId: user.id, settled: true }, _sum: { profit: true } }),
      prisma.bet.count({ where: { userId: user.id, won: true } }),
      prisma.bet.count({ where: { userId: user.id, settled: true, won: false } }),
      prisma.bet.groupBy({
        by: ["marketId"],
        where: { userId: user.id, settled: true },
        _sum: { profit: true },
      }),
    ]);

    const totalSettled = winsCount + lossesCount;
    const accuracy = totalSettled > 0 ? winsCount / totalSettled : 0;
    const profit = settledAgg._sum.profit ?? 0;

    const categoryStatsMap = new Map<string, { bets: number; wins: number; losses: number }>();
    for (const b of bets.filter((b) => b.settled)) {
      const cat = b.market.category?.name ?? "Uncategorized";
      const entry = categoryStatsMap.get(cat) ?? { bets: 0, wins: 0, losses: 0 };
      entry.bets += 1;
      if (b.won) entry.wins += 1; else entry.losses += 1;
      categoryStatsMap.set(cat, entry);
    }

    const categories = Array.from(categoryStatsMap.entries()).map(([name, s]) => ({
      name,
      bets: s.bets,
      wins: s.wins,
      losses: s.losses,
      accuracy: s.bets ? s.wins / s.bets : 0,
    }));

    // Simple heuristics for over/underconfidence: compare accuracy vs. average confidence by category
    const confidenceByCategory = new Map<string, number[]>();
    for (const b of bets) {
      const cat = b.market.category?.name ?? "Uncategorized";
      if (typeof b.confidence === "number") {
        const arr = confidenceByCategory.get(cat) ?? [];
        arr.push(b.confidence);
        confidenceByCategory.set(cat, arr);
      }
    }
    const insights = categories.map((c) => {
      const confs = confidenceByCategory.get(c.name) ?? [];
      const avgConf = confs.length ? confs.reduce((a, b) => a + b, 0) / confs.length : 0;
      const gap = avgConf - c.accuracy; // positive means overconfident
      let note: string | null = null;
      if (confs.length >= 3) {
        if (gap > 0.1) note = "Overconfident here; dial back probability estimates.";
        else if (gap < -0.1) note = "Underconfident here; trust your read more.";
      }
      return { category: c.name, avgConfidence: avgConf, accuracy: c.accuracy, note };
    });

    return NextResponse.json({
      user: { username: user.username, balance: user.balance, streakCurrent: user.streakCurrent, streakBest: user.streakBest },
      totals: { bets: bets.length, settled: totalSettled, wins: winsCount, losses: lossesCount, profit, accuracy },
      categories,
      insights,
    });
  } catch (err: unknown) {
    console.error(err);
    return NextResponse.json({ error: "Failed to compute stats" }, { status: 500 });
  }
}
