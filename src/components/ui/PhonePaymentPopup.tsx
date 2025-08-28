import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Smartphone, Shield, Loader2, CheckCircle, AlertTriangle } from "lucide-react"

interface PhonePaymentPopupProps {
  isOpen: boolean
  onPaymentSuccess: () => void
  onClose: () => void
  amount?: number
  description?: string
}

export function PhonePaymentPopup({
  isOpen,
  onPaymentSuccess,
  onClose,
  amount = 150,
  description = "Account Activation Fee"
}: PhonePaymentPopupProps) {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStep, setPaymentStep] = useState<"input" | "processing" | "success" | "failed">("input")
  const [checkoutRequestId, setCheckoutRequestId] = useState("")
  const [error, setError] = useState("")

  const handlePayment = async () => {
    if (!phoneNumber || phoneNumber.length < 10) return
    
    setIsProcessing(true)
    setPaymentStep("processing")
    setError("")
    
    try {
      // Clean phone number - remove spaces and ensure it starts with 254
      let cleanPhone = phoneNumber.replace(/\s/g, '')
      if (cleanPhone.startsWith('0')) {
        cleanPhone = '254' + cleanPhone.substring(1)
      } else if (!cleanPhone.startsWith('254')) {
        cleanPhone = '254' + cleanPhone
      }
      
      // Initiate payment via Netlify function
      const response = await fetch('https://survaypay75.netlify.app/.netlify/functions/initiate-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: cleanPhone,
          amount: amount,
          description: description
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        const requestId = data.data.checkoutRequestId || data.data.externalReference
        setCheckoutRequestId(requestId)
        
        // Start polling for payment status
        pollPaymentStatus(requestId)
      } else {
        throw new Error(data.message || 'Failed to initiate payment')
      }
    } catch (error: any) {
      console.error('Payment error:', error)
      setError(error.message || 'Failed to initiate payment')
      setIsProcessing(false)
      setPaymentStep("failed")
    }
  }

  const pollPaymentStatus = async (requestId: string) => {
    let attempts = 0
    const maxAttempts = 60 // Poll for up to 60 attempts (30 seconds at 0.5s intervals)
    
    const checkStatus = async () => {
      try {
        const response = await fetch(`https://survaypay75.netlify.app/.netlify/functions/payment-status/${requestId}`)
        const data = await response.json()
        
        if (data.success && data.payment) {
          if (data.payment.status === 'SUCCESS') {
            setPaymentStep("success")
            setIsProcessing(false)
            
            // After 2 seconds, trigger success callback
            setTimeout(() => {
              onPaymentSuccess()
            }, 2000)
            return
          } else if (data.payment.status === 'FAILED') {
            throw new Error(data.payment.resultDesc || 'Payment failed')
          }
        }
        
        // Continue polling if still pending
        attempts++
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 500) // Check every 0.5 seconds
        } else {
          throw new Error('Payment timeout - please try again')
        }
      } catch (error: any) {
        console.error('Status check error:', error)
        setError(error.message || 'Payment verification failed')
        setIsProcessing(false)
        setPaymentStep("failed")
      }
    }
    
    checkStatus()
  }

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '')
    
    // Format as +254 XXX XXX XXX
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`
    if (digits.length <= 9) return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9, 12)}`
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setPhoneNumber(formatted)
  }

  const resetPayment = () => {
    setPaymentStep("input")
    setError("")
    setIsProcessing(false)
    setCheckoutRequestId("")
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

          {/* Main Popup */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="relative z-10 w-full max-w-sm mx-2 sm:max-w-md"
          >
            <Card className="relative overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-green-900/40 via-blue-900/40 to-purple-900/40 backdrop-blur-xl">
              {/* Animated Background */}
              <div className="absolute inset-0 overflow-hidden">
                <motion.div
                  animate={{ 
                    background: [
                      "radial-gradient(circle at 30% 40%, rgba(34, 197, 94, 0.3) 0%, transparent 50%)",
                      "radial-gradient(circle at 70% 60%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)",
                      "radial-gradient(circle at 50% 50%, rgba(147, 51, 234, 0.3) 0%, transparent 50%)"
                    ]
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute inset-0"
                />
              </div>

              <CardContent className="relative p-4 sm:p-6">
                {paymentStep === "input" && (
                  <>
                    {/* Header */}
                    <div className="text-center mb-6">
                      <motion.div
                        animate={{ 
                          scale: [1, 1.1, 1]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="mx-auto mb-3 w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center"
                      >
                        <div className="w-full h-full rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center shadow-lg">
                          <Smartphone className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                        </div>
                      </motion.div>
                      
                      <h2 className="text-xl font-bold text-white mb-2">
                        Enter Phone Number
                      </h2>
                      <p className="text-sm text-gray-300">
                        {description} - {amount} KSH
                      </p>
                    </div>

                    {/* Phone Input */}
                    <div className="mb-6">
                      <label className="block text-white text-sm font-medium mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                          +254
                        </div>
                        <Input
                          type="tel"
                          value={phoneNumber}
                          onChange={handlePhoneChange}
                          placeholder="XXX XXX XXX"
                          className="pl-16 bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-green-400"
                          maxLength={15}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Enter your M-Pesa registered number
                      </p>
                      {error && (
                        <p className="text-xs text-red-400 mt-1">
                          {error}
                        </p>
                      )}
                    </div>

                    {/* Payment Details */}
                    <div className="mb-6 p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-300">Amount:</span>
                        <span className="text-green-400 font-bold">{amount} KSH</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-4">
                      <Button
                        onClick={handlePayment}
                        disabled={!phoneNumber || phoneNumber.length < 10 || isProcessing}
                        className="w-full py-3 text-base font-bold bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 shadow-lg transform transition-all duration-200 hover:scale-105 disabled:opacity-50"
                      >
                        <Shield className="w-5 h-5 mr-2" />
                        Activate Account
                      </Button>

                      <Button
                        variant="ghost"
                        onClick={onClose}
                        className="w-full text-gray-400 hover:text-white hover:bg-white/10 text-sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </>
                )}

                {paymentStep === "processing" && (
                  <div className="text-center py-8">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="mx-auto mb-4 w-16 h-16 flex items-center justify-center"
                    >
                      <Loader2 className="w-12 h-12 text-green-400" />
                    </motion.div>
                    
                    <h3 className="text-xl font-bold text-white mb-2">
                      Processing Payment
                    </h3>
                    <p className="text-sm text-gray-300 mb-4">
                      Check your phone for M-Pesa prompt
                    </p>
                    
                    <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg mb-4">
                      <p className="text-green-100 text-xs">
                        <AlertTriangle className="w-4 h-4 inline mr-2" />
                        Enter your M-Pesa PIN when prompted
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      onClick={() => {
                        setError("Cancelled by user")
                        setPaymentStep("failed")
                        setIsProcessing(false)
                      }}
                      className="text-gray-400 hover:text-white hover:bg-white/10 text-sm"
                    >
                      Cancel Payment
                    </Button>
                  </div>
                )}

                {paymentStep === "success" && (
                  <div className="text-center py-8">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", duration: 0.6 }}
                      className="mx-auto mb-4 w-16 h-16 flex items-center justify-center"
                    >
                      <div className="w-full h-full rounded-full bg-green-500 flex items-center justify-center">
                        <CheckCircle className="w-10 h-10 text-white" />
                      </div>
                    </motion.div>
                    
                    <h3 className="text-xl font-bold text-white mb-2">
                      Payment Successful!
                    </h3>
                    <p className="text-sm text-gray-300 mb-4">
                      Account activated successfully
                    </p>
                    
                    <div className="p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                      <p className="text-blue-100 text-xs">
                        You can now withdraw directly to M-Pesa
                      </p>
                    </div>
                  </div>
                )}

                {paymentStep === "failed" && (
                  <div className="text-center py-8">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", duration: 0.6 }}
                      className="mx-auto mb-4 w-16 h-16 flex items-center justify-center"
                    >
                      <div className="w-full h-full rounded-full bg-red-500 flex items-center justify-center">
                        <AlertTriangle className="w-10 h-10 text-white" />
                      </div>
                    </motion.div>
                    
                    <h3 className="text-xl font-bold text-white mb-2">
                      {error.includes("Cancelled") ? "Payment Cancelled" : "Payment Failed"}
                    </h3>
                    <p className="text-sm text-gray-300 mb-4">
                      {error || "Transaction was not completed"}
                    </p>
                    
                    <div className="space-y-3">
                      <Button
                        onClick={resetPayment}
                        className="w-full py-3 text-base font-bold bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-lg"
                      >
                        Try Again
                      </Button>
                      
                      <Button
                        variant="ghost"
                        onClick={onClose}
                        className="w-full text-gray-400 hover:text-white hover:bg-white/10 text-sm"
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
