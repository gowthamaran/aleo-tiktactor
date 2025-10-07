import { prisma } from '@/lib/prisma';

export default async function LeaderboardPage() {
  const top = await prisma.user.findMany({
    orderBy: [
      { profit: 'desc' },
      { wins: 'desc' },
    ],
    take: 20,
  });

  return (
    <main className="space-y-4">
      <h2 className="text-2xl font-semibold">Leaderboard</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b">
            <th className="py-2">User</th>
            <th>Profit</th>
            <th>Wins</th>
            <th>Losses</th>
            <th>Streak</th>
          </tr>
        </thead>
        <tbody>
          {top.map((u) => (
            <tr key={u.id} className="border-b">
              <td className="py-2">{u.displayName || u.username}</td>
              <td className={u.profit >= 0 ? 'text-green-700' : 'text-red-700'}>{u.profit}c</td>
              <td>{u.wins}</td>
              <td>{u.losses}</td>
              <td>{u.streakBest}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
