"use client";
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ username }) });
    if (!res.ok) {
      setError('Login failed');
    } else {
      router.push('/');
    }
    setLoading(false);
  }

  return (
    <main className="max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Login</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter a username"
          className="w-full border rounded px-3 py-2"
        />
        <button disabled={loading} className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50">
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </main>
  );
}
