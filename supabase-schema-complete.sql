-- =====================================================
-- EarnSpark / SurveyMurder Database Schema
-- Supabase SQL Schema for Account Activation, Payments, Withdrawals
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. USER PROFILES & ACTIVATION
-- =====================================================

-- User profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  phone_number TEXT,
  full_name TEXT,
  avatar_url TEXT,
  account_activated BOOLEAN DEFAULT FALSE,
  activation_date TIMESTAMP WITH TIME ZONE,
  is_platinum BOOLEAN DEFAULT FALSE,
  platinum_upgrade_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profile policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, created_at, updated_at)
  VALUES (NEW.id, NEW.email, NOW(), NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 2. ACTIVATION PAYMENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.activation_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  amount INTEGER NOT NULL DEFAULT 10,
  checkout_request_id TEXT,
  external_reference TEXT,
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  mpesa_receipt_number TEXT,
  result_code TEXT,
  result_desc TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.activation_payments ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can view own activation payments" ON public.activation_payments;
CREATE POLICY "Users can view own activation payments"
  ON public.activation_payments FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own activation payments" ON public.activation_payments;
CREATE POLICY "Users can insert own activation payments"
  ON public.activation_payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own activation payments" ON public.activation_payments;
CREATE POLICY "Users can update own activation payments"
  ON public.activation_payments FOR UPDATE
  USING (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_activation_payments_user_id 
  ON public.activation_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_activation_payments_checkout_id 
  ON public.activation_payments(checkout_request_id);
CREATE INDEX IF NOT EXISTS idx_activation_payments_status 
  ON public.activation_payments(status);

-- Function to activate account when payment completes
CREATE OR REPLACE FUNCTION public.handle_activation_payment_complete()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Update profile to activated
    UPDATE public.profiles 
    SET account_activated = TRUE, 
        activation_date = NOW(),
        updated_at = NOW()
    WHERE id = NEW.user_id AND account_activated = FALSE;
    
    NEW.completed_at := NOW();
  END IF;
  
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for activation completion
DROP TRIGGER IF EXISTS on_activation_payment_updated ON public.activation_payments;
CREATE TRIGGER on_activation_payment_updated
  BEFORE UPDATE ON public.activation_payments
  FOR EACH ROW EXECUTE FUNCTION public.handle_activation_payment_complete();

-- =====================================================
-- 3. USER EARNINGS & BALANCE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_earnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_earnings INTEGER DEFAULT 0,
  available_balance INTEGER DEFAULT 0,
  pending_balance INTEGER DEFAULT 0,
  withdrawn_total INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_earnings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own earnings" ON public.user_earnings;
CREATE POLICY "Users can view own earnings"
  ON public.user_earnings FOR SELECT
  USING (auth.uid() = user_id);

-- Trigger to create earnings record on profile creation
CREATE OR REPLACE FUNCTION public.handle_new_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_earnings (user_id, created_at, updated_at)
  VALUES (NEW.id, NOW(), NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_profile();

-- =====================================================
-- 3b. EARNING TRANSACTIONS (for detailed transaction history)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.earning_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  transaction_type TEXT NOT NULL DEFAULT 'survey', -- survey, bonus, withdrawal, adjustment
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.earning_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own earning transactions" ON public.earning_transactions;
CREATE POLICY "Users can view own earning transactions"
  ON public.earning_transactions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own earning transactions" ON public.earning_transactions;
CREATE POLICY "Users can insert own earning transactions"
  ON public.earning_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_earning_transactions_user_id 
  ON public.earning_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_earning_transactions_created_at 
  ON public.earning_transactions(created_at);

-- =====================================================
-- 4. SURVEY COMPLETIONS & TASKS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.survey_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  survey_id TEXT NOT NULL,
  survey_title TEXT,
  reward_amount INTEGER NOT NULL,
  status TEXT DEFAULT 'completed', -- completed, pending_review, rejected
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.survey_completions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own survey completions" ON public.survey_completions;
CREATE POLICY "Users can view own survey completions"
  ON public.survey_completions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own survey completions" ON public.survey_completions;
CREATE POLICY "Users can insert own survey completions"
  ON public.survey_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Index
CREATE INDEX IF NOT EXISTS idx_survey_completions_user_id 
  ON public.survey_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_survey_completions_completed_at 
  ON public.survey_completions(completed_at);

-- Function to update earnings when survey is completed
CREATE OR REPLACE FUNCTION public.handle_survey_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user earnings
  UPDATE public.user_earnings 
  SET total_earnings = total_earnings + NEW.reward_amount,
      available_balance = available_balance + NEW.reward_amount,
      updated_at = NOW()
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_survey_completed ON public.survey_completions;
CREATE TRIGGER on_survey_completed
  AFTER INSERT ON public.survey_completions
  FOR EACH ROW EXECUTE FUNCTION public.handle_survey_completion();

-- =====================================================
-- 5. WITHDRAWALS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.withdrawals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  amount INTEGER NOT NULL,
  checkout_request_id TEXT,
  external_reference TEXT,
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  mpesa_receipt_number TEXT,
  result_code TEXT,
  result_desc TEXT,
  failure_reason TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own withdrawals" ON public.withdrawals;
CREATE POLICY "Users can view own withdrawals"
  ON public.withdrawals FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own withdrawals" ON public.withdrawals;
CREATE POLICY "Users can insert own withdrawals"
  ON public.withdrawals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own withdrawals" ON public.withdrawals;
CREATE POLICY "Users can update own withdrawals"
  ON public.withdrawals FOR UPDATE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id 
  ON public.withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status 
  ON public.withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_withdrawals_checkout_id 
  ON public.withdrawals(checkout_request_id);

-- Function to handle withdrawal completion
CREATE OR REPLACE FUNCTION public.handle_withdrawal_complete()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Deduct from available balance, add to withdrawn total
    UPDATE public.user_earnings 
    SET available_balance = available_balance - NEW.amount,
        withdrawn_total = withdrawn_total + NEW.amount,
        updated_at = NOW()
    WHERE user_id = NEW.user_id;
    
    NEW.processed_at := NOW();
  END IF;
  
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_withdrawal_updated ON public.withdrawals;
CREATE TRIGGER on_withdrawal_updated
  BEFORE UPDATE ON public.withdrawals
  FOR EACH ROW EXECUTE FUNCTION public.handle_withdrawal_complete();

-- =====================================================
-- 6. DAILY SURVEY LIMITS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.daily_survey_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  survey_date DATE NOT NULL DEFAULT CURRENT_DATE,
  surveys_completed INTEGER DEFAULT 0,
  daily_limit INTEGER DEFAULT 2,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, survey_date)
);

-- Enable RLS
ALTER TABLE public.daily_survey_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own daily limits" ON public.daily_survey_limits;
CREATE POLICY "Users can view own daily limits"
  ON public.daily_survey_limits FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own daily limits" ON public.daily_survey_limits;
CREATE POLICY "Users can update own daily limits"
  ON public.daily_survey_limits FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own daily limits" ON public.daily_survey_limits;
CREATE POLICY "Users can insert own daily limits"
  ON public.daily_survey_limits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Index
CREATE INDEX IF NOT EXISTS idx_daily_limits_user_date 
  ON public.daily_survey_limits(user_id, survey_date);

-- Function to increment survey count
CREATE OR REPLACE FUNCTION public.increment_survey_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  INSERT INTO public.daily_survey_limits (user_id, survey_date, surveys_completed)
  VALUES (p_user_id, CURRENT_DATE, 1)
  ON CONFLICT (user_id, survey_date)
  DO UPDATE SET 
    surveys_completed = public.daily_survey_limits.surveys_completed + 1,
    updated_at = NOW()
  RETURNING surveys_completed INTO v_count;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. TASK PACKAGES (Premium Purchases)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.task_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  task_count INTEGER NOT NULL,
  price INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default packages
INSERT INTO public.task_packages (name, description, task_count, price) VALUES
  ('Starter Pack', 'Unlock 5 additional tasks', 5, 50),
  ('Pro Pack', 'Unlock 15 additional tasks', 15, 120),
  ('Unlimited Pack', 'Unlock unlimited tasks for 30 days', 999, 300)
ON CONFLICT DO NOTHING;

-- User task package purchases
CREATE TABLE IF NOT EXISTS public.user_task_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES public.task_packages(id),
  tasks_remaining INTEGER NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_task_packages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own task packages" ON public.user_task_packages;
CREATE POLICY "Users can view own task packages"
  ON public.user_task_packages FOR SELECT
  USING (auth.uid() = user_id);

-- =====================================================
-- 8. ADMIN FUNCTIONS
-- =====================================================

-- Function to get user stats (for admin use)
CREATE OR REPLACE FUNCTION public.get_user_stats(p_user_id UUID)
RETURNS TABLE (
  total_earnings INTEGER,
  available_balance INTEGER,
  withdrawn_total INTEGER,
  surveys_completed INTEGER,
  account_activated BOOLEAN,
  is_platinum BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ue.total_earnings,
    ue.available_balance,
    ue.withdrawn_total,
    COALESCE(
      (SELECT COUNT(*)::INTEGER 
       FROM public.survey_completions sc 
       WHERE sc.user_id = p_user_id),
      0
    ) as surveys_completed,
    p.account_activated,
    p.is_platinum
  FROM public.user_earnings ue
  JOIN public.profiles p ON p.id = ue.user_id
  WHERE ue.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 9. REALTIME SUBSCRIPTIONS SETUP
-- =====================================================

-- Enable realtime for key tables
ALTER TABLE public.activation_payments REPLICA IDENTITY FULL;
ALTER TABLE public.withdrawals REPLICA IDENTITY FULL;
ALTER TABLE public.user_earnings REPLICA IDENTITY FULL;
ALTER TABLE public.survey_completions REPLICA IDENTITY FULL;
ALTER TABLE public.earning_transactions REPLICA IDENTITY FULL;

-- Add tables to realtime publication (if not already added)
-- Note: This requires supabase_realtime extension to be enabled

-- =====================================================
-- 9. RPC FUNCTIONS (for frontend)
-- =====================================================

-- Function to get current user's balance
CREATE OR REPLACE FUNCTION public.get_current_user_balance()
RETURNS INTEGER AS $$
DECLARE
  user_uuid UUID;
  balance INTEGER;
BEGIN
  -- Get the current user ID
  user_uuid := auth.uid();
  
  IF user_uuid IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Get available balance
  SELECT COALESCE(available_balance, 0) INTO balance
  FROM public.user_earnings
  WHERE user_id = user_uuid;
  
  RETURN COALESCE(balance, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get daily survey status
CREATE OR REPLACE FUNCTION public.get_daily_survey_status(user_uuid UUID)
RETURNS TABLE (
  surveys_completed INTEGER,
  daily_limit INTEGER,
  can_complete_survey BOOLEAN,
  next_survey_available_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(
      (SELECT COUNT(*)::INTEGER 
       FROM public.survey_completions 
       WHERE user_id = user_uuid 
       AND completed_at >= CURRENT_DATE 
       AND completed_at < CURRENT_DATE + INTERVAL '1 day'),
      0
    ) as surveys_completed,
    2 as daily_limit, -- Default daily limit of 2 surveys
    CASE 
      WHEN COALESCE(
        (SELECT COUNT(*)::INTEGER 
         FROM public.survey_completions 
         WHERE user_id = user_uuid 
         AND completed_at >= CURRENT_DATE 
         AND completed_at < CURRENT_DATE + INTERVAL '1 day'),
        0
      ) < 2 THEN TRUE
      ELSE FALSE
    END as can_complete_survey,
    CURRENT_DATE + INTERVAL '1 day' as next_survey_available_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_current_user_balance() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_daily_survey_status(UUID) TO authenticated;

-- =====================================================
-- SETUP COMPLETE
-- =====================================================

-- Verify tables were created
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
