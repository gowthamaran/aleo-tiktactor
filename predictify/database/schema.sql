-- Predictify Database Schema
-- This schema is designed for Supabase/PostgreSQL

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (managed by Supabase Auth)
-- We'll create a profiles table that extends the auth.users

-- User profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  fake_balance DECIMAL(10,2) DEFAULT 1000.00,
  total_bets INTEGER DEFAULT 0,
  correct_bets INTEGER DEFAULT 0,
  total_winnings DECIMAL(10,2) DEFAULT 0.00,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  accuracy_percentage DECIMAL(5,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Markets table
CREATE TABLE markets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL CHECK (category IN ('politics', 'sports', 'technology', 'economics', 'entertainment', 'science', 'weather', 'other')),
  outcome_a VARCHAR(255) NOT NULL,
  outcome_b VARCHAR(255) NOT NULL,
  current_odds_a DECIMAL(3,2) NOT NULL CHECK (current_odds_a >= 0 AND current_odds_a <= 1),
  current_odds_b DECIMAL(3,2) NOT NULL CHECK (current_odds_b >= 0 AND current_odds_b <= 1),
  total_volume DECIMAL(12,2) DEFAULT 0.00,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'cancelled', 'paused')),
  resolution_date TIMESTAMP WITH TIME ZONE NOT NULL,
  resolved_outcome CHAR(1) CHECK (resolved_outcome IN ('A', 'B')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bets table
CREATE TABLE bets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  market_id UUID REFERENCES markets(id) ON DELETE CASCADE NOT NULL,
  outcome CHAR(1) NOT NULL CHECK (outcome IN ('A', 'B')),
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  odds_at_bet DECIMAL(3,2) NOT NULL CHECK (odds_at_bet >= 0 AND odds_at_bet <= 1),
  potential_payout DECIMAL(10,2) NOT NULL,
  actual_payout DECIMAL(10,2),
  is_resolved BOOLEAN DEFAULT FALSE,
  is_winning BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Badges table
CREATE TABLE badges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(50) NOT NULL,
  criteria TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User badges junction table
CREATE TABLE user_badges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Prediction insights table
CREATE TABLE prediction_insights (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  insight_type VARCHAR(50) NOT NULL CHECK (insight_type IN ('overconfidence', 'underconfidence', 'bias', 'pattern')),
  category VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  suggestion TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Weekly challenges table
CREATE TABLE weekly_challenges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  reward_amount DECIMAL(10,2) NOT NULL,
  requirements TEXT NOT NULL,
  participants INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_bets_user_id ON bets(user_id);
CREATE INDEX idx_bets_market_id ON bets(market_id);
CREATE INDEX idx_bets_created_at ON bets(created_at);
CREATE INDEX idx_markets_status ON markets(status);
CREATE INDEX idx_markets_category ON markets(category);
CREATE INDEX idx_markets_resolution_date ON markets(resolution_date);
CREATE INDEX idx_profiles_accuracy ON profiles(accuracy_percentage DESC);
CREATE INDEX idx_profiles_total_winnings ON profiles(total_winnings DESC);

-- Functions and triggers for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_markets_updated_at BEFORE UPDATE ON markets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bets_updated_at BEFORE UPDATE ON bets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate user accuracy
CREATE OR REPLACE FUNCTION calculate_user_accuracy(user_uuid UUID)
RETURNS DECIMAL(5,2) AS $$
DECLARE
  total_bets_count INTEGER;
  correct_bets_count INTEGER;
  accuracy DECIMAL(5,2);
BEGIN
  SELECT COUNT(*), COUNT(*) FILTER (WHERE is_winning = TRUE)
  INTO total_bets_count, correct_bets_count
  FROM bets
  WHERE user_id = user_uuid AND is_resolved = TRUE;
  
  IF total_bets_count = 0 THEN
    RETURN 0.00;
  END IF;
  
  accuracy := (correct_bets_count::DECIMAL / total_bets_count::DECIMAL) * 100;
  RETURN ROUND(accuracy, 2);
END;
$$ LANGUAGE plpgsql;

-- Function to update user stats after bet resolution
CREATE OR REPLACE FUNCTION update_user_stats_after_bet_resolution()
RETURNS TRIGGER AS $$
DECLARE
  user_uuid UUID;
  is_winning_bet BOOLEAN;
  payout_amount DECIMAL(10,2);
BEGIN
  -- Only process if bet was just resolved
  IF OLD.is_resolved = FALSE AND NEW.is_resolved = TRUE THEN
    user_uuid := NEW.user_id;
    is_winning_bet := NEW.is_winning;
    payout_amount := COALESCE(NEW.actual_payout, 0);
    
    -- Update user profile
    UPDATE profiles
    SET 
      total_bets = total_bets + 1,
      correct_bets = correct_bets + CASE WHEN is_winning_bet THEN 1 ELSE 0 END,
      total_winnings = total_winnings + payout_amount,
      fake_balance = fake_balance + payout_amount,
      current_streak = CASE 
        WHEN is_winning_bet THEN current_streak + 1 
        ELSE 0 
      END,
      longest_streak = GREATEST(longest_streak, 
        CASE WHEN is_winning_bet THEN current_streak + 1 ELSE 0 END
      ),
      accuracy_percentage = calculate_user_accuracy(user_uuid),
      updated_at = NOW()
    WHERE id = user_uuid;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update user stats when bet is resolved
CREATE TRIGGER update_user_stats_on_bet_resolution
  AFTER UPDATE ON bets
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats_after_bet_resolution();

-- Insert some default badges
INSERT INTO badges (name, description, icon, criteria) VALUES
('First Bet', 'Placed your first prediction', '🎯', 'Place your first bet'),
('The Oracle', 'Achieve 90%+ accuracy with 10+ bets', '🔮', '90% accuracy with 10+ resolved bets'),
('Data Wizard', 'Win 5 bets in a row', '🧙', '5 consecutive winning bets'),
('High Roller', 'Place a bet of 100+ coins', '💰', 'Place a single bet of 100+ coins'),
('Diversified', 'Bet on 5 different categories', '🌈', 'Bet on 5 different market categories'),
('Consistent', 'Place 50+ total bets', '📊', 'Place 50+ total bets'),
('Streak Master', 'Achieve a 10+ win streak', '🔥', 'Win 10+ bets in a row'),
('Market Maker', 'Bet on 20+ different markets', '🏪', 'Bet on 20+ different markets');

-- Row Level Security (RLS) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE prediction_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view their own bets" ON bets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own bets" ON bets FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own badges" ON user_badges FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own insights" ON prediction_insights FOR SELECT USING (auth.uid() = user_id);

-- Public read access for markets and leaderboard data
CREATE POLICY "Anyone can view markets" ON markets FOR SELECT USING (true);
CREATE POLICY "Anyone can view badges" ON badges FOR SELECT USING (true);
CREATE POLICY "Anyone can view weekly challenges" ON weekly_challenges FOR SELECT USING (true);