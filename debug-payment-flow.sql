-- Debug script to check if payment flow is working correctly
-- Run this after a successful payment to verify database state

-- 1. Check if purchase_task_package function exists and works
SELECT 'Testing purchase_task_package function...' as test_step;

-- Check if function exists
SELECT 
    routine_name, 
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'purchase_task_package';

-- 2. Check current daily_survey_completions table structure
SELECT 'Checking daily_survey_completions table...' as test_step;
SELECT 
    user_id,
    completion_date,
    surveys_completed,
    daily_limit,
    additional_surveys_unlocked,
    task_packages_purchased,
    created_at,
    updated_at
FROM public.daily_survey_completions 
WHERE completion_date = CURRENT_DATE
ORDER BY updated_at DESC
LIMIT 5;

-- 3. Test get_daily_survey_status function
SELECT 'Testing get_daily_survey_status function...' as test_step;
-- SELECT * FROM get_daily_survey_status('YOUR_USER_ID_HERE'::UUID);

-- 4. Check if the calculation is correct
SELECT 'Checking survey limit calculation...' as test_step;
SELECT 
    user_id,
    surveys_completed,
    daily_limit,
    additional_surveys_unlocked,
    (daily_limit + additional_surveys_unlocked) as effective_limit,
    (surveys_completed < (daily_limit + additional_surveys_unlocked)) as should_allow_surveys
FROM public.daily_survey_completions 
WHERE completion_date = CURRENT_DATE
AND additional_surveys_unlocked > 0;

-- 5. Check recent payment transactions (if you have a payments table)
SELECT 'Checking recent activity...' as test_step;
SELECT 
    user_id,
    completion_date,
    surveys_completed,
    daily_limit,
    additional_surveys_unlocked,
    task_packages_purchased,
    updated_at
FROM public.daily_survey_completions 
WHERE updated_at > NOW() - INTERVAL '1 hour'
ORDER BY updated_at DESC;

-- 6. Check ALL records to see if any have additional_surveys_unlocked > 0
SELECT 'Checking all records with additional surveys...' as test_step;
SELECT 
    user_id,
    completion_date,
    surveys_completed,
    daily_limit,
    additional_surveys_unlocked,
    task_packages_purchased,
    updated_at
FROM public.daily_survey_completions 
WHERE additional_surveys_unlocked > 0
ORDER BY updated_at DESC
LIMIT 10;
