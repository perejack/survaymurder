import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Mail, Lock, User, Eye, EyeOff, Sparkles, Star, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const AuthModal: React.FC<AuthModalProps> = ({ open, onOpenChange }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [activeTab, setActiveTab] = useState('signup')
  const { signIn, signUp } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [signInForm, setSignInForm] = useState({
    email: '',
    password: ''
  })

  const [signUpForm, setSignUpForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  // When dialog is open, prevent background from scrolling/panning
  useEffect(() => {
    if (open) {
      document.body.classList.add('modal-open')
    } else {
      document.body.classList.remove('modal-open')
    }
    return () => {
      document.body.classList.remove('modal-open')
    }
  }, [open])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await signIn(signInForm.email, signInForm.password)
      
      if (error) {
        toast({
          title: 'Sign in failed',
          description: error.message,
          variant: 'destructive'
        })
      } else {
        toast({
          title: 'Welcome back!',
          description: 'You have successfully signed in.',
        })
        onOpenChange(false)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (signUpForm.password !== signUpForm.confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please make sure your passwords match.',
        variant: 'destructive'
      })
      return
    }

    if (signUpForm.password.length < 6) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 6 characters long.',
        variant: 'destructive'
      })
      return
    }

    setIsLoading(true)

    try {
      const { error } = await signUp(signUpForm.email, signUpForm.password, signUpForm.username)
      
      if (error) {
        toast({
          title: 'Sign up failed',
          description: error.message,
          variant: 'destructive'
        })
      } else {
        toast({
          title: 'Account created!',
          description: 'Welcome! Redirecting to surveys...',
        })
        onOpenChange(false)
        // Redirect to surveys page immediately after successful signup
        setTimeout(() => {
          navigate('/survey')
        }, 500)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[420px] sm:max-w-[480px] p-0 overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 border-0 shadow-2xl rounded-2xl sm:rounded-3xl max-h-[95vh] overflow-y-auto overscroll-contain touch-pan-y">
        <div className="relative">
          {/* Background decorative elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-pink-600/5" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-400/10 to-transparent rounded-full blur-xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-400/10 to-transparent rounded-full blur-xl" />
          
          <div className="relative z-10 p-3 sm:p-4 md:p-6">
            <DialogHeader className="text-center mb-3 sm:mb-4 md:mb-6">
              <div className="flex justify-center mb-2 sm:mb-3 md:mb-4">
                <div className="relative">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <Star className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 text-white" />
                  </div>
                </div>
              </div>
              <DialogTitle className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Start Earning Today
              </DialogTitle>
              <p className="text-gray-600 mt-1 sm:mt-2 text-xs sm:text-sm md:text-base px-2">Join thousands earning money through surveys</p>
            </DialogHeader>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-3 sm:mb-4 md:mb-6 bg-gray-100/80 backdrop-blur-sm h-9 sm:h-10 md:h-11">
                <TabsTrigger 
                  value="signup"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200 text-xs sm:text-sm md:text-base"
                >
                  Sign Up
                </TabsTrigger>
                <TabsTrigger 
                  value="signin" 
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200 text-xs sm:text-sm md:text-base"
                >
                  Sign In
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-2 sm:space-y-3 md:space-y-4">
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-2 sm:pb-3 md:pb-4 pt-3 sm:pt-4 md:pt-6">
                    <CardTitle className="text-base sm:text-lg md:text-xl">Welcome Back</CardTitle>
                    <CardDescription className="text-xs sm:text-sm md:text-base">Sign in to continue earning</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <form onSubmit={handleSignIn} className="space-y-2 sm:space-y-3 md:space-y-4">
                      <div className="space-y-1 sm:space-y-2">
                        <Label htmlFor="signin-email" className="text-xs sm:text-sm">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-2 sm:left-3 top-2.5 sm:top-3 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                          <Input
                            id="signin-email"
                            type="email"
                            placeholder="Enter your email"
                            value={signInForm.email}
                            onChange={(e) => setSignInForm(prev => ({ ...prev, email: e.target.value }))}
                            className="pl-8 sm:pl-10 h-9 sm:h-11 md:h-12 border-gray-200 focus:border-blue-500 transition-colors text-sm sm:text-base"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-1 sm:space-y-2">
                        <Label htmlFor="signin-password" className="text-xs sm:text-sm">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-2 sm:left-3 top-2.5 sm:top-3 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                          <Input
                            id="signin-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            value={signInForm.password}
                            onChange={(e) => setSignInForm(prev => ({ ...prev, password: e.target.value }))}
                            className="pl-8 sm:pl-10 pr-8 sm:pr-10 h-9 sm:h-11 md:h-12 border-gray-200 focus:border-blue-500 transition-colors text-sm sm:text-base"
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 sm:right-2 top-1 sm:top-2 h-6 w-6 sm:h-8 sm:w-8 p-0"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" /> : <Eye className="h-3 w-3 sm:h-4 sm:w-4" />}
                          </Button>
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full h-10 sm:h-11 md:h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 text-xs sm:text-sm md:text-base touch-manipulation active:scale-95"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                            <span className="text-xs sm:text-sm">Signing In...</span>
                          </>
                        ) : (
                          <>
                            <Trophy className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="text-xs sm:text-sm">Sign In & Start Earning</span>
                          </>
                        )}
                      </Button>
                    </form>
                    
                    <div className="mt-3 sm:mt-4 text-center">
                      <p className="text-xs sm:text-sm text-gray-600">
                        Don't have an account?{' '}
                        <button
                          type="button"
                          onClick={() => setActiveTab('signup')}
                          className="text-blue-600 hover:text-blue-700 font-medium underline"
                        >
                          Sign up here
                        </button>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="signup" className="space-y-2 sm:space-y-3 md:space-y-4">
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-2 sm:pb-3 md:pb-4 pt-3 sm:pt-4 md:pt-6">
                    <CardTitle className="text-base sm:text-lg md:text-xl">Create Account</CardTitle>
                    <CardDescription className="text-xs sm:text-sm md:text-base">Join and start earning money today</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <form onSubmit={handleSignUp} className="space-y-2 sm:space-y-3 md:space-y-4">
                      <div className="space-y-1 sm:space-y-2">
                        <Label htmlFor="signup-username" className="text-xs sm:text-sm">Username</Label>
                        <div className="relative">
                          <User className="absolute left-2 sm:left-3 top-2.5 sm:top-3 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                          <Input
                            id="signup-username"
                            type="text"
                            placeholder="Choose a username"
                            value={signUpForm.username}
                            onChange={(e) => setSignUpForm(prev => ({ ...prev, username: e.target.value }))}
                            className="pl-8 sm:pl-10 h-9 sm:h-11 md:h-12 border-gray-200 focus:border-blue-500 transition-colors text-sm sm:text-base"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1 sm:space-y-2">
                        <Label htmlFor="signup-email" className="text-xs sm:text-sm">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-2 sm:left-3 top-2.5 sm:top-3 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder="Enter your email"
                            value={signUpForm.email}
                            onChange={(e) => setSignUpForm(prev => ({ ...prev, email: e.target.value }))}
                            className="pl-8 sm:pl-10 h-9 sm:h-11 md:h-12 border-gray-200 focus:border-blue-500 transition-colors text-sm sm:text-base"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-1 sm:space-y-2">
                        <Label htmlFor="signup-password" className="text-xs sm:text-sm">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-2 sm:left-3 top-2.5 sm:top-3 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                          <Input
                            id="signup-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a password"
                            value={signUpForm.password}
                            onChange={(e) => setSignUpForm(prev => ({ ...prev, password: e.target.value }))}
                            className="pl-8 sm:pl-10 pr-8 sm:pr-10 h-9 sm:h-11 md:h-12 border-gray-200 focus:border-blue-500 transition-colors text-sm sm:text-base"
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 sm:right-2 top-1 sm:top-2 h-6 w-6 sm:h-8 sm:w-8 p-0"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" /> : <Eye className="h-3 w-3 sm:h-4 sm:w-4" />}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-1 sm:space-y-2">
                        <Label htmlFor="signup-confirm-password" className="text-xs sm:text-sm">Confirm Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-2 sm:left-3 top-2.5 sm:top-3 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                          <Input
                            id="signup-confirm-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Confirm your password"
                            value={signUpForm.confirmPassword}
                            onChange={(e) => setSignUpForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            className="pl-8 sm:pl-10 h-9 sm:h-11 md:h-12 border-gray-200 focus:border-blue-500 transition-colors text-sm sm:text-base"
                            required
                          />
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full h-10 sm:h-11 md:h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 text-xs sm:text-sm md:text-base touch-manipulation active:scale-95"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                            <span className="text-xs sm:text-sm">Creating Account...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="text-xs sm:text-sm">Create Account & Start Earning</span>
                          </>
                        )}
                      </Button>
                    </form>
                    
                    <div className="mt-3 sm:mt-4 text-center">
                      <p className="text-xs sm:text-sm text-gray-600">
                        Already have an account?{' '}
                        <button
                          type="button"
                          onClick={() => setActiveTab('signin')}
                          className="text-blue-600 hover:text-blue-700 font-medium underline"
                        >
                          Sign in here
                        </button>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="mt-3 sm:mt-4 md:mt-6 text-center">
              <p className="text-xs text-gray-500 px-2">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
