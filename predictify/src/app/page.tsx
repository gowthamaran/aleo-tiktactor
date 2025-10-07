"use client";
import { useEffect, useState } from "react";

type Market = {
  id: string;
  title: string;
  category: string;
  description: string;
  closeAt: string;
  probYesBps: number;
  probNoBps: number;
};

export default function Home() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/markets")
      .then((r) => r.json())
      .then((d) => setMarkets(d.markets))
      .catch(() => setError("Failed to load markets"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="space-y-6">
      <section className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Active Markets</h2>
        <a href="/login" className="text-sm underline">Login</a>
      </section>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {markets.map((m) => (
          <li key={m.id} className="border rounded p-4 bg-white shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{m.title}</h3>
                <p className="text-xs text-gray-500">{m.category}</p>
              </div>
              <a className="text-sm underline" href={`/market/${m.id}`}>View</a>
            </div>
            <div className="mt-3 flex gap-3 text-sm">
              <span>Yes: {(m.probYesBps / 100).toFixed(1)}%</span>
              <span>No: {(m.probNoBps / 100).toFixed(1)}%</span>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
