import { PrismaClient, Outcome } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const categories = [
    { slug: "politics", name: "Politics" },
    { slug: "sports", name: "Sports" },
    { slug: "tech", name: "Technology" },
    { slug: "science", name: "Science" },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name },
      create: category,
    });
  }

  const categoryMap = await prisma.category.findMany();
  const catIdBySlug = Object.fromEntries(
    categoryMap.map((c) => [c.slug, c.id])
  );

  const markets = [
    {
      title: "Will BTC close above $70k this month?",
      description: "Monthly close above 70,000 USD.",
      categorySlug: "crypto", // may not exist; fallback to tech
      currentProbability: 0.58,
    },
    {
      title: "Will Team A win the championship?",
      description: "Team A to lift the trophy this season.",
      categorySlug: "sports",
      currentProbability: 0.42,
    },
    {
      title: "Will Candidate X win the 2026 election?",
      description: "General election outcome for Candidate X.",
      categorySlug: "politics",
      currentProbability: 0.51,
    },
    {
      title: "Will Apple release an AR headset in 2025?",
      description: "Any consumer AR headset announced and shipped in 2025.",
      categorySlug: "tech",
      currentProbability: 0.37,
    },
    {
      title: "Will James Webb discover a potentially habitable exoplanet?",
      description: "Peer-reviewed evidence of habitability indicators.",
      categorySlug: "science",
      currentProbability: 0.21,
    },
  ];

  for (const m of markets) {
    const categoryId = catIdBySlug[m.categorySlug] ?? catIdBySlug["tech"]; // fallback
    await prisma.market.upsert({
      where: { title: m.title },
      update: {
        description: m.description,
        currentProbability: m.currentProbability,
        categoryId,
      },
      create: {
        title: m.title,
        description: m.description,
        currentProbability: m.currentProbability,
        categoryId,
      },
    });
  }

  // Seed badges
  const badges = [
    { slug: "oracle", name: "The Oracle", description: "Win 10 markets." },
    { slug: "data-wizard", name: "Data Wizard", description: "Maintain >60% accuracy over 20 bets." },
    { slug: "hot-streak", name: "Hot Streak", description: "3 correct in a row." },
  ];
  for (const b of badges) {
    await prisma.badge.upsert({
      where: { slug: b.slug },
      update: { name: b.name, description: b.description },
      create: b,
    });
  }

  // Create a default user
  const user = await prisma.user.upsert({
    where: { username: "player1" },
    update: {},
    create: { username: "player1" },
  });

  // Optional: Give user a couple of example bets on random markets
  const allMarkets = await prisma.market.findMany({ take: 2 });
  for (const mk of allMarkets) {
    const betOutcome = Math.random() > 0.5 ? Outcome.YES : Outcome.NO;
    await prisma.bet.create({
      data: {
        userId: user.id,
        marketId: mk.id,
        outcome: betOutcome,
        confidence: 0.55 + Math.random() * 0.2,
        amount: 1000,
      },
    });
  }

  console.log("Seed complete.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
