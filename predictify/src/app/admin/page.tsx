"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Market = { id: string; title: string; active: boolean; resolvedOutcome?: "YES" | "NO" | null };

export default function Admin() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [outcomeById, setOutcomeById] = useState<Record<string, "YES" | "NO">>({});

  async function load() {
    const res = await fetch("/api/markets?includeResolved=true");
    const json = await res.json();
    setMarkets(json);
  }

  useEffect(() => {
    load();
  }, []);

  async function resolve(id: string) {
    const outcome = outcomeById[id] || "YES";
    const res = await fetch("/api/resolve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ marketId: id, outcome }),
    });
    if (res.ok) await load();
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="flex items-center justify-between py-2">
        <h1 className="text-2xl font-bold">Admin</h1>
        <nav className="flex gap-4 text-sm">
          <Link href="/" className="hover:underline">Markets</Link>
          <Link href="/dashboard" className="hover:underline">Dashboard</Link>
          <Link href="/leaderboard" className="hover:underline">Leaderboard</Link>
        </nav>
      </header>
      <div className="grid gap-3">
        {markets.map((m) => (
          <div key={m.id} className="border rounded p-4 flex items-center justify-between">
            <div>
              <div className="font-medium">{m.title}</div>
              <div className="text-sm">{m.active ? "Active" : `Resolved: ${m.resolvedOutcome ?? "-"}`}</div>
            </div>
            <div className="flex items-center gap-2">
              <select value={outcomeById[m.id] || "YES"} onChange={(e) => setOutcomeById((s) => ({ ...s, [m.id]: e.target.value as "YES" | "NO" }))} className="border rounded px-2 py-1">
                <option value="YES">YES</option>
                <option value="NO">NO</option>
              </select>
              <button onClick={() => resolve(m.id)} disabled={!m.active} className="bg-black text-white rounded px-3 py-1 disabled:bg-gray-400">Resolve</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
