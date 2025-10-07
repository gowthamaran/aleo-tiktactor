import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function formatOdds(odds: number): string {
  return `${(odds * 100).toFixed(1)}%`;
}

export function calculatePayout(amount: number, odds: number): number {
  return amount / odds;
}

export function calculatePotentialPayout(amount: number, odds: number): number {
  return amount / odds;
}

export function getTimeUntilResolution(resolutionDate: string): string {
  const now = new Date();
  const resolution = new Date(resolutionDate);
  const diff = resolution.getTime() - now.getTime();
  
  if (diff <= 0) return 'Resolved';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    politics: 'bg-red-100 text-red-800',
    sports: 'bg-green-100 text-green-800',
    technology: 'bg-blue-100 text-blue-800',
    economics: 'bg-yellow-100 text-yellow-800',
    entertainment: 'bg-purple-100 text-purple-800',
    science: 'bg-indigo-100 text-indigo-800',
    weather: 'bg-cyan-100 text-cyan-800',
    other: 'bg-gray-100 text-gray-800',
  };
  
  return colors[category] || colors.other;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    resolved: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800',
    paused: 'bg-yellow-100 text-yellow-800',
  };
  
  return colors[status] || colors.active;
}

export function generateMockMarkets(): any[] {
  return [
    {
      id: '1',
      title: 'Will Bitcoin reach $100,000 by end of 2024?',
      description: 'Bitcoin price prediction for end of year 2024',
      category: 'technology',
      outcome_a: 'Yes',
      outcome_b: 'No',
      current_odds_a: 0.35,
      current_odds_b: 0.65,
      total_volume: 15420.50,
      status: 'active',
      resolution_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Will the Lakers win the 2024 NBA Championship?',
      description: 'NBA Championship prediction for 2024 season',
      category: 'sports',
      outcome_a: 'Yes',
      outcome_b: 'No',
      current_odds_a: 0.12,
      current_odds_b: 0.88,
      total_volume: 8750.25,
      status: 'active',
      resolution_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
    },
    {
      id: '3',
      title: 'Will there be a recession in 2024?',
      description: 'Economic recession prediction for 2024',
      category: 'economics',
      outcome_a: 'Yes',
      outcome_b: 'No',
      current_odds_a: 0.28,
      current_odds_b: 0.72,
      total_volume: 22300.75,
      status: 'active',
      resolution_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
    },
    {
      id: '4',
      title: 'Will AI pass the Turing test by 2025?',
      description: 'Artificial Intelligence capability prediction',
      category: 'technology',
      outcome_a: 'Yes',
      outcome_b: 'No',
      current_odds_a: 0.45,
      current_odds_b: 0.55,
      total_volume: 18900.00,
      status: 'active',
      resolution_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
    },
    {
      id: '5',
      title: 'Will the next US President be under 60 years old?',
      description: '2024 US Presidential election age prediction',
      category: 'politics',
      outcome_a: 'Yes',
      outcome_b: 'No',
      current_odds_a: 0.62,
      current_odds_b: 0.38,
      total_volume: 45600.50,
      status: 'active',
      resolution_date: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
    },
  ];
}