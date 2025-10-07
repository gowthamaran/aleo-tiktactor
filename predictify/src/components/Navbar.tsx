'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Trophy, 
  TrendingUp, 
  User, 
  LogIn, 
  LogOut, 
  Menu, 
  X,
  Coins,
  BarChart3
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export function Navbar() {
  const { user, profile, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Predictify</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Markets
            </Link>
            <Link 
              href="/leaderboard" 
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1"
            >
              <Trophy className="w-4 h-4" />
              <span>Leaderboard</span>
            </Link>
            <Link 
              href="/stats" 
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Stats</span>
            </Link>
            <Link 
              href="/admin" 
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Admin
            </Link>
          </div>

          {/* User Section */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                {/* Balance */}
                <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg">
                  <Coins className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    {formatCurrency(profile?.fake_balance || 0)}
                  </span>
                </div>

                {/* User Menu */}
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {user.email}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="text-gray-500 hover:text-red-600 transition-colors"
                    title="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/auth/signin"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600 p-2"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-4">
              <Link 
                href="/" 
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Markets
              </Link>
              <Link 
                href="/leaderboard" 
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <Trophy className="w-4 h-4" />
                <span>Leaderboard</span>
              </Link>
              <Link 
                href="/stats" 
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Stats</span>
              </Link>
              <Link 
                href="/admin" 
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Admin
              </Link>

              {user ? (
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Coins className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Balance: {formatCurrency(profile?.fake_balance || 0)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 mb-4">
                    <User className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">{user.email}</span>
                  </div>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <Link
                    href="/auth/signin"
                    className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="block bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}