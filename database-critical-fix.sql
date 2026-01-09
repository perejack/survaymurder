-- =====================================================
-- CRITICAL FIX: Ambiguous column reference in complete_survey
-- This fixes the "column reference surveys_completed is ambiguous" error
-- =====================================================

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
  -- Get current status with explicit table aliases to avoid ambiguity
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
  
  -- Increment survey completion using explicit table reference
  UPDATE public.daily_survey_completions
  SET surveys_completed = public.daily_survey_completions.surveys_completed + 1,
      updated_at = NOW()
  WHERE user_id = user_uuid AND completion_date = CURRENT_DATE;
  
  -- Add survey response record
  INSERT INTO public.user_survey_responses (user_id, responses, reward_earned)
  VALUES (user_uuid, jsonb_build_object('category', survey_category, 'completed_at', NOW()), 150.00);
  
  -- Add earning transaction
  INSERT INTO public.earning_transactions (user_id, amount, transaction_type, description)
  VALUES (user_uuid, 150.00, 'survey', 'Survey completion reward: ' || survey_category);
  
  -- Update current count for return value
  current_count := current_count + 1;
  
  RETURN QUERY SELECT 
    true as success,
    current_count as surveys_completed,
    effective_limit as daily_limit,
    (current_count >= 2 AND NOT is_platinum) as show_task_limit_modal,
    'Survey completed successfully!' as message;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
