'use client';

import React, { useState, useEffect } from 'react';
import { Market } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, calculatePayout } from '@/lib/utils';
import { X, Coins, TrendingUp, AlertCircle } from 'lucide-react';

interface BettingInterfaceProps {
  market: Market;
  onClose: () => void;
  onBetPlaced: () => void;
}

export function BettingInterface({ market, onClose, onBetPlaced }: BettingInterfaceProps) {
  const { user, profile } = useAuth();
  const [selectedOutcome, setSelectedOutcome] = useState<'A' | 'B' | null>(null);
  const [betAmount, setBetAmount] = useState(10);
  const [isPlacing, setIsPlacing] = useState(false);
  const [error, setError] = useState('');

  const maxBet = Math.min(profile?.fake_balance || 0, 1000);
  const odds = selectedOutcome === 'A' ? market.current_odds_a : market.current_odds_b;
  const potentialPayout = selectedOutcome ? calculatePayout(betAmount, odds) : 0;
  const profit = potentialPayout - betAmount;

  useEffect(() => {
    if (betAmount > maxBet) {
      setBetAmount(maxBet);
    }
  }, [maxBet]);

  const handlePlaceBet = async () => {
    if (!user || !selectedOutcome) return;

    setIsPlacing(true);
    setError('');

    try {
      const response = await fetch('/api/bets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': user.id,
        },
        body: JSON.stringify({
          marketId: market.id,
          outcome: selectedOutcome,
          amount: betAmount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to place bet');
      }

      onBetPlaced();
    } catch (err: any) {
      setError(err.message || 'Failed to place bet');
    } finally {
      setIsPlacing(false);
    }
  };

  if (!user) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Sign in to place bets</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-gray-600 mb-4">
          You need to sign in to place bets and track your predictions.
        </p>
        <div className="flex space-x-2">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Place Your Bet</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Market Info */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <h4 className="font-medium text-gray-900 mb-2">{market.title}</h4>
        <p className="text-sm text-gray-600">{market.description}</p>
      </div>

      {/* Balance */}
      <div className="flex items-center justify-between mb-4 p-3 bg-green-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <Coins className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium text-green-800">Your Balance</span>
        </div>
        <span className="text-sm font-bold text-green-900">
          {formatCurrency(profile?.fake_balance || 0)}
        </span>
      </div>

      {/* Outcome Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Choose your prediction:
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setSelectedOutcome('A')}
            className={`p-3 rounded-lg border-2 text-left transition-colors ${
              selectedOutcome === 'A'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-sm font-medium text-gray-900">
              Option A: {market.outcome_a}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {Math.round(market.current_odds_a * 100)}% chance
            </div>
          </button>
          <button
            onClick={() => setSelectedOutcome('B')}
            className={`p-3 rounded-lg border-2 text-left transition-colors ${
              selectedOutcome === 'B'
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-sm font-medium text-gray-900">
              Option B: {market.outcome_b}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {Math.round(market.current_odds_b * 100)}% chance
            </div>
          </button>
        </div>
      </div>

      {/* Bet Amount */}
      {selectedOutcome && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bet Amount:
          </label>
          <div className="space-y-3">
            <input
              type="number"
              min="1"
              max={maxBet}
              value={betAmount}
              onChange={(e) => setBetAmount(Math.max(1, Math.min(maxBet, Number(e.target.value))))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="flex space-x-2">
              {[10, 25, 50, 100].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setBetAmount(Math.min(amount, maxBet))}
                  className={`px-3 py-1 text-xs rounded-full border ${
                    betAmount === amount
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  {formatCurrency(amount)}
                </button>
              ))}
              <button
                onClick={() => setBetAmount(maxBet)}
                className={`px-3 py-1 text-xs rounded-full border ${
                  betAmount === maxBet
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 text-gray-600 hover:border-gray-400'
                }`}
              >
                Max
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payout Info */}
      {selectedOutcome && (
        <div className="bg-blue-50 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Potential Payout</span>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Bet Amount:</span>
              <span className="font-medium">{formatCurrency(betAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Potential Payout:</span>
              <span className="font-medium">{formatCurrency(potentialPayout)}</span>
            </div>
            <div className="flex justify-between border-t border-blue-200 pt-1">
              <span className="text-gray-600">Profit:</span>
              <span className="font-bold text-green-600">
                +{formatCurrency(profit)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center space-x-2 text-red-600 text-sm mb-4">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex space-x-2">
        <button
          onClick={onClose}
          className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handlePlaceBet}
          disabled={!selectedOutcome || betAmount < 1 || isPlacing}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPlacing ? 'Placing Bet...' : 'Place Bet'}
        </button>
      </div>
    </div>
  );
}