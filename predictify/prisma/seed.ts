import { prisma } from '../src/lib/prisma';

async function main() {
  // Clear existing
  await prisma.bet.deleteMany();
  await prisma.market.deleteMany();
  await prisma.user.deleteMany();

  // Create demo users
  const users = await prisma.user.createMany({
    data: [
      { username: 'alice', displayName: 'Alice' },
      { username: 'bob', displayName: 'Bob' },
      { username: 'charlie', displayName: 'Charlie' },
    ],
  });

  const now = new Date();
  const addDays = (d: number) => new Date(now.getTime() + d * 86400000);

  // Markets across categories
  const marketsData = [
    {
      title: 'Will BTC close above $70k this week?',
      category: 'crypto',
      description: 'Weekly close above $70,000 by Sunday 23:59 UTC.',
      closeAt: addDays(5),
      probYesBps: 5400,
      probNoBps: 4600,
    },
    {
      title: 'Will Team Blue win the finals?',
      category: 'sports',
      description: 'Championship finals outcome.',
      closeAt: addDays(3),
      probYesBps: 4800,
      probNoBps: 5200,
    },
    {
      title: 'Will a shutdown occur this month?',
      category: 'politics',
      description: 'US federal government shutdown before month end.',
      closeAt: addDays(10),
      probYesBps: 3500,
      probNoBps: 6500,
    },
    {
      title: 'Will rain exceed 10mm on Saturday?',
      category: 'weather',
      description: 'Local forecast threshold.',
      closeAt: addDays(2),
      probYesBps: 6000,
      probNoBps: 4000,
    },
  ];

  for (const m of marketsData) {
    await prisma.market.create({
      data: {
        title: m.title,
        category: m.category,
        description: m.description,
        closeAt: m.closeAt,
        probYesBps: m.probYesBps,
        probNoBps: m.probNoBps,
      },
    });
  }

  console.log('Seed complete');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
