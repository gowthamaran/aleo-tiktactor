import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { marketId, resolvedOutcome } = await request.json();

    if (!marketId || !resolvedOutcome) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['A', 'B'].includes(resolvedOutcome)) {
      return NextResponse.json(
        { error: 'Invalid resolved outcome' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Update market status
    const { error: marketError } = await supabase
      .from('markets')
      .update({
        status: 'resolved',
        resolved_outcome: resolvedOutcome,
        updated_at: new Date().toISOString(),
      })
      .eq('id', marketId);

    if (marketError) {
      return NextResponse.json(
        { error: 'Failed to resolve market' },
        { status: 500 }
      );
    }

    // Get all bets for this market
    const { data: bets, error: betsError } = await supabase
      .from('bets')
      .select('*')
      .eq('market_id', marketId)
      .eq('is_resolved', false);

    if (betsError) {
      return NextResponse.json(
        { error: 'Failed to fetch bets' },
        { status: 500 }
      );
    }

    // Resolve all bets
    for (const bet of bets || []) {
      const isWinning = bet.outcome === resolvedOutcome;
      const actualPayout = isWinning ? bet.potential_payout : 0;

      // Update bet
      const { error: betUpdateError } = await supabase
        .from('bets')
        .update({
          is_resolved: true,
          is_winning: isWinning,
          actual_payout: actualPayout,
          updated_at: new Date().toISOString(),
        })
        .eq('id', bet.id);

      if (betUpdateError) {
        console.error('Failed to update bet:', betUpdateError);
        continue;
      }

      // Update user balance if winning
      if (isWinning) {
        const { error: balanceError } = await supabase
          .from('profiles')
          .update({
            fake_balance: supabase.raw('fake_balance + ?', [actualPayout]),
            total_winnings: supabase.raw('total_winnings + ?', [actualPayout]),
            correct_bets: supabase.raw('correct_bets + 1'),
            current_streak: supabase.raw('current_streak + 1'),
            longest_streak: supabase.raw('GREATEST(longest_streak, current_streak + 1)'),
          })
          .eq('id', bet.user_id);

        if (balanceError) {
          console.error('Failed to update user balance:', balanceError);
        }
      } else {
        // Reset streak for losing bet
        const { error: streakError } = await supabase
          .from('profiles')
          .update({
            current_streak: 0,
          })
          .eq('id', bet.user_id);

        if (streakError) {
          console.error('Failed to reset streak:', streakError);
        }
      }
    }

    return NextResponse.json({
      success: true,
      resolvedBets: bets?.length || 0,
    });

  } catch (error) {
    console.error('Error resolving market:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}