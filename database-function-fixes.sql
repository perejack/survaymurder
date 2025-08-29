-- =====================================================
-- DATABASE FUNCTION FIXES
-- Critical fixes for existing functions based on inspection
-- =====================================================

-- 1. Fix complete_survey function - missing earning transaction insertion
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
  
  -- **CRITICAL FIX: Add earning transaction (was missing)**
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

-- 2. Fix get_current_user_balance function - handle withdrawals correctly
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

-- 3. Add signup bonus function (missing from current setup)
CREATE OR REPLACE FUNCTION public.add_signup_bonus(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if signup bonus already exists
  IF EXISTS (
    SELECT 1 FROM public.earning_transactions 
    WHERE user_id = user_uuid AND transaction_type = 'bonus' AND description LIKE '%Welcome bonus%'
  ) THEN
    RETURN false; -- Bonus already given
  END IF;
  
  -- Add signup bonus transaction
  INSERT INTO public.earning_transactions (user_id, amount, transaction_type, description)
  VALUES (user_uuid, 250.00, 'bonus', 'Welcome bonus for new user');
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Update handle_new_user to include signup bonus
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create user profile
  INSERT INTO public.user_profiles (id, email, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  
  -- Add signup bonus
  PERFORM public.add_signup_bonus(NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FIXES COMPLETE!
-- Run this to fix the critical missing earning transaction
-- insertion in survey completion and balance calculation
-- =====================================================
