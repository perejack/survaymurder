-- =====================================================
-- INCREMENTAL DATABASE UPDATE SCRIPT
-- Run this ONLY after running database-inspection.sql
-- This adds missing components without dropping existing data
-- =====================================================

-- 1. Add missing columns to user_profiles if they don't exist
DO $$ 
BEGIN
    -- Add account_activated column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles' 
        AND column_name = 'account_activated'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN account_activated BOOLEAN DEFAULT FALSE;
    END IF;

    -- Add is_platinum column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles' 
        AND column_name = 'is_platinum'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN is_platinum BOOLEAN DEFAULT FALSE;
    END IF;

    -- Add activation_date column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles' 
        AND column_name = 'activation_date'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN activation_date TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Add platinum_upgrade_date column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles' 
        AND column_name = 'platinum_upgrade_date'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN platinum_upgrade_date TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- 2. Create daily_survey_completions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.daily_survey_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  completion_date DATE DEFAULT CURRENT_DATE,
  surveys_completed INTEGER DEFAULT 0,
  daily_limit INTEGER DEFAULT 2,
  task_packages_purchased INTEGER DEFAULT 0,
  additional_surveys_unlocked INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, completion_date)
);

-- 3. Enable RLS on daily_survey_completions if not already enabled
ALTER TABLE public.daily_survey_completions ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for daily_survey_completions if they don't exist
DO $$
BEGIN
    -- Check and create SELECT policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'daily_survey_completions' 
        AND policyname = 'Users can view own completions'
    ) THEN
        CREATE POLICY "Users can view own completions" ON public.daily_survey_completions
          FOR SELECT USING (auth.uid() = user_id);
    END IF;

    -- Check and create INSERT policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'daily_survey_completions' 
        AND policyname = 'Users can insert own completions'
    ) THEN
        CREATE POLICY "Users can insert own completions" ON public.daily_survey_completions
          FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Check and create UPDATE policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'daily_survey_completions' 
        AND policyname = 'Users can update own completions'
    ) THEN
        CREATE POLICY "Users can update own completions" ON public.daily_survey_completions
          FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;

-- 5. Enable RLS on earning_transactions if not already enabled
ALTER TABLE public.earning_transactions ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for earning_transactions if they don't exist
DO $$
BEGIN
    -- Check and create SELECT policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'earning_transactions' 
        AND policyname = 'Users can view own transactions'
    ) THEN
        CREATE POLICY "Users can view own transactions" ON public.earning_transactions
          FOR SELECT USING (auth.uid() = user_id);
    END IF;

    -- Check and create INSERT policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'earning_transactions' 
        AND policyname = 'Users can insert own transactions'
    ) THEN
        CREATE POLICY "Users can insert own transactions" ON public.earning_transactions
          FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- 7. Create or replace core functions
CREATE OR REPLACE FUNCTION public.get_daily_survey_status(user_uuid UUID)
RETURNS TABLE (
  surveys_completed INTEGER,
  daily_limit INTEGER,
  can_complete_survey BOOLEAN,
  is_account_activated BOOLEAN,
  is_platinum_user BOOLEAN
) AS $$
BEGIN
  -- Ensure daily completion record exists
  INSERT INTO public.daily_survey_completions (user_id, completion_date, surveys_completed, daily_limit)
  VALUES (user_uuid, CURRENT_DATE, 0, 2)
  ON CONFLICT (user_id, completion_date) 
  DO NOTHING;
  
  -- Return comprehensive status
  RETURN QUERY
  SELECT 
    dsc.surveys_completed,
    dsc.daily_limit + dsc.additional_surveys_unlocked as effective_limit,
    (dsc.surveys_completed < (dsc.daily_limit + dsc.additional_surveys_unlocked)) as can_complete_survey,
    COALESCE(up.account_activated, false) as is_account_activated,
    COALESCE(up.is_platinum, false) as is_platinum_user
  FROM public.daily_survey_completions dsc
  LEFT JOIN public.user_profiles up ON up.id = user_uuid
  WHERE dsc.user_id = user_uuid AND dsc.completion_date = CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.complete_survey(user_uuid UUID, survey_category TEXT DEFAULT 'general')
RETURNS TABLE (
  success BOOLEAN,
  surveys_completed INTEGER,
  daily_limit INTEGER,
  show_task_limit_modal BOOLEAN,
  message TEXT
) AS $$
DECLARE
  current_count INTEGER;
  effective_limit INTEGER;
  is_activated BOOLEAN;
  is_platinum BOOLEAN;
