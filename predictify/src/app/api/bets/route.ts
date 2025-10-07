import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { calculatePayout } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const { marketId, outcome, amount } = await request.json();

    if (!marketId || !outcome || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Bet amount must be positive' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Get the market
    const { data: market, error: marketError } = await supabase
      .from('markets')
      .select('*')
      .eq('id', marketId)
      .single();

    if (marketError || !market) {
      return NextResponse.json(
        { error: 'Market not found' },
        { status: 404 }
      );
    }

    if (market.status !== 'active') {
      return NextResponse.json(
        { error: 'Market is not active' },
        { status: 400 }
      );
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', request.headers.get('user-id') || '')
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    if (profile.fake_balance < amount) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Calculate payout
    const odds = outcome === 'A' ? market.current_odds_a : market.current_odds_b;
    const potentialPayout = calculatePayout(amount, odds);

    // Place the bet
    const { data: bet, error: betError } = await supabase
      .from('bets')
      .insert({
        user_id: profile.id,
        market_id: marketId,
        outcome,
        amount,
        odds_at_bet: odds,
        potential_payout: potentialPayout,
      })
      .select()
      .single();

    if (betError) {
      return NextResponse.json(
        { error: 'Failed to place bet' },
        { status: 500 }
      );
    }

    // Update user balance
    const { error: balanceError } = await supabase
      .from('profiles')
      .update({
        fake_balance: profile.fake_balance - amount,
        total_bets: profile.total_bets + 1,
      })
      .eq('id', profile.id);

    if (balanceError) {
      return NextResponse.json(
        { error: 'Failed to update balance' },
        { status: 500 }
      );
    }

    // Update market volume
    const { error: volumeError } = await supabase
      .from('markets')
      .update({
        total_volume: market.total_volume + amount,
      })
      .eq('id', marketId);

    if (volumeError) {
      console.error('Failed to update market volume:', volumeError);
    }

    return NextResponse.json({
      success: true,
      bet,
      newBalance: profile.fake_balance - amount,
    });

  } catch (error) {
    console.error('Error placing bet:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const userId = request.headers.get('user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const { data: bets, error } = await supabase
      .from('bets')
      .select(`
        *,
        markets (
          title,
          status,
          resolved_outcome
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch bets' },
        { status: 500 }
      );
    }

    return NextResponse.json({ bets });

  } catch (error) {
    console.error('Error fetching bets:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}