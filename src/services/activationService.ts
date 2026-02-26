import { supabase } from '@/lib/supabase';

// Activation Payment Functions
export async function createActivationPayment(
  userId: string,
  phoneNumber: string,
  amount: number = 10,
  checkoutRequestId?: string,
  externalReference?: string
) {
  const { data, error } = await supabase
    .from('activation_payments')
    .insert({
      user_id: userId,
      phone_number: phoneNumber,
      amount,
      checkout_request_id: checkoutRequestId,
      external_reference: externalReference,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating activation payment:', error);
    throw error;
  }

  return data;
}

export async function updateActivationPaymentStatus(
  paymentId: string,
  status: 'pending' | 'processing' | 'completed' | 'failed',
  mpesaReceiptNumber?: string,
  resultCode?: string,
  resultDesc?: string
) {
  const updates: any = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (mpesaReceiptNumber) updates.mpesa_receipt_number = mpesaReceiptNumber;
  if (resultCode) updates.result_code = resultCode;
  if (resultDesc) updates.result_desc = resultDesc;

  const { data, error } = await supabase
    .from('activation_payments')
    .update(updates)
    .eq('id', paymentId)
    .select()
    .single();

  if (error) {
    console.error('Error updating activation payment:', error);
    throw error;
  }

  return data;
}

export async function getActivationPaymentByCheckoutId(checkoutId: string) {
  const { data, error } = await supabase
    .from('activation_payments')
    .select('*')
    .eq('checkout_request_id', checkoutId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = not found
    console.error('Error fetching activation payment:', error);
    throw error;
  }

  return data;
}

export async function getUserActivationPayments(userId: string) {
  const { data, error } = await supabase
    .from('activation_payments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user activation payments:', error);
    throw error;
  }

  return data || [];
}

// Profile & Activation Functions
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching user profile:', error);
    throw error;
  }

  return data;
}

export async function isAccountActivated(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('profiles')
    .select('account_activated')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error checking account activation:', error);
    return false;
  }

  return data?.account_activated || false;
}

export async function activateUserAccount(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      account_activated: true,
      activation_date: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error activating user account:', error);
    throw error;
  }

  return data;
}

// User Earnings Functions
export async function getUserEarnings(userId: string) {
  const { data, error } = await supabase
    .from('user_earnings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching user earnings:', error);
    throw error;
  }

  return data;
}

export async function addEarnings(userId: string, amount: number) {
  const { data, error } = await supabase
    .from('user_earnings')
    .update({
      total_earnings: supabase.rpc('increment', { amount }),
      available_balance: supabase.rpc('increment', { amount }),
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error adding earnings:', error);
    throw error;
  }

  return data;
}

// Survey Completion Functions
export async function recordSurveyCompletion(
  userId: string,
  surveyId: string,
  surveyTitle: string,
  rewardAmount: number
) {
  const { data, error } = await supabase
    .from('survey_completions')
    .insert({
      user_id: userId,
      survey_id: surveyId,
      survey_title: surveyTitle,
      reward_amount: rewardAmount,
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error recording survey completion:', error);
    throw error;
  }

  return data;
}

export async function getUserSurveyCompletions(userId: string) {
  const { data, error } = await supabase
    .from('survey_completions')
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false });

  if (error) {
    console.error('Error fetching survey completions:', error);
    throw error;
  }

  return data || [];
}

// Daily Survey Limits
export async function getDailySurveyStatus(userId: string) {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('daily_survey_limits')
    .select('*')
    .eq('user_id', userId)
    .eq('survey_date', today)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching daily survey status:', error);
    throw error;
  }

  return data || { surveys_completed: 0, daily_limit: 2 };
}

export async function incrementSurveyCount(userId: string) {
  const { data, error } = await supabase.rpc('increment_survey_count', {
    p_user_id: userId,
  });

  if (error) {
    console.error('Error incrementing survey count:', error);
    throw error;
  }

  return data;
}

// Withdrawal Functions
export async function createWithdrawal(
  userId: string,
  phoneNumber: string,
  amount: number,
  checkoutRequestId?: string,
  externalReference?: string
) {
  const { data, error } = await supabase
    .from('withdrawals')
    .insert({
      user_id: userId,
      phone_number: phoneNumber,
      amount,
      checkout_request_id: checkoutRequestId,
      external_reference: externalReference,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating withdrawal:', error);
    throw error;
  }

  return data;
}

export async function updateWithdrawalStatus(
  withdrawalId: string,
  status: 'pending' | 'processing' | 'completed' | 'failed',
  mpesaReceiptNumber?: string,
  resultCode?: string,
  resultDesc?: string
) {
  const updates: any = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (mpesaReceiptNumber) updates.mpesa_receipt_number = mpesaReceiptNumber;
  if (resultCode) updates.result_code = resultCode;
  if (resultDesc) updates.result_desc = resultDesc;

  const { data, error } = await supabase
    .from('withdrawals')
    .update(updates)
    .eq('id', withdrawalId)
    .select()
    .single();

  if (error) {
    console.error('Error updating withdrawal:', error);
    throw error;
  }

  return data;
}

export async function getUserWithdrawals(userId: string) {
  const { data, error } = await supabase
    .from('withdrawals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user withdrawals:', error);
    throw error;
  }

  return data || [];
}

// Realtime subscriptions
export function subscribeToActivationPayments(
  userId: string,
  callback: (payload: any) => void
) {
  return supabase
    .channel('activation_payments_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'activation_payments',
        filter: `user_id=eq.${userId}`,
      },
      callback
    )
    .subscribe();
}

export function subscribeToProfileChanges(
  userId: string,
  callback: (payload: any) => void
) {
  return supabase
    .channel('profile_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${userId}`,
      },
      callback
    )
    .subscribe();
}
