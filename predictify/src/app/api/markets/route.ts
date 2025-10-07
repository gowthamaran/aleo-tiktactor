import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const includeResolved = searchParams.get("includeResolved") === "true";

  const markets = await prisma.market.findMany({
    where: includeResolved ? {} : { active: true },
    orderBy: [{ active: "desc" }, { createdAt: "desc" }],
    include: {
      category: true,
    },
  });

  return NextResponse.json(
    markets.map((m) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      category: m.category?.name ?? null,
      currentProbability: m.currentProbability,
      resolvesAt: m.resolvesAt,
      resolvedAt: m.resolvedAt,
      resolvedOutcome: m.resolvedOutcome,
      active: m.active,
    }))
  );
}
