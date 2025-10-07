'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { 
  Trophy, 
  Medal, 
  Crown, 
  TrendingUp, 
  Users, 
  Zap,
  Target,
  Calendar
} from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar_url?: string;
  accuracy_percentage: number;
  total_winnings: number;
  current_streak: number;
  total_bets: number;
  badges: number;
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [timeframe, setTimeframe] = useState<'all' | 'month' | 'week'>('all');

  useEffect(() => {
    const loadLeaderboard = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock leaderboard data
      const mockLeaderboard: LeaderboardEntry[] = [
        {
          rank: 1,
          name: 'The Oracle',
          accuracy_percentage: 0.89,
          total_winnings: 15420.50,
          current_streak: 12,
          total_bets: 156,
          badges: 8
        },
        {
          rank: 2,
          name: 'Data Wizard',
          accuracy_percentage: 0.85,
          total_winnings: 12890.25,
          current_streak: 8,
          total_bets: 134,
          badges: 7
        },
        {
          rank: 3,
          name: 'Prediction Master',
          accuracy_percentage: 0.82,
          total_winnings: 11200.75,
          current_streak: 5,
          total_bets: 98,
          badges: 6
        },
        {
          rank: 4,
          name: 'Market Analyst',
          accuracy_percentage: 0.78,
          total_winnings: 9870.00,
          current_streak: 3,
          total_bets: 87,
          badges: 5
        },
        {
          rank: 5,
          name: 'Forecast Pro',
          accuracy_percentage: 0.76,
          total_winnings: 8750.50,
          current_streak: 7,
          total_bets: 76,
          badges: 4
        },
        {
          rank: 6,
          name: 'Trend Tracker',
          accuracy_percentage: 0.74,
          total_winnings: 7890.25,
          current_streak: 2,
          total_bets: 65,
          badges: 3
        },
        {
          rank: 7,
          name: 'Pattern Finder',
          accuracy_percentage: 0.72,
          total_winnings: 7120.75,
          current_streak: 4,
          total_bets: 58,
          badges: 3
        },
        {
          rank: 8,
          name: 'Future Seer',
          accuracy_percentage: 0.70,
          total_winnings: 6540.00,
          current_streak: 1,
          total_bets: 52,
          badges: 2
        },
        {
          rank: 9,
          name: 'Crystal Ball',
          accuracy_percentage: 0.68,
          total_winnings: 5980.50,
          current_streak: 6,
          total_bets: 47,
          badges: 2
        },
        {
          rank: 10,
          name: 'Prediction Novice',
          accuracy_percentage: 0.65,
          total_winnings: 5420.25,
          current_streak: 0,
          total_bets: 41,
          badges: 1
        }
      ];
      
      setLeaderboard(mockLeaderboard);
      setLoading(false);
    };

    loadLeaderboard();
  }, [timeframe]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="text-sm font-bold text-gray-500">#{rank}</span>;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200';
    if (rank === 2) return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200';
    if (rank === 3) return 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200';
    return 'bg-white border-gray-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center space-x-4">
                    <div className="h-8 w-8 bg-gray-200 rounded"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Leaderboard
          </h1>
          <p className="text-gray-600">
            See how you stack up against other predictors.
          </p>
        </div>

        {/* Timeframe Filter */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Top Predictors</h3>
            <div className="flex space-x-2">
              {[
                { key: 'all', label: 'All Time' },
                { key: 'month', label: 'This Month' },
                { key: 'week', label: 'This Week' }
              ].map((option) => (
                <button
                  key={option.key}
                  onClick={() => setTimeframe(option.key as any)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    timeframe === option.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Players</p>
                <p className="text-2xl font-bold text-gray-900">
                  {leaderboard.length.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Top Accuracy</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPercentage(leaderboard[0]?.accuracy_percentage || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Best Streak</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.max(...leaderboard.map(entry => entry.current_streak))}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Rankings</h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {leaderboard.map((entry, index) => (
              <div 
                key={entry.rank} 
                className={`p-6 ${getRankColor(entry.rank)} ${
                  entry.rank <= 3 ? 'border-l-4' : ''
                }`}
              >
                <div className="flex items-center space-x-4">
                  {/* Rank */}
                  <div className="flex-shrink-0 w-8 flex items-center justify-center">
                    {getRankIcon(entry.rank)}
                  </div>

                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {entry.name.charAt(0)}
                    </div>
                  </div>

                  {/* Name and Stats */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {entry.name}
                      </p>
                      {entry.rank <= 3 && (
                        <Trophy className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                    <div className="flex items-center space-x-4 mt-1">
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Target className="w-3 h-3" />
                        <span>{formatPercentage(entry.accuracy_percentage)} accuracy</span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Zap className="w-3 h-3" />
                        <span>{entry.current_streak} streak</span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>{entry.total_bets} bets</span>
                      </div>
                    </div>
                  </div>

                  {/* Winnings */}
                  <div className="flex-shrink-0 text-right">
                    <p className="text-sm font-semibold text-green-600">
                      {formatCurrency(entry.total_winnings)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {entry.badges} badges
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Your Position (if logged in) */}
        {user && (
          <div className="mt-8 bg-blue-50 rounded-lg border border-blue-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Trophy className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-900">Your Position</h3>
            </div>
            <p className="text-blue-700">
              You're currently ranked #15 out of {leaderboard.length} players. 
              Keep making accurate predictions to climb the leaderboard!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}