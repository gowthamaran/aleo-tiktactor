"use client";
import { useEffect, useState } from 'react';

export default function AdminPage() {
  const [markets, setMarkets] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/markets')
      .then((r) => r.json())
      .then((d) => setMarkets(d.markets))
      .catch(() => setError('Failed to load markets'));
  }, []);

  async function resolveMarket(id: string, outcome: 'YES' | 'NO') {
    const res = await fetch('/api/admin/resolve', { method: 'POST', body: JSON.stringify({ marketId: id, outcome }) });
    if (!res.ok) {
      alert('Resolve failed (login as admin?)');
      return;
    }
    setMarkets((prev) => prev.filter((m) => m.id !== id));
  }

  return (
    <main className="space-y-4">
      <h2 className="text-2xl font-semibold">Admin</h2>
      <p className="text-sm text-gray-600">Login as username "admin" to resolve markets.</p>
      {error && <div className="text-red-600">{error}</div>}
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {markets.map((m) => (
          <li key={m.id} className="border rounded p-4 bg-white shadow-sm">
            <div className="font-medium mb-2">{m.title}</div>
            <div className="flex gap-2">
              <button onClick={() => resolveMarket(m.id, 'YES')} className="px-3 py-1 rounded bg-green-600 text-white">Resolve YES</button>
              <button onClick={() => resolveMarket(m.id, 'NO')} className="px-3 py-1 rounded bg-red-600 text-white">Resolve NO</button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
