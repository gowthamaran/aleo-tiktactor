'use client';

import React, { useState } from 'react';
import { Market } from '@/types';
import { 
  formatCurrency, 
  formatOdds, 
  getTimeUntilResolution, 
  getCategoryColor,
  getStatusColor 
} from '@/lib/utils';
import { TrendingUp, Clock, Users, Target } from 'lucide-react';
import { BettingInterface } from './BettingInterface';

interface MarketCardProps {
  market: Market;
  onBetPlaced?: () => void;
}

export function MarketCard({ market, onBetPlaced }: MarketCardProps) {
  const [showBetting, setShowBetting] = useState(false);

  const handleBetPlaced = () => {
    setShowBetting(false);
    onBetPlaced?.();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {market.title}
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            {market.description}
          </p>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(market.category)}`}>
            {market.category}
          </span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(market.status)}`}>
            {market.status}
          </span>
        </div>
      </div>

      {/* Outcomes */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Option A</span>
            <span className="text-sm font-bold text-gray-900">
              {formatOdds(market.current_odds_a)}
            </span>
          </div>
          <div className="text-sm text-gray-600 mb-2">
            {market.outcome_a}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${market.current_odds_a * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Option B</span>
            <span className="text-sm font-bold text-gray-900">
              {formatOdds(market.current_odds_b)}
            </span>
          </div>
          <div className="text-sm text-gray-600 mb-2">
            {market.outcome_b}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${market.current_odds_b * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Market Stats */}
      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>{market.total_volume.toLocaleString()} volume</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{getTimeUntilResolution(market.resolution_date)}</span>
          </div>
        </div>
      </div>

      {/* Betting Button */}
      {market.status === 'active' && (
        <div className="flex space-x-2">
          <button
            onClick={() => setShowBetting(true)}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Target className="w-4 h-4" />
            <span>Place Bet</span>
          </button>
        </div>
      )}

      {/* Resolved State */}
      {market.status === 'resolved' && market.resolved_outcome && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              Resolved: Option {market.resolved_outcome} won
            </span>
          </div>
        </div>
      )}

      {/* Betting Interface Modal */}
      {showBetting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <BettingInterface
              market={market}
              onClose={() => setShowBetting(false)}
              onBetPlaced={handleBetPlaced}
            />
          </div>
        </div>
      )}
    </div>
  );
}