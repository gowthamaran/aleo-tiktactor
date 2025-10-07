'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { 
  Trophy, 
  TrendingUp, 
  Target, 
  Coins, 
  BarChart3, 
  Award,
  Zap,
  Calendar,
  Activity
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function StatsPage() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [mockData, setMockData] = useState({
    accuracyHistory: [],
    categoryBreakdown: [],
    recentBets: [],
    badges: []
  });

  useEffect(() => {
    // Simulate loading user stats
    const loadStats = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data for demonstration
      setMockData({
        accuracyHistory: [
          { month: 'Jan', accuracy: 65 },
          { month: 'Feb', accuracy: 72 },
          { month: 'Mar', accuracy: 68 },
          { month: 'Apr', accuracy: 75 },
          { month: 'May', accuracy: 80 },
          { month: 'Jun', accuracy: 78 }
        ],
        categoryBreakdown: [
          { name: 'Technology', value: 35, color: '#3B82F6' },
          { name: 'Sports', value: 25, color: '#10B981' },
          { name: 'Politics', value: 20, color: '#EF4444' },
          { name: 'Economics', value: 15, color: '#F59E0B' },
          { name: 'Other', value: 5, color: '#8B5CF6' }
        ],
        recentBets: [
          { id: 1, market: 'Bitcoin reaches $100k', outcome: 'Yes', amount: 50, result: 'win', payout: 142.86 },
          { id: 2, market: 'Lakers win NBA Championship', outcome: 'No', amount: 25, result: 'win', payout: 113.64 },
          { id: 3, market: 'Recession in 2024', outcome: 'No', amount: 100, result: 'pending', payout: 0 },
          { id: 4, market: 'AI passes Turing test', outcome: 'Yes', amount: 75, result: 'pending', payout: 0 },
          { id: 5, market: 'President under 60', outcome: 'Yes', amount: 30, result: 'win', payout: 48.39 }
        ],
        badges: [
          { name: 'First Bet', description: 'Placed your first prediction', icon: '🎯', earned: true },
          { name: 'The Oracle', description: 'Achieve 90%+ accuracy with 10+ bets', icon: '🔮', earned: false },
          { name: 'Data Wizard', description: 'Win 5 bets in a row', icon: '🧙', earned: true },
          { name: 'High Roller', description: 'Place a bet of 100+ coins', icon: '💰', earned: true },
          { name: 'Consistent', description: 'Place 50+ total bets', icon: '📊', earned: false }
        ]
      });
      setLoading(false);
    };

    loadStats();
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Sign in to view your stats</h3>
            <p className="text-gray-600">
              Create an account or sign in to track your prediction performance.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalBets = mockData.recentBets.length;
  const winningBets = mockData.recentBets.filter(bet => bet.result === 'win').length;
  const pendingBets = mockData.recentBets.filter(bet => bet.result === 'pending').length;
  const totalWinnings = mockData.recentBets
    .filter(bet => bet.result === 'win')
    .reduce((sum, bet) => sum + bet.payout, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Your Prediction Stats
          </h1>
          <p className="text-gray-600">
            Track your performance and improve your forecasting skills.
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Accuracy</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPercentage(profile?.accuracy_percentage || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Coins className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Winnings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(profile?.total_winnings || 0)}
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
                <p className="text-sm font-medium text-gray-600">Current Streak</p>
                <p className="text-2xl font-bold text-gray-900">
                  {profile?.current_streak || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Bets</p>
                <p className="text-2xl font-bold text-gray-900">
                  {profile?.total_bets || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Accuracy Trend */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Accuracy Over Time</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockData.accuracyHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="accuracy" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bets by Category</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockData.categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {mockData.categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {mockData.categoryBreakdown.map((category, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-sm text-gray-600">{category.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Bets and Badges */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Bets */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Bets</h3>
            <div className="space-y-3">
              {mockData.recentBets.map((bet) => (
                <div key={bet.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{bet.market}</p>
                    <p className="text-xs text-gray-500">
                      {bet.outcome} • {formatCurrency(bet.amount)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      bet.result === 'win' 
                        ? 'bg-green-100 text-green-800'
                        : bet.result === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {bet.result === 'win' ? `+${formatCurrency(bet.payout)}` : 
                       bet.result === 'pending' ? 'Pending' : 'Lost'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Badges */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Badges</h3>
            <div className="grid grid-cols-1 gap-3">
              {mockData.badges.map((badge, index) => (
                <div key={index} className={`flex items-center p-3 rounded-lg ${
                  badge.earned ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'
                }`}>
                  <div className="text-2xl mr-3">{badge.icon}</div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${
                      badge.earned ? 'text-yellow-800' : 'text-gray-500'
                    }`}>
                      {badge.name}
                    </p>
                    <p className={`text-xs ${
                      badge.earned ? 'text-yellow-600' : 'text-gray-400'
                    }`}>
                      {badge.description}
                    </p>
                  </div>
                  {badge.earned && (
                    <Award className="w-4 h-4 text-yellow-600" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}