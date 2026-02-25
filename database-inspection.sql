-- =====================================================
-- DATABASE INSPECTION SCRIPT
-- Run this to check current database state
-- =====================================================

-- 1. Check all existing tables in public schema
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. Check all existing functions in public schema
SELECT 
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- 3. Check user_profiles table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'user_profiles'
ORDER BY ordinal_position;

-- 4. Check earning_transactions table structure (if exists)
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'earning_transactions'
ORDER BY ordinal_position;

-- 5. Check daily_survey_completions table structure (if exists)
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'daily_survey_completions'
ORDER BY ordinal_position;

-- 6. Check surveys table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'surveys'
ORDER BY ordinal_position;

-- 7. Check user_survey_responses table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'user_survey_responses'
ORDER BY ordinal_position;

-- 8. Check existing RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 9. Check existing triggers
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- 10. Check if specific functions exist
SELECT 
  routine_name,
  specific_name,
  routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN (
    'get_daily_survey_status',
    'complete_survey', 
    'activate_user_account',
    'upgrade_to_platinum',
    'purchase_task_package',
    'get_current_user_balance',
    'handle_new_user'
  )
ORDER BY routine_name;
