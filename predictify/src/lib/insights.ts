import { prisma } from '@/lib/prisma';

export async function computeUserInsights(userId: string) {
  // Simple heuristics: category accuracy deltas and over/underconfidence vs implied odds
  const bets = await prisma.bet.findMany({
    where: { userId },
    include: { market: true },
  });

  const byCategory: Record<string, { made: number; correct: number }> = {};
  let crowdDeviationSum = 0;
  let crowdDeviationCount = 0;

  for (const bet of bets) {
    const cat = bet.market.category;
    byCategory[cat] ??= { made: 0, correct: 0 };
    byCategory[cat].made += 1;
    if (bet.settled && bet.payout && bet.payout > 0) byCategory[cat].correct += 1;

    // If bet YES and probYesBpsAtBet was high, following crowd; compute absolute deviation from 50%
    const impliedYes = bet.probYesBpsAtBet / 10000;
    const chosenProb = bet.outcome === 'YES' ? impliedYes : 1 - impliedYes;
    crowdDeviationSum += Math.abs(chosenProb - 0.5);
    crowdDeviationCount += 1;
  }

  const categoryFindings = Object.entries(byCategory)
    .map(([category, v]) => ({ category, accuracy: v.made ? v.correct / v.made : 0, made: v.made }))
    .sort((a, b) => a.accuracy - b.accuracy);

  const tips: string[] = [];
  if (crowdDeviationCount >= 5) {
    const avgDev = crowdDeviationSum / crowdDeviationCount;
    if (avgDev > 0.2) tips.push('You tend to follow strong crowd odds. Try independent checks.');
    else tips.push('You often bet near 50-50. Consider sharpening conviction when evidence is strong.');
  }
  if (categoryFindings.length >= 2) {
    const worst = categoryFindings[0];
    const best = categoryFindings[categoryFindings.length - 1];
    tips.push(`You underperform in ${worst.category} vs ${best.category}. Focus review on ${worst.category}.`);
  }

  // Simple badges
  const badges: string[] = [];
  const wins = bets.filter((b) => b.settled && (b.payout ?? 0) > 0).length;
  if (wins >= 5) badges.push('The Oracle');
  const longshotWins = bets.filter((b) => b.settled && (b.payout ?? 0) > 0 && (b.outcome === 'YES' ? b.probYesBpsAtBet : b.probNoBpsAtBet) <= 3000).length;
  if (longshotWins >= 2) badges.push('Data Wizard');

  return { tips, categoryFindings, badges };
}
