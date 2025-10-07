"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Market = {
  id: string;
  title: string;
  description?: string | null;
  currentProbability: number;
  resolvedOutcome?: "YES" | "NO" | null;
  active: boolean;
};

export default function Home() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [username, setUsername] = useState<string>("player1");
  const [loading, setLoading] = useState<boolean>(false);
  const [placing, setPlacing] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(500);
  const [outcome, setOutcome] = useState<"YES" | "NO">("YES");
  const [message, setMessage] = useState<string>("");

  const headers = useMemo(() => ({ "x-username": username }), [username]);

  async function loadMarkets() {
    setLoading(true);
    try {
      const res = await fetch("/api/markets");
      const data = await res.json();
      setMarkets(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMarkets();
  }, []);

  async function placeBet(marketId: string) {
    setPlacing(marketId);
    setMessage("");
    try {
      const res = await fetch("/api/bet", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({ marketId, outcome, amount, confidence: 0.55 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setMessage("Bet placed!");
      await loadMarkets();
    } catch (e) {
      const err = e as Error;
      setMessage(err.message || "Failed to bet");
    } finally {
      setPlacing(null);
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 flex flex-col gap-4">
      <header className="flex items-center justify-between py-2">
        <h1 className="text-2xl font-bold">Predictify</h1>
        <nav className="flex gap-4 text-sm">
          <Link href="/" className="hover:underline">Markets</Link>
          <Link href="/dashboard" className="hover:underline">Dashboard</Link>
          <Link href="/leaderboard" className="hover:underline">Leaderboard</Link>
          <Link href="/admin" className="hover:underline">Admin</Link>
        </nav>
      </header>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Predictify</h1>
        <div className="flex items-center gap-2">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="username"
            className="border rounded px-2 py-1"
          />
          <Link className="text-sm underline" href="/dashboard">Dashboard</Link>
          <Link className="text-sm underline" href="/leaderboard">Leaderboard</Link>
          <Link className="text-sm underline" href="/admin">Admin</Link>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm">Outcome</label>
        <select value={outcome} onChange={(e) => setOutcome(e.target.value as "YES" | "NO")} className="border rounded px-2 py-1">
          <option value="YES">YES</option>
          <option value="NO">NO</option>
        </select>
        <label className="text-sm">Amount</label>
        <input type="number" value={amount} onChange={(e) => setAmount(parseInt(e.target.value || "0", 10))} className="border rounded px-2 py-1 w-24" />
        {message && <span className="text-sm text-green-600">{message}</span>}
      </div>

      {loading ? (
        <div>Loading markets...</div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {markets.map((m) => (
            <div key={m.id} className="border rounded p-4 flex items-center justify-between">
              <div>
                <div className="font-medium">{m.title}</div>
                {m.description && <div className="text-sm text-gray-600">{m.description}</div>}
                <div className="text-sm mt-1">Prob YES: {(m.currentProbability * 100).toFixed(1)}%</div>
                {!m.active && (
                  <div className="text-sm text-gray-700">Resolved: {m.resolvedOutcome ?? "Pending"}</div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => placeBet(m.id)}
                  disabled={!m.active || placing === m.id}
                  className="bg-black text-white rounded px-3 py-1 disabled:bg-gray-400"
                >
                  {placing === m.id ? "Placing..." : "Bet"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
