import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Predictify",
  description: "Prediction training simulator",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <div className="max-w-5xl mx-auto p-4">
          <header className="flex items-center justify-between py-4">
            <h1 className="text-xl font-bold">Predictify</h1>
            <nav className="flex items-center gap-3 text-sm">
              <a className="hover:underline" href="/">Markets</a>
              <a className="hover:underline" href="/dashboard">Dashboard</a>
              <a className="hover:underline" href="/leaderboard">Leaderboard</a>
              <a className="hover:underline" href="/admin">Admin</a>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
