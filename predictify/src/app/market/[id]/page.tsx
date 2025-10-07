"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function MarketDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [market, setMarket] = useState<any>(null);
  const [amount, setAmount] = useState(100);
  const [outcome, setOutcome] = useState<'YES' | 'NO'>('YES');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const id = params?.id as string;

  useEffect(() => {
    if (!id) return;
    fetch(`/api/markets/${id}`)
      .then((r) => r.json())
      .then((d) => setMarket(d.market))
      .catch(() => setError('Failed to load market'))
      .finally(() => setLoading(false));
  }, [id]);

  async function placeBet() {
    setError(null);
    const res = await fetch('/api/bets', { method: 'POST', body: JSON.stringify({ marketId: id, outcome, amount: Number(amount) }) });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error || 'Bet failed. Login?');
      if (res.status === 401) router.push('/login');
      return;
    }
    router.refresh();
    alert('Bet placed!');
  }

  if (loading) return <main>Loading...</main>;
  if (error) return <main className="text-red-600">{error}</main>;
  if (!market) return <main>Not found</main>;

  return (
    <main className="space-y-6">
      <h2 className="text-xl font-semibold">{market.title}</h2>
      <p className="text-sm text-gray-600">{market.description}</p>
      <div className="flex gap-4 text-sm">
        <span>Yes: {(market.probYesBps / 100).toFixed(1)}%</span>
        <span>No: {(market.probNoBps / 100).toFixed(1)}%</span>
      </div>

      <div className="border rounded p-4 bg-white max-w-md">
        <div className="mb-3 text-sm font-medium">Place a bet</div>
        <div className="flex gap-2 mb-2">
          <button onClick={() => setOutcome('YES')} className={`px-3 py-1 rounded border ${outcome === 'YES' ? 'bg-green-100 border-green-400' : ''}`}>Yes</button>
          <button onClick={() => setOutcome('NO')} className={`px-3 py-1 rounded border ${outcome === 'NO' ? 'bg-red-100 border-red-400' : ''}`}>No</button>
        </div>
        <input type="number" min={1} value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full border rounded px-3 py-2 mb-3" />
        <button onClick={placeBet} className="px-4 py-2 rounded bg-blue-600 text-white">Place Bet</button>
        {error && <div className="mt-2 text-red-600 text-sm">{error}</div>}
      </div>
    </main>
  );
}