BEGIN
  -- Get current status
  SELECT 
    dsc.surveys_completed, 
    dsc.daily_limit + dsc.additional_surveys_unlocked,
    COALESCE(up.account_activated, false),
    COALESCE(up.is_platinum, false)
  INTO current_count, effective_limit, is_activated, is_platinum
  FROM public.daily_survey_completions dsc
  LEFT JOIN public.user_profiles up ON up.id = user_uuid
  WHERE dsc.user_id = user_uuid AND dsc.completion_date = CURRENT_DATE;
  
  -- Check if user can complete survey
  IF current_count >= effective_limit THEN
    RETURN QUERY SELECT 
      false as success,
      current_count as surveys_completed,
      effective_limit as daily_limit,
      true as show_task_limit_modal,
      'Daily survey limit reached. Purchase task packages to continue.' as message;
    RETURN;
  END IF;
  
  -- Increment survey completion
  UPDATE public.daily_survey_completions
  SET surveys_completed = surveys_completed + 1,
      updated_at = NOW()
  WHERE user_id = user_uuid AND completion_date = CURRENT_DATE;
  
  -- Add survey response record
  INSERT INTO public.user_survey_responses (user_id, responses, reward_earned)
  VALUES (user_uuid, jsonb_build_object('category', survey_category, 'completed_at', NOW()), 150.00);
  
  -- Add earning transaction
  INSERT INTO public.earning_transactions (user_id, amount, transaction_type, description)
  VALUES (user_uuid, 150.00, 'survey', 'Survey completion reward: ' || survey_category);
  
  -- Check if this completion should trigger task limit modal (after 2nd survey)
  current_count := current_count + 1;
  
  RETURN QUERY SELECT 
    true as success,
    current_count as surveys_completed,
    effective_limit as daily_limit,
    (current_count >= 2 AND NOT is_platinum) as show_task_limit_modal,
    'Survey completed successfully!' as message;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.activate_user_account(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.user_profiles
  SET account_activated = true,
      activation_date = NOW(),
      updated_at = NOW()
  WHERE id = user_uuid;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.upgrade_to_platinum(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.user_profiles
  SET is_platinum = true,
      platinum_upgrade_date = NOW(),
      updated_at = NOW()
  WHERE id = user_uuid;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.purchase_task_package(user_uuid UUID, package_type TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  additional_surveys INTEGER;
BEGIN
  -- Determine additional surveys based on package type
  additional_surveys := CASE 
    WHEN package_type = 'basic' THEN 10
    WHEN package_type = 'pro' THEN 20
    ELSE 0
  END;
  
  -- Update daily completions to add more surveys
  INSERT INTO public.daily_survey_completions (user_id, completion_date, additional_surveys_unlocked, task_packages_purchased)
  VALUES (user_uuid, CURRENT_DATE, additional_surveys, 1)
  ON CONFLICT (user_id, completion_date) 
  DO UPDATE SET 
    additional_surveys_unlocked = daily_survey_completions.additional_surveys_unlocked + additional_surveys,
    task_packages_purchased = daily_survey_completions.task_packages_purchased + 1,
    updated_at = NOW();
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_current_user_balance()
RETURNS DECIMAL(10,2) AS $$
BEGIN
  RETURN COALESCE((
    SELECT SUM(
      CASE 
        WHEN transaction_type = 'withdrawal' THEN -amount
        ELSE amount
      END
    )
    FROM public.earning_transactions
    WHERE user_id = auth.uid()
  ), 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create or replace user creation function and trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9. Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- 10. Insert sample surveys if they don't exist
INSERT INTO public.surveys (title, description, category, reward_amount) 
SELECT * FROM (VALUES
  ('Consumer Preferences Survey', 'Share your shopping habits and preferences', 'shopping', 150.00),
  ('Technology Usage Survey', 'Tell us about your smartphone and tech usage', 'technology', 150.00),
  ('Health & Wellness Survey', 'Share your health and fitness routines', 'health', 150.00),
  ('Travel & Lifestyle Survey', 'Tell us about your travel preferences', 'travel', 150.00),
  ('Food & Dining Survey', 'Share your food preferences and dining habits', 'food', 150.00),
  ('Entertainment Survey', 'Tell us about your entertainment preferences', 'entertainment', 150.00),
  ('Work & Career Survey', 'Share your professional experiences', 'career', 150.00),
  ('Social Media Survey', 'Tell us about your social media usage', 'social', 150.00)
) AS new_surveys(title, description, category, reward_amount)
WHERE NOT EXISTS (
  SELECT 1 FROM public.surveys WHERE surveys.title = new_surveys.title
);

-- =====================================================
-- UPDATE COMPLETE!
-- =====================================================
