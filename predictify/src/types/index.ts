// Core types for Predictify

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  fake_balance: number;
  total_bets: number;
  correct_bets: number;
  total_winnings: number;
  current_streak: number;
  longest_streak: number;
  accuracy_percentage: number;
  badges: Badge[];
  created_at: string;
  updated_at: string;
}

export interface Market {
  id: string;
  title: string;
  description: string;
  category: MarketCategory;
  outcome_a: string;
  outcome_b: string;
  current_odds_a: number; // 0-1 probability
  current_odds_b: number; // 0-1 probability
  total_volume: number;
  status: MarketStatus;
  resolution_date: string;
  resolved_outcome?: 'A' | 'B';
  created_at: string;
  updated_at: string;
}

export interface Bet {
  id: string;
  user_id: string;
  market_id: string;
  outcome: 'A' | 'B';
  amount: number;
  odds_at_bet: number;
  potential_payout: number;
  actual_payout?: number;
  is_resolved: boolean;
  is_winning?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: string;
  earned_at: string;
}

export interface LeaderboardEntry {
  user_id: string;
  name: string;
  avatar_url?: string;
  accuracy_percentage: number;
  total_winnings: number;
  current_streak: number;
  rank: number;
}

export interface MarketStats {
  market_id: string;
  total_volume: number;
  total_bets: number;
  unique_participants: number;
  average_confidence: number;
}

export type MarketCategory = 
  | 'politics'
  | 'sports'
  | 'technology'
  | 'economics'
  | 'entertainment'
  | 'science'
  | 'weather'
  | 'other';

export type MarketStatus = 
  | 'active'
  | 'resolved'
  | 'cancelled'
  | 'paused';

export interface PredictionInsight {
  id: string;
  user_id: string;
  insight_type: 'overconfidence' | 'underconfidence' | 'bias' | 'pattern';
  category: MarketCategory;
  message: string;
  suggestion: string;
  created_at: string;
}

export interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  reward_amount: number;
  requirements: string;
  participants: number;
  is_active: boolean;
}