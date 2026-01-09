import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/supabase'

type UserProfile = Database['public']['Tables']['user_profiles']['Row']

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  balance: number
  showSignupBonus: boolean
  setShowSignupBonus: (show: boolean) => void
  signUp: (email: string, password: string, username: string) => Promise<{ error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: Error | null }>
  addEarning: (amount: number, type?: 'bonus' | 'survey' | 'withdrawal' | 'adjustment', description?: string) => Promise<{ error: any }>
  // Survey completion tracking
  getSurveyStatus: () => Promise<{ surveys_completed: number; daily_limit: number; can_complete_survey: boolean; is_account_activated: boolean; is_platinum_user: boolean }>
  completeSurvey: (category?: string) => Promise<{ success: boolean; surveys_completed: number; daily_limit: number; show_task_limit_modal: boolean; message: string }>
  activateAccount: () => Promise<boolean>
  upgradeToPlatinum: () => Promise<boolean>
  purchaseTaskPackage: (packageType: string) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [balance, setBalance] = useState(0)
  const [showSignupBonus, setShowSignupBonus] = useState(false)

  const fetchBalance = async () => {
    try {
      const { data, error } = await supabase.rpc('get_current_user_balance')
      if (error) {
        console.error('Error fetching balance:', error)
      } else {
        const numeric = typeof data === 'number' ? data : Number(data || 0)
        setBalance(numeric)
      }
    } catch (err) {
      console.error('Error fetching balance:', err)
    }
  }

  const addEarning = async (
    amount: number,
    type: 'bonus' | 'survey' | 'withdrawal' | 'adjustment' = 'survey',
    description = ''
  ) => {
    if (!user) return { error: new Error('No user logged in') }
    try {
      const { error } = await supabase.from('earning_transactions').insert({
        user_id: user.id,
        amount,
        transaction_type: type,
        description,
      })
      if (error) {
        return { error: new Error(error.message) }
      }
      await fetchBalance()
      return { error: null }
    } catch (e: any) {
      return { error: e }
    }
  }

  useEffect(() => {
    // Get initial session
    const init = async () => {
      setLoading(true)
      // Safety: force-clear loading after 2s in case of any unexpected hang
      const timeout = setTimeout(() => {
        console.debug('[Auth] init safety timeout clearing loading')
        setLoading(false)
      }, 2000)
      try {
        const { data: { session } } = await supabase.auth.getSession()
        console.debug('[Auth] init getSession:', !!session)
        setSession(session)
        setUser(session?.user ?? null)
        // Fallback: if session is null, try getUser (can still return a user when refresh is pending)
        if (!session?.user) {
          const { data: userRes } = await supabase.auth.getUser()
          if (userRes?.user) {
            console.debug('[Auth] init getUser fallback found user')
            setUser(userRes.user)
          }
        }
        if (session?.user) {
          // Fire-and-forget so UI is not blocked by slow network
          fetchProfile(session.user.id)
          fetchBalance()
        }
      } catch (e) {
        console.error('Error getting initial session:', e)
      } finally {
        clearTimeout(timeout)
        setLoading(false)
      }
    }
    init()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setLoading(true)
      // Safety: force-clear loading after 2s
      const timeout = setTimeout(() => {
        console.debug('[Auth] onAuthStateChange safety timeout clearing loading')
        setLoading(false)
      }, 2000)
      try {
        console.debug('[Auth] onAuthStateChange:', event, !!session)
        // Ignore INITIAL_SESSION to avoid overriding state we already set in init()
        if (event === 'INITIAL_SESSION') {
          setSession(session)
          // If we didn't have a user yet but session has one, set it
          if (session?.user && !user) {
            setUser(session.user)
            fetchProfile(session.user.id)
            fetchBalance()
          }
          // otherwise, keep current state to avoid flicker
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          setSession(session)
          setUser(session?.user ?? null)
          if (session?.user) {
            fetchProfile(session.user.id)
            fetchBalance()
          }
        } else if (event === 'SIGNED_OUT') {
          setSession(null)
          setUser(null)
          setProfile(null)
          setBalance(0)
        }
      } finally {
        clearTimeout(timeout)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error, status } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        // If no profile exists, create a default one
        // Supabase PostgREST often returns status 406 for no rows on .single()
        const noRows = (error as any)?.code === 'PGRST116' || status === 406 || /no rows/i.test(String(error.message))
        if (noRows) {
          const userMeta = supabase.auth.getUser
          const { data: auth } = await supabase.auth.getUser()
          const authUser = auth.user
          const defaultUsername = authUser?.user_metadata?.username
            || (authUser?.email ? authUser.email.split('@')[0] : 'user')
          const defaultEmail = authUser?.email || ''

          const { data: created, error: insertError } = await supabase
            .from('user_profiles')
            .insert({
              id: userId,
              username: defaultUsername,
              email: defaultEmail,
            })
            .select('*')
            .single()

          if (insertError) {
            console.error('Error creating default profile:', insertError)
          } else {
            setProfile(created)
          }
        } else {
          console.error('Error fetching profile:', error)
          setProfile(null)
        }
      } else {
        setProfile(data)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, username: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    })

    // If signup successful, add signup bonus and show bonus screen
    if (!error && data.user) {
      // Add 250 KSh signup bonus
      await addEarning(250, 'bonus', 'Welcome bonus for joining EarnSpark')
      setShowSignupBonus(true)
    }

    return { error }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: new Error('No user logged in') }

    const { error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', user.id)

    if (!error) {
      setProfile(prev => prev ? { ...prev, ...updates } : null)
    }

    return { error }
  }

  // Database-backed survey completion functions
  const getSurveyStatus = async () => {
    if (!user) throw new Error('No user logged in')
    
    const { data, error } = await supabase.rpc('get_daily_survey_status', {
      user_uuid: user.id
    })
    
    if (error) {
      console.error('Error getting survey status:', error)
      throw error
    }
    
    return data[0] || {
      surveys_completed: 0,
      daily_limit: 2,
      can_complete_survey: true,
      is_account_activated: false,
      is_platinum_user: false
    }
  }

  const completeSurvey = async (category = 'general') => {
    if (!user) throw new Error('No user logged in')
    
    const { data, error } = await supabase.rpc('complete_survey', {
      user_uuid: user.id,
      survey_category: category
    })
    
    if (error) {
      console.error('Error completing survey:', error)
      throw error
    }
    
    // Refresh balance after survey completion
    if (data[0]?.success) {
      await fetchBalance()
    }
    
    return data[0] || {
      success: false,
      surveys_completed: 0,
      daily_limit: 2,
      show_task_limit_modal: false,
      message: 'Error completing survey'
    }
  }

  const activateAccount = async () => {
    if (!user) throw new Error('No user logged in')
    
    const { data, error } = await supabase.rpc('activate_user_account', {
      user_uuid: user.id
    })
    
    if (error) {
      console.error('Error activating account:', error)
      throw error
    }
    
    // Refresh profile to get updated activation status
    await fetchProfile(user.id)
    
    return data || false
  }

  const upgradeToPlatinum = async () => {
    if (!user) throw new Error('No user logged in')
    
    const { data, error } = await supabase.rpc('upgrade_to_platinum', {
      user_uuid: user.id
    })
    
    if (error) {
      console.error('Error upgrading to platinum:', error)
      throw error
    }
    
    // Refresh profile to get updated platinum status
    await fetchProfile(user.id)
    
    return data || false
  }

  const purchaseTaskPackage = async (packageType: string) => {
    if (!user) throw new Error('No user logged in')
    
    const { data, error } = await supabase.rpc('purchase_task_package', {
      user_uuid: user.id,
      package_type: packageType
    })
    
    if (error) {
      console.error('Error purchasing task package:', error)
      throw error
    }
    
    return data || false
  }

  const value = {
    user,
    profile,
    session,
    loading,
    balance,
    showSignupBonus,
    setShowSignupBonus,
    signUp,
    signIn,
    signOut,
    updateProfile,
    addEarning,
    getSurveyStatus,
    completeSurvey,
    activateAccount,
    upgradeToPlatinum,
    purchaseTaskPackage,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
