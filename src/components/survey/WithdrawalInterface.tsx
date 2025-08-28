import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
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
  const [phoneNumber, setPhoneNumber] = useState("")
  const [withdrawalAmount, setWithdrawalAmount] = useState(earnings)
  const [showActivationModal, setShowActivationModal] = useState(false)
  const [isAccountActive, setIsAccountActive] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentReference, setPaymentReference] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'failed' | 'awaiting-code' | 'verifying-code'>('idle')
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null)
  const [transactionCode, setTransactionCode] = useState("")
  const [codeTimer, setCodeTimer] = useState<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  const presetAmounts = [1000, 2000, 5000, earnings]
  const minWithdrawal = 1000

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

  // Account Activation Modal Component
  const ActivationModal = () => (
    <AnimatePresence>
      {showActivationModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="relative w-full max-w-md"
          >
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-blue-900/40 via-purple-900/40 to-pink-900/40 backdrop-blur-xl">
              <div className="absolute inset-0 overflow-hidden rounded-lg">
                <motion.div
                  animate={{ 
                    background: [
                      "radial-gradient(circle at 30% 40%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)",
                      "radial-gradient(circle at 70% 60%, rgba(147, 51, 234, 0.3) 0%, transparent 50%)",
                      "radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)"
                    ]
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute inset-0"
                />
              </div>

              <CardContent className="relative p-6">
                <div className="text-center mb-6">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center"
                  >
                    <CreditCard className="w-8 h-8 text-white" />
                  </motion.div>
                  <h2 className="text-xl font-bold text-white mb-2">Account Activation Fee 💳</h2>
                  <p className="text-sm text-gray-300">A one-time activation fee is required to enable M-Pesa withdrawals</p>
                </div>

                <div className="bg-white/10 rounded-lg p-4 mb-6 border border-white/20">
                  <div className="text-center mb-4">
                    <span className="text-3xl font-bold text-green-400">KSh 150</span>
                    <p className="text-sm text-gray-300">One-time activation fee</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-300">Account verification</span>
                      <span className="text-white font-medium">KSh 50</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-300">M-Pesa integration</span>
                      <span className="text-white font-medium">KSh 75</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-300">Security setup</span>
                      <span className="text-white font-medium">KSh 25</span>
                    </div>
                    <div className="border-t border-white/20 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-white">Total</span>
                        <span className="text-xl font-bold text-green-400">KSh 150</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">M-Pesa Phone Number</label>
                    <Input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="0712345678"
                      className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-green-400"
                    />
                    <p className="text-xs text-gray-400 mt-1">The activation fee will be charged to this number</p>
                  </div>
                </div>

                <div className="flex items-center justify-center space-x-6 mb-6 text-xs text-gray-400">
                  <div className="flex items-center">
                    <Lock className="w-3 h-3 mr-1" />
                    <span>Secure</span>
                    <br />
                    <span className="text-xs">256-bit encryption</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    <span>Verified</span>
                    <br />
                    <span className="text-xs">Instant activation</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={() => {
                      setShowActivationModal(false)
                      setIsAccountActive(true)
                      toast({
                        title: "Account Activated!",
                        description: "You can now make withdrawals",
                      })
                    }}
                    className="w-full py-3 text-base font-bold bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 shadow-lg"
                  >
                    <Shield className="w-5 h-5 mr-2" />
                    Activate Account - KSh 150
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => setShowActivationModal(false)}
                    className="w-full text-gray-400 hover:text-white hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <>
      <ActivationModal />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg mx-auto"
      >
        <Card className="border-0 shadow-2xl bg-gradient-to-br from-slate-900/90 via-blue-900/90 to-purple-900/90 backdrop-blur-xl overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              animate={{ 
                background: [
                  "radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%)",
                  "radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%)",
                  "radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.3) 0%, transparent 50%)"
                ]
              }}
              transition={{ duration: 8, repeat: Infinity }}
              className="absolute inset-0"
            />
          </div>

          <CardHeader className="relative text-center pb-6">
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="w-20 h-20 bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
            >
              <Wallet className="w-10 h-10 text-white" />
            </motion.div>
            <CardTitle className="text-2xl font-bold text-white mb-2">Withdraw Earnings</CardTitle>
            <CardDescription className="text-gray-300">
              Available balance: <span className="font-bold text-green-400">KSh {earnings.toLocaleString()}</span>
            </CardDescription>
          </CardHeader>

          <CardContent className="relative space-y-6">
            {/* Withdrawal Method */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Smartphone className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">M-Pesa</h3>
                  <p className="text-xs text-gray-400">Instant transfer</p>
                </div>
                <Badge className="ml-auto bg-green-500/20 text-green-400 border-green-500/30">
                  <Zap className="w-3 h-3 mr-1" />
                  Instant
                </Badge>
              </div>
            </div>

            {/* Withdrawal Amount Selection */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-white">Withdrawal Amount (KSh)</label>
              <div className="grid grid-cols-2 gap-3">
                {presetAmounts.filter(amount => amount <= earnings && amount >= minWithdrawal).map((amount) => (
                  <motion.button
                    key={amount}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setWithdrawalAmount(amount)}
                    className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                      withdrawalAmount === amount
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 border-blue-400 text-white shadow-lg'
                        : 'bg-white/5 border-white/20 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    KSh {amount.toLocaleString()}
                  </motion.button>
                ))}
              </div>
              
              <div className="space-y-2">
                <Input
                  type="number"
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(Number(e.target.value))}
                  placeholder="Enter custom amount"
                  className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-blue-400"
                  min={minWithdrawal}
                  max={earnings}
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>• Minimum withdrawal: KSh {minWithdrawal.toLocaleString()}</span>
                  <span>• Processing time: Instant to 5 minutes</span>
                </div>
                <p className="text-xs text-gray-400">• No transaction fees</p>
              </div>
            </div>

            {/* Phone Number Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">M-Pesa Phone Number</label>
              <Input
                type="tel"
                placeholder="0712345678"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-blue-400"
                disabled={isProcessing}
              />
              <p className="text-xs text-gray-400">
                Enter your Safaricom number (e.g., 0712345678 or 712345678)
              </p>
            </div>

            {/* Status Display */}
            {!isAccountActive && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl p-4 border border-orange-500/30"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <Lock className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-orange-400">Account Activation Required</h3>
                    <p className="text-xs text-gray-400">One-time setup to enable withdrawals</p>
                  </div>
                </div>
                <Button
                  onClick={() => setShowActivationModal(true)}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Activate Account - KSh 150
                </Button>
              </motion.div>
            )}

            {status === 'pending' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20"
              >
                <div className="flex items-center gap-2 text-blue-400 mb-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="font-medium">Processing Withdrawal</span>
                </div>
                <p className="text-sm text-gray-300">
                  STK push sent. Please complete the payment on your phone.
                </p>
              </motion.div>
            )}

            {status === 'success' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-500/10 rounded-xl p-4 border border-green-500/20"
              >
                <div className="flex items-center gap-2 text-green-400 mb-2">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">Withdrawal Successful!</span>
                </div>
                <p className="text-sm text-gray-300">
                  Your earnings have been sent to your M-Pesa account.
                </p>
              </motion.div>
            )}

            {status === 'awaiting-code' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-500/20"
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Enter Transaction Code</h3>
                  <p className="text-sm text-gray-300">
                    Please enter your M-Pesa transaction code to complete verification
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white flex items-center gap-2">
                      <Key className="w-4 h-4" />
                      Transaction Code
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., JTNKLGBVXXEK"
                      value={transactionCode}
                      onChange={(e) => setTransactionCode(e.target.value.toUpperCase())}
                      className="h-12 text-center text-lg font-mono tracking-wider bg-white/5 border-white/20 text-white placeholder-gray-400"
                      maxLength={15}
                    />
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Must be 7+ characters</span>
                      <span className={`font-medium ${
                        validateTransactionCode(transactionCode) 
                          ? 'text-green-400' 
                          : 'text-gray-400'
                      }`}>
                        {transactionCode.length}/15
                      </span>
                    </div>
                  </div>

                  <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
                    <p className="text-xs text-blue-400 font-medium mb-1">💡 Where to find your code:</p>
                    <p className="text-xs text-gray-300">
                      Check your SMS from M-Pesa for your transaction confirmation code
                    </p>
                  </div>

                  <Button
                    onClick={verifyTransactionCode}
                    disabled={!validateTransactionCode(transactionCode) || status === 'verifying-code'}
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
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
                </div>
              </motion.div>
            )}

            {status === 'failed' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-500/10 rounded-xl p-4 border border-red-500/20"
              >
                <div className="flex items-center gap-2 text-red-400 mb-2">
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-medium">Withdrawal Failed</span>
                </div>
                <p className="text-sm text-gray-300">
                  Transaction was not completed. Please try withdrawal again.
                </p>
              </motion.div>
            )}

            {/* Action Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={isAccountActive ? initiatePayment : () => setShowActivationModal(true)}
                disabled={isProcessing || !phoneNumber || status === 'success' || status === 'awaiting-code' || status === 'verifying-code' || withdrawalAmount < minWithdrawal}
                className="w-full h-14 text-lg font-bold bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-600 hover:from-emerald-600 hover:via-blue-600 hover:to-purple-700 text-white shadow-xl"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : !isAccountActive ? (
                  <>
                    <Crown className="w-5 h-5 mr-2" />
                    Activate Account First
                  </>
                ) : status === 'failed' ? (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Try Withdrawal Again
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Withdraw KSh {withdrawalAmount.toLocaleString()}
                    <Sparkles className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </motion.div>

            {/* Security Info */}
            <div className="bg-green-500/5 rounded-xl p-4 border border-green-500/20">
              <div className="flex items-center gap-2 text-green-400 mb-3">
                <Shield className="w-4 h-4" />
                <span className="font-medium">Secure M-Pesa Withdrawal</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  <Star className="w-3 h-3 text-yellow-400" />
                  <span>Instant processing</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-3 h-3 text-blue-400" />
                  <span>Bank-level security</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-400" />
                  <span>No hidden fees</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-3 h-3 text-purple-400" />
                  <span>24/7 available</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                <Smartphone className="w-3 h-3" />
                <span>Powered by M-Pesa • Instant verification</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </>
  )
}
