-- Create user profiles table
CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  account_activated BOOLEAN DEFAULT FALSE,
  is_platinum BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for user_profiles - users can only see and edit their own profile
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create surveys table for future use
CREATE TABLE public.surveys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  reward_amount DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Create user_survey_responses table
CREATE TABLE public.user_survey_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  survey_id UUID REFERENCES public.surveys(id) ON DELETE CASCADE,
  responses JSONB,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reward_earned DECIMAL(10,2) DEFAULT 0
);

-- Create daily survey completions tracking table
CREATE TABLE public.daily_survey_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  completion_date DATE DEFAULT CURRENT_DATE,
  surveys_completed INTEGER DEFAULT 0,
  daily_limit INTEGER DEFAULT 2,
  task_packages_purchased INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, completion_date)
);

-- Enable RLS on surveys and responses
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_survey_completions ENABLE ROW LEVEL SECURITY;

-- Policies for surveys (everyone can view active surveys)
CREATE POLICY "Anyone can view active surveys" ON public.surveys
  FOR SELECT USING (is_active = true);

-- Policies for survey responses (users can only see their own responses)
CREATE POLICY "Users can view own responses" ON public.user_survey_responses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own responses" ON public.user_survey_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for daily survey completions (users can only see and modify their own)
CREATE POLICY "Users can view own completions" ON public.daily_survey_completions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own completions" ON public.daily_survey_completions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own completions" ON public.daily_survey_completions
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to get or create daily survey completion record
CREATE OR REPLACE FUNCTION get_daily_survey_completion(user_uuid UUID)
RETURNS TABLE (
  surveys_completed INTEGER,
  daily_limit INTEGER,
  can_complete_survey BOOLEAN
) AS $$
BEGIN
  -- Insert or update daily completion record
  INSERT INTO public.daily_survey_completions (user_id, completion_date, surveys_completed, daily_limit)
  VALUES (user_uuid, CURRENT_DATE, 0, 2)
  ON CONFLICT (user_id, completion_date) 
  DO NOTHING;
  
  -- Return current status
  RETURN QUERY
  SELECT 
    dsc.surveys_completed,
    dsc.daily_limit,
    (dsc.surveys_completed < dsc.daily_limit) as can_complete_survey
  FROM public.daily_survey_completions dsc
  WHERE dsc.user_id = user_uuid AND dsc.completion_date = CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment survey completion
CREATE OR REPLACE FUNCTION increment_survey_completion(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_count INTEGER;
  limit_count INTEGER;
BEGIN
  -- Get current completion status
  SELECT surveys_completed, daily_limit 
  INTO current_count, limit_count
  FROM public.daily_survey_completions
  WHERE user_id = user_uuid AND completion_date = CURRENT_DATE;
  
  -- Check if user can complete another survey
  IF current_count >= limit_count THEN
    RETURN FALSE;
  END IF;
  
  -- Increment completion count
  UPDATE public.daily_survey_completions
  SET surveys_completed = surveys_completed + 1,
      updated_at = NOW()
  WHERE user_id = user_uuid AND completion_date = CURRENT_DATE;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to automatically create user profile on signup
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

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on user_profiles
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create payments table
CREATE TABLE public.payments (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  checkout_request_id TEXT UNIQUE NOT NULL,
  external_reference TEXT,
  status TEXT NOT NULL,
  amount NUMERIC,
  phone_number TEXT,
  mpesa_receipt_number TEXT,
  result_desc TEXT,
  result_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Policies for payments (allow public read access for status checks)
CREATE POLICY "Allow public read access to payments" ON public.payments
  FOR SELECT USING (true);

-- Trigger to update updated_at on payments
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
