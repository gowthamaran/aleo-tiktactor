"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Totals = { bets: number; settled: number; wins: number; losses: number; profit: number; accuracy: number };
type Category = { name: string; bets: number; wins: number; losses: number; accuracy: number };

export default function Dashboard() {
  const [username, setUsername] = useState("player1");
  type StatsResponse = { user: { username: string; balance: number; streakCurrent: number; streakBest: number }; totals: Totals; categories: Category[]; insights?: { category: string; avgConfidence: number; accuracy: number; note: string | null }[] };
  const [data, setData] = useState<StatsResponse | null>(null);

  const headers = useMemo(() => ({ "x-username": username }), [username]);

  async function load() {
    const res = await fetch("/api/stats", { headers });
    const json = (await res.json()) as StatsResponse;
    setData(json);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  return (
    <div className="max-w-6xl mx-auto p-6 flex flex-col gap-4">
      <header className="flex items-center justify-between py-2">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-2">
          <input value={username} onChange={(e) => setUsername(e.target.value)} className="border rounded px-2 py-1" />
          <Link className="text-sm underline" href="/">Markets</Link>
          <Link className="text-sm underline" href="/leaderboard">Leaderboard</Link>
        </div>
      </header>

      {!data ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded p-4">
            <div className="font-medium">Balance</div>
            <div className="text-2xl">{data.user.balance} coins</div>
            <div className="text-sm text-gray-600">Streak: {data.user.streakCurrent} (best {data.user.streakBest})</div>
          </div>
          <div className="border rounded p-4">
            <div className="font-medium">Performance</div>
            <div className="text-sm">Bets: {data.totals.bets}</div>
            <div className="text-sm">Settled: {data.totals.settled}</div>
            <div className="text-sm">Wins: {data.totals.wins}</div>
            <div className="text-sm">Losses: {data.totals.losses}</div>
            <div className="text-sm">Profit: {data.totals.profit}</div>
            <div className="text-sm">Accuracy: {(data.totals.accuracy * 100).toFixed(1)}%</div>
          </div>
          <div className="border rounded p-4">
            <div className="font-medium">Insights</div>
            {data.categories.length === 0 ? (
              <div className="text-sm text-gray-600">No settled bets yet.</div>
            ) : (
              <ul className="text-sm list-disc pl-5">
                {data.insights?.map((i) => (
                  <li key={i.category}>
                    {i.category}: {(i.accuracy * 100).toFixed(0)}% acc, avg conf {(i.avgConfidence * 100).toFixed(0)}%
                    {i.note ? ` — ${i.note}` : ""}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
