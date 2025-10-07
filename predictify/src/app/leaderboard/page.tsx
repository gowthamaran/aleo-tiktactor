"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Leaderboard = { topProfit: { username: string; profit: number }[]; topStreaks: { username: string; streakBest: number }[] };

export default function Leaderboard() {
  const [data, setData] = useState<Leaderboard | null>(null);

  async function load() {
    const res = await fetch("/api/leaderboard");
    const json = await res.json();
    setData(json);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 flex flex-col gap-6">
      <header className="flex items-center justify-between py-2">
        <h1 className="text-2xl font-bold">Leaderboard</h1>
        <nav className="flex gap-4 text-sm">
          <Link href="/" className="hover:underline">Markets</Link>
          <Link href="/dashboard" className="hover:underline">Dashboard</Link>
        </nav>
      </header>

      {!data ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="font-semibold mb-2">Top Profit</h2>
            <div className="border rounded divide-y">
              {data.topProfit.map((p, i) => (
                <div key={p.username} className="flex items-center justify-between p-3">
                  <div>
                    <span className="text-sm text-gray-500 mr-2">#{i + 1}</span>
                    <span className="font-medium">{p.username}</span>
                  </div>
                  <div>{p.profit}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="font-semibold mb-2">Top Streaks</h2>
            <div className="border rounded divide-y">
              {data.topStreaks.map((p, i) => (
                <div key={p.username} className="flex items-center justify-between p-3">
                  <div>
                    <span className="text-sm text-gray-500 mr-2">#{i + 1}</span>
                    <span className="font-medium">{p.username}</span>
                  </div>
                  <div>{p.streakBest}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
