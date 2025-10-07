'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Market } from '@/types';
import { generateMockMarkets } from '@/lib/utils';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

export default function AdminPage() {
  const { user } = useAuth();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState<string | null>(null);

  useEffect(() => {
    const loadMarkets = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockMarkets = generateMockMarkets();
      setMarkets(mockMarkets);
      setLoading(false);
    };

    loadMarkets();
  }, []);

  const handleResolveMarket = async (marketId: string, outcome: 'A' | 'B') => {
    setResolving(marketId);
    
    try {
      const response = await fetch('/api/markets/resolve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          marketId,
          resolvedOutcome: outcome,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resolve market');
      }

      // Update local state
      setMarkets(prev => prev.map(market => 
        market.id === marketId 
          ? { ...market, status: 'resolved', resolved_outcome: outcome }
          : market
      ));

    } catch (error: any) {
      console.error('Error resolving market:', error);
      alert(error.message || 'Failed to resolve market');
    } finally {
      setResolving(null);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-600">
              You need to be signed in to access the admin panel.
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
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-32"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const activeMarkets = markets.filter(m => m.status === 'active');
  const resolvedMarkets = markets.filter(m => m.status === 'resolved');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Panel
          </h1>
          <p className="text-gray-600">
            Manage markets and resolve predictions.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Markets</p>
                <p className="text-2xl font-bold text-gray-900">
                  {activeMarkets.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Resolved Markets</p>
                <p className="text-2xl font-bold text-gray-900">
                  {resolvedMarkets.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Markets</p>
                <p className="text-2xl font-bold text-gray-900">
                  {markets.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Active Markets */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Active Markets</h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {activeMarkets.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No active markets
              </div>
            ) : (
              activeMarkets.map((market) => (
                <div key={market.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        {market.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {market.description}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Option A: {market.outcome_a}</span>
                        <span>Option B: {market.outcome_b}</span>
                        <span>Volume: ${market.total_volume.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleResolveMarket(market.id, 'A')}
                        disabled={resolving === market.id}
                        className="flex items-center space-x-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Resolve A</span>
                      </button>
                      <button
                        onClick={() => handleResolveMarket(market.id, 'B')}
                        disabled={resolving === market.id}
                        className="flex items-center space-x-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Resolve B</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Resolved Markets */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Resolved Markets</h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {resolvedMarkets.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No resolved markets
              </div>
            ) : (
              resolvedMarkets.map((market) => (
                <div key={market.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        {market.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {market.description}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Option A: {market.outcome_a}</span>
                        <span>Option B: {market.outcome_b}</span>
                        <span>Volume: ${market.total_volume.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        market.resolved_outcome === 'A'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        Resolved: Option {market.resolved_outcome}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}