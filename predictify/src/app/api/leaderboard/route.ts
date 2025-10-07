import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest): Promise<NextResponse> {
  // Top by total profit (settled)
  const profitGroups = await prisma.bet.groupBy({
    by: ["userId"],
    where: { settled: true },
    _sum: { profit: true },
    orderBy: { _sum: { profit: "desc" } },
    take: 10,
  });
  const userIds = profitGroups.map((g) => g.userId);
  const users = await prisma.user.findMany({ where: { id: { in: userIds } } });
  const userMap = new Map(users.map((u) => [u.id, u]));

  const topProfit = profitGroups.map((g) => ({
    username: userMap.get(g.userId)?.username ?? "unknown",
    profit: g._sum.profit ?? 0,
  }));

  const topStreaks = await prisma.user.findMany({
    orderBy: { streakBest: "desc" },
    select: { username: true, streakBest: true },
    take: 10,
  });

  return NextResponse.json({ topProfit, topStreaks });
}
