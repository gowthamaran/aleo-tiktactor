import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { computeUserInsights } from '@/lib/insights';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session.userId) {
    return (
      <main>
        <p>Please <a className="underline" href="/login">login</a>.</p>
      </main>
    );
  }
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return <main>User not found</main>;

  const accuracy = user.predictionsMade > 0 ? (user.predictionsCorrect / user.predictionsMade) * 100 : 0;
  const insights = await computeUserInsights(user.id);

  return (
    <main className="space-y-4">
      <h2 className="text-2xl font-semibold">Your Stats</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="border rounded p-3 bg-white">
          <div className="text-xs text-gray-500">Balance</div>
          <div className="text-lg font-medium">{user.balance}c</div>
        </div>
        <div className="border rounded p-3 bg-white">
          <div className="text-xs text-gray-500">Profit/Loss</div>
          <div className={`text-lg font-medium ${user.profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>{user.profit}c</div>
        </div>
        <div className="border rounded p-3 bg-white">
          <div className="text-xs text-gray-500">Wins / Losses</div>
          <div className="text-lg font-medium">{user.wins} / {user.losses}</div>
        </div>
        <div className="border rounded p-3 bg-white">
          <div className="text-xs text-gray-500">Accuracy</div>
          <div className="text-lg font-medium">{accuracy.toFixed(1)}%</div>
        </div>
        <div className="border rounded p-3 bg-white">
          <div className="text-xs text-gray-500">Current Streak</div>
          <div className="text-lg font-medium">{user.streakCurrent}</div>
        </div>
        <div className="border rounded p-3 bg-white">
          <div className="text-xs text-gray-500">Best Streak</div>
          <div className="text-lg font-medium">{user.streakBest}</div>
        </div>
      </div>
      <form action="/api/auth/logout" method="POST">
        <button className="text-sm underline">Logout</button>
      </form>
      <section className="space-y-2">
        <h3 className="text-lg font-semibold">Insights</h3>
        {insights.tips.length === 0 ? (
          <p className="text-sm text-gray-600">Place more bets to unlock insights.</p>
        ) : (
          <ul className="list-disc ml-5 text-sm">
            {insights.tips.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        )}
        {insights.badges.length > 0 && (
          <div className="mt-2 flex gap-2 flex-wrap">
            {insights.badges.map((b) => (
              <span key={b} className="px-2 py-1 text-xs rounded bg-purple-100 text-purple-800 border border-purple-300">{b}</span>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
