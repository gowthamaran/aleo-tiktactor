import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOrCreateUserFromRequest } from "@/lib/auth";
import { Outcome, Bet, Market, User } from "@prisma/client";

const betSchema = z.object({
  marketId: z.string().min(1),
  outcome: z.enum(["YES", "NO"]),
  amount: z.number().int().positive().max(1_000_000),
  confidence: z.number().min(0).max(1).optional(),
});

function clamp(x: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, x));
}

function adjustProbability(current: number, outcome: Outcome, amount: number) {
  const scaled = Math.tanh(amount / 2500) * 0.07; // up to ~7% move
  const delta = outcome === "YES" ? scaled : -scaled;
  const next = current + delta;
  return clamp(next, 0.01, 0.99);
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = (await req.json()) as unknown;
    const parsed = betSchema.parse(body);

    const user = await getOrCreateUserFromRequest(req);

    const market = await prisma.market.findUnique({ where: { id: parsed.marketId } });
    if (!market || !market.active || market.resolvedOutcome) {
      return NextResponse.json({ error: "Market not available" }, { status: 400 });
    }

    if (user.balance < parsed.amount) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
    }

    // Place bet and decrement balance in a transaction
    const result = await prisma.$transaction(async (tx): Promise<{ bet: Bet; updatedUser: User; updatedMarket: Market }> => {
      const bet = await tx.bet.create({
        data: {
          userId: user.id,
          marketId: market.id,
          outcome: parsed.outcome as Outcome,
          confidence: parsed.confidence,
          amount: parsed.amount,
        },
      });

      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: { balance: { decrement: parsed.amount } },
      });

      // Simulate crowd probability movement
      const newProb = adjustProbability(market.currentProbability, bet.outcome, bet.amount);
      const updatedMarket = await tx.market.update({
        where: { id: market.id },
        data: { currentProbability: newProb },
      });

      return { bet, updatedUser, updatedMarket };
    });

    return NextResponse.json({
      bet: result.bet,
      balance: result.updatedUser.balance,
      market: {
        id: result.updatedMarket.id,
        currentProbability: result.updatedMarket.currentProbability,
      },
    });
  } catch (err: unknown) {
    if (err && typeof err === "object" && "name" in err && (err as { name?: string }).name === "ZodError") {
      const e = err as { flatten?: () => unknown };
      return NextResponse.json({ error: e.flatten?.() ?? "Invalid input" }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Failed to place bet" }, { status: 500 });
  }
}
