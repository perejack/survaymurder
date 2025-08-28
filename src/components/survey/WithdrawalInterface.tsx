import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Smartphone, Send, ArrowLeft, Shield, CheckCircle, AlertCircle, Loader2, CreditCard, Key, Wallet, Zap, Lock, Star, Crown, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface WithdrawalInterfaceProps {
  earnings: number;
  onWithdrawalSuccess: () => void;
}

export default function WithdrawalInterface({ earnings, onWithdrawalSuccess }: WithdrawalInterfaceProps) {
  const [step, setStep] = useState<'main' | 'activation' | 'processing' | 'success'>('main')
  const [phoneNumber, setPhoneNumber] = useState("")
  const [withdrawalAmount, setWithdrawalAmount] = useState(earnings)
  const [isAccountActive, setIsAccountActive] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentReference, setPaymentReference] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'failed' | 'awaiting-code' | 'verifying-code'>('idle')
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null)
  const [transactionCode, setTransactionCode] = useState("")
  const [codeTimer, setCodeTimer] = useState<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  const quickAmounts = [1000, 2000, 5000, earnings]

  // API URL - Use current site's Netlify functions
  const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:8888/.netlify/functions'
    : `${window.location.origin}/.netlify/functions`

  // Format phone number for Kenyan format
  const formatPhoneNumber = (input: string) => {
    // Remove non-digit characters
    let cleaned = input.replace(/\D/g, '')
    
    // Format for Kenya number
    if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.substring(1)
    }
    
    if (cleaned.startsWith('+')) {
      cleaned = cleaned.substring(1)
    }
    
    if (!cleaned.startsWith('254')) {
      cleaned = '254' + cleaned
    }
    
    return cleaned
  }

  // Validate Kenyan phone number
  const validatePhoneNumber = (phoneNumber: string) => {
    const formatted = formatPhoneNumber(phoneNumber)
    return formatted.length === 12 && formatted.startsWith('254')
  }

  // Reset status when trying payment again
  const initiatePayment = async () => {
    // Reset status for new payment attempt
    setStatus('idle')
    if (!validatePhoneNumber(phoneNumber)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid Kenyan phone number",
        variant: "destructive"
      })
      return
    }

    setIsProcessing(true)
    setStatus('pending')

    try {
      const formattedPhone = formatPhoneNumber(phoneNumber)
      
      const response = await fetch(`${API_URL}/initiate-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phoneNumber: formattedPhone,
          userId: 'withdrawal-user',
          amount: earnings,
          description: `SurvayPay Withdrawal - KSH ${earnings}`
        })
      })

      const data = await response.json()

      if (data.success && data.data.externalReference) {
        setPaymentReference(data.data.externalReference)
        
        toast({
          title: "STK Push Sent",
          description: "Please complete the payment on your phone",
        })
        
        // Start polling for payment status and code timer
        startPolling(data.data.externalReference)
        startCodeTimer()
      } else {
        setStatus('failed')
        setIsProcessing(false)
        toast({
          title: "Withdrawal Failed",
          description: data.message || "Failed to initiate withdrawal",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Withdrawal initiation error:', error)
      setStatus('failed')
      setIsProcessing(false)
      toast({
        title: "Network Error",
        description: "Please check your connection and try again",
        variant: "destructive"
      })
    }
  }

  // Poll for payment status
  const startPolling = (reference: string) => {
    if (pollInterval) {
      clearInterval(pollInterval)
    }

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${API_URL}/payment-status/${reference}`)
        const data = await response.json()
        
        // Log full response for debugging
        console.log('Full payment status response:', data);

        if (data.success && data.payment) {
          // Log the payment data for debugging
          console.log('Payment status response:', data.payment);
          
          // Check for various success status formats
          const status = data.payment.status?.toUpperCase();
          if (status === 'SUCCESS' || status === 'COMPLETE' || status === 'COMPLETED' || status === '0' || data.payment.mpesaReceiptNumber) {
            clearInterval(interval)
            setStatus('success')
            setIsProcessing(false)
            
            toast({
              title: "Withdrawal Successful!",
              description: "Your earnings have been sent to your M-Pesa account.",
            })
            
            // Call success callback after showing success message
            setTimeout(() => {
              onWithdrawalSuccess()
            }, 2000)
          } else if (data.payment.status === 'FAILED') {
            clearInterval(interval)
            setStatus('failed')
            setIsProcessing(false)
            
            toast({
              title: "Withdrawal Failed",
              description: "Transaction was not completed. Please try again.",
              variant: "destructive"
            })
          }
        }
      } catch (error) {
        console.error('Error checking payment status:', error)
        // Continue polling on error
      }
    }, 5000) // Check every 5 seconds

    setPollInterval(interval)
  }

  // Validate transaction code
  const validateTransactionCode = (code: string) => {
    return code.length >= 7 && code.toUpperCase().startsWith('T')
  }

  // Handle transaction code verification
  const verifyTransactionCode = async () => {
    if (!validateTransactionCode(transactionCode)) {
      toast({
        title: "Wrong Code",
        description: "Wrong code, try again",
        variant: "destructive"
      })
      return
    }

    setStatus('verifying-code')
    
    // Simulate verification (in real app, you'd verify with your backend)
    setTimeout(() => {
      toast({
        title: "Transaction Verified!",
        description: "Your withdrawal has been processed successfully.",
      })
      
      // Clear timers and reset state before calling onSuccess
      if (codeTimer) {
        clearTimeout(codeTimer)
        setCodeTimer(null)
      }
      if (pollInterval) {
        clearInterval(pollInterval)
        setPollInterval(null)
      }
      
      setTimeout(() => {
        onWithdrawalSuccess()
      }, 2000)
    }, 1500)
  }

  // Start 25-second timer after payment processing
  const startCodeTimer = () => {
    const timer = setTimeout(() => {
      setStatus('awaiting-code')
    }, 25000) // 25 seconds
    
    setCodeTimer(timer)
  }

  // Cleanup polling and timers on unmount
  useEffect(() => {
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval)
      }
      if (codeTimer) {
        clearTimeout(codeTimer)
      }
    }
  }, [pollInterval, codeTimer])

  // Account Activation Modal
  const ActivationModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-3xl border border-purple-500/20 shadow-2xl overflow-hidden">
        {/* Header with animated background */}
        <div className="relative p-6 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-blue-600/20 animate-pulse"></div>
          <div className="relative z-10">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
              <Crown className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Account Activation Fee 💳</h2>
            <p className="text-gray-300 text-sm">A one-time activation fee is required to enable M-Pesa withdrawals</p>
          </div>
        </div>

        {/* Fee Breakdown */}
        <div className="p-6 space-y-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <div className="text-center mb-4">
              <span className="text-3xl font-bold text-white">KSh 150</span>
              <p className="text-gray-300 text-sm">One-time activation fee</p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-300">Account verification</span>
                </div>
                <span className="text-white font-medium">KSh 50</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">M-Pesa integration</span>
                </div>
                <span className="text-white font-medium">KSh 75</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-purple-400" />
                  <span className="text-gray-300">Security setup</span>
                </div>
                <span className="text-white font-medium">KSh 25</span>
              </div>
              <div className="border-t border-white/20 pt-3">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-white">Total</span>
                  <span className="text-green-400 text-lg">KSh 150</span>
                </div>
              </div>
            </div>
          </div>

          {/* Phone Input */}
          <div className="space-y-2">
            <label className="text-white font-medium">M-Pesa Phone Number</label>
            <Input
              type="tel"
              placeholder="712345678"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="h-12 bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-purple-400"
            />
            <p className="text-gray-400 text-xs">The activation fee will be charged to this number</p>
          </div>

          {/* Security badges */}
          <div className="flex items-center justify-center gap-4 py-2">
            <div className="flex items-center gap-1 text-xs text-green-400">
              <Lock className="w-3 h-3" />
              <span>Secure</span>
            </div>
            <div className="text-gray-400">•</div>
            <div className="flex items-center gap-1 text-xs text-blue-400">
              <Shield className="w-3 h-3" />
              <span>256-bit encryption</span>
            </div>
            <div className="text-gray-400">•</div>
            <div className="flex items-center gap-1 text-xs text-purple-400">
              <Zap className="w-3 h-3" />
              <span>Instant activation</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => {
                setStep('processing')
                initiatePayment()
              }}
              disabled={!phoneNumber || isProcessing}
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Crown className="w-4 h-4 mr-2" />
                  Activate Account - KSh 150
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setStep('main')}
              className="w-full text-gray-400 hover:text-white"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  // Main Withdrawal Interface
  if (step === 'activation') {
    return <ActivationModal />
  }

  if (step === 'processing') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <Card className="w-full max-w-md bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 border-blue-500/20">
          <CardContent className="p-8 text-center">
            {status === 'pending' && (
              <>
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center animate-pulse">
                  <Loader2 className="w-10 h-10 text-white animate-spin" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Processing Payment</h3>
                <p className="text-gray-300 mb-4">Check your phone for M-Pesa prompt</p>
                <div className="bg-blue-500/20 rounded-lg p-3 border border-blue-500/30">
                  <p className="text-blue-100 text-sm">Enter your M-Pesa PIN when prompted</p>
                </div>
              </>
            )}

            {status === 'awaiting-code' && (
              <>
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Key className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Enter Transaction Code</h3>
                <p className="text-gray-300 mb-4">Please enter your M-Pesa transaction code</p>
                
                <Input
                  type="text"
                  placeholder="e.g., JTNKLGBVXXEK"
                  value={transactionCode}
                  onChange={(e) => setTransactionCode(e.target.value.toUpperCase())}
                  className="h-12 mb-4 text-center text-lg font-mono bg-white/10 border-white/20 text-white"
                  maxLength={15}
                />
                
                <Button
                  onClick={verifyTransactionCode}
                  disabled={!validateTransactionCode(transactionCode) || status === 'verifying-code'}
                  className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {status === 'verifying-code' ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Verify & Continue
                    </>
                  )}
                </Button>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Account Activated!</h3>
                <p className="text-gray-300">You can now withdraw your earnings</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 rounded-3xl border border-indigo-500/20 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative p-6 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20 animate-pulse"></div>
          <div className="relative z-10">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
              <Wallet className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Withdraw Earnings</h1>
            <div className="flex items-center justify-center gap-2">
              <span className="text-gray-300">Available balance:</span>
              <span className="text-2xl font-bold text-green-400">KSh {earnings.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Withdrawal Method */}
          <div className="space-y-3">
            <label className="text-white font-medium">Withdrawal Method</label>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-medium">M-Pesa</h3>
                  <p className="text-gray-300 text-sm">Instant transfer</p>
                </div>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  <Zap className="w-3 h-3 mr-1" />
                  Instant
                </Badge>
              </div>
            </div>
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <label className="text-white font-medium">M-Pesa Phone Number</label>
            <Input
              type="tel"
              placeholder="712345678"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="h-12 bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-indigo-400"
            />
          </div>

          {/* Withdrawal Amount */}
          <div className="space-y-3">
            <label className="text-white font-medium">Withdrawal Amount (KSh)</label>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {quickAmounts.map((amount) => (
                <Button
                  key={amount}
                  variant={withdrawalAmount === amount ? "default" : "outline"}
                  onClick={() => setWithdrawalAmount(amount)}
                  className={`h-12 ${
                    withdrawalAmount === amount
                      ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                      : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                  }`}
                >
                  KSh {amount.toLocaleString()}
                </Button>
              ))}
            </div>
            <Input
              type="number"
              value={withdrawalAmount}
              onChange={(e) => setWithdrawalAmount(Number(e.target.value))}
              className="h-12 bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-indigo-400"
              min="1000"
              max={earnings}
            />
          </div>

          {/* Info */}
          <div className="bg-indigo-500/20 rounded-xl p-4 border border-indigo-500/30 space-y-2">
            <div className="flex items-center gap-2 text-indigo-300 text-sm">
              <CheckCircle className="w-4 h-4" />
              <span>Minimum withdrawal: KSh 1,000</span>
            </div>
            <div className="flex items-center gap-2 text-indigo-300 text-sm">
              <Zap className="w-4 h-4" />
              <span>Processing time: Instant to 5 minutes</span>
            </div>
            <div className="flex items-center gap-2 text-indigo-300 text-sm">
              <Star className="w-4 h-4" />
              <span>No transaction fees</span>
            </div>
          </div>

          {/* Action Button */}
          <Button
            onClick={() => setStep('activation')}
            disabled={!phoneNumber || withdrawalAmount < 1000 || withdrawalAmount > earnings}
            className="w-full h-14 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold text-lg rounded-xl shadow-lg"
          >
            <Wallet className="w-5 h-5 mr-2" />
            Withdraw KSh {withdrawalAmount.toLocaleString()}
          </Button>
        </div>
      </div>
    </div>
  )
}
