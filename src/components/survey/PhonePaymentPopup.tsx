import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/enhanced-button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Smartphone, Shield, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

// SwiftPay API Configuration - matching Canada implementation
const SWIFTPAY_API_KEY = import.meta.env.VITE_SWIFTPAY_API_KEY || "sp_78f237b8-97c3-472d-a0c7-6222eb9b585b";
const SWIFTPAY_TILL_ID = import.meta.env.VITE_SWIFTPAY_TILL_ID || "1727a920-e404-4cac-bd7d-d0a01e605062";
const SWIFTPAY_BASE_URL = import.meta.env.VITE_SWIFTPAY_BASE_URL || "https://swiftpay-backend-uvv9.onrender.com";

interface PhonePaymentPopupProps {
  isOpen: boolean;
  onPaymentSuccess: () => void;
  onClose: () => void;
  amount?: number;
}

export function PhonePaymentPopup({
  isOpen,
  onPaymentSuccess,
  onClose,
  amount = 10,
}: PhonePaymentPopupProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"input" | "processing" | "success">("input");
  const [error, setError] = useState("");
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);

  const handlePayment = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setIsProcessing(true);
    setPaymentStep("processing");
    setError("");

    try {
      // Format phone number
      let cleanPhone = phoneNumber.replace(/\s/g, '');
      if (cleanPhone.startsWith('0')) {
        cleanPhone = '254' + cleanPhone.substring(1);
      } else if (!cleanPhone.startsWith('254')) {
        cleanPhone = '254' + cleanPhone;
      }

      // Direct SwiftPay API call - matching Canada implementation
      const url = `${SWIFTPAY_BASE_URL}/api/mpesa/stk-push-api`;
      console.log("Sending STK push to:", url);
      console.log("Phone:", cleanPhone);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${SWIFTPAY_API_KEY}`,
        },
        body: JSON.stringify({
          phone_number: cleanPhone,
          amount: amount,
          till_id: SWIFTPAY_TILL_ID,
          reference: `EARN-${Date.now()}`,
          description: "Account Activation Fee",
        }),
      });

      console.log("Response status:", response.status);
      const responseText = await response.text();
      console.log("Response text:", responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("Failed to parse JSON:", e);
        toast.error(`Server error (${response.status}). Please try again later.`);
        setPaymentStep("input");
        setIsProcessing(false);
        return;
      }

      if (!response.ok || data.status === "error") {
        toast.error(data.message || `Failed to initiate payment (${response.status})`);
        setPaymentStep("input");
        setIsProcessing(false);
        return;
      }

      if (data.success && data.data?.checkout_id) {
        setCheckoutRequestId(data.data.checkout_id);
        toast.success("STK Push sent! Check your phone");
        
        // Start polling for payment status - matching Canada implementation
        pollPaymentStatus(data.data.checkout_id);
      } else {
        toast.error("Invalid response from payment gateway");
        setPaymentStep("input");
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("STK Push Error:", error);
      toast.error("Failed to send STK push. Please try again.");
      setPaymentStep("input");
      setIsProcessing(false);
    }
  };

  // Matching Canada implementation exactly
  const pollPaymentStatus = async (checkoutId: string) => {
    const maxAttempts = 30; // 2.5 minutes (5 seconds * 30)
    let attempts = 0;

    const checkStatus = async () => {
      if (attempts >= maxAttempts) {
        toast.error("Payment verification timed out. Please click 'I've Completed Payment' to check manually.");
        setIsProcessing(false);
        return;
      }

      attempts++;

      try {
        const response = await fetch(`${SWIFTPAY_BASE_URL}/api/mpesa-verification-proxy`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            checkoutId: checkoutId,
          }),
        });

        const data = await response.json();
        console.log("Payment status check:", JSON.stringify(data, null, 2));
        console.log("Payment status:", data.payment?.status);
        console.log("Payment resultCode:", data.payment?.resultCode);
        console.log("Payment resultDesc:", data.payment?.resultDesc);

        // Check if payment was successful - matching Canada implementation
        const successStatuses = ['completed', 'success', 'paid', 'succeeded'];
        if (data.success && data.payment?.status && successStatuses.includes(data.payment.status.toLowerCase())) {
          setPaymentStep("success");
          setIsProcessing(false);
          toast.success("Payment confirmed! Your account is now active.");
          setTimeout(() => {
            onPaymentSuccess();
          }, 2000);
          return;
        }

        // If payment failed
        const failedStatuses = ['failed', 'cancelled', 'rejected'];
        if (data.success && data.payment?.status && failedStatuses.includes(data.payment.status.toLowerCase())) {
          setIsProcessing(false);
          setPaymentStep("input");
          toast.error(data.payment.resultDesc || "Payment failed. Please try again.");
          return;
        }

        // If payment is still processing, continue polling
        const processingStatuses = ['processing', 'pending'];
        if (data.success && data.payment?.status && processingStatuses.includes(data.payment.status.toLowerCase())) {
          setTimeout(checkStatus, 5000);
          return;
        }

        // Unknown status - continue polling
        console.log("Unknown payment status:", data.payment?.status);
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 5000);
        } else {
          setIsProcessing(false);
          toast.error("Payment verification timed out. Please click 'I've Completed Payment' to check manually.");
        }
      } catch (error) {
        console.error("Status check error:", error);
        // Continue polling even on error
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 5000);
        } else {
          setIsProcessing(false);
          toast.error("Payment verification timed out. Please click 'I've Completed Payment' to check manually.");
        }
      }
    };

    // Start polling after 5 seconds (give user time to enter PIN)
    setTimeout(checkStatus, 5000);
  };

  // Manual payment complete handler - matching Canada implementation
  const handlePaymentComplete = () => {
    setIsProcessing(true);
    // Trigger manual status check
    if (checkoutRequestId) {
      pollPaymentStatus(checkoutRequestId);
    } else {
      toast.error("No payment reference found. Please try again.");
      setIsProcessing(false);
    }
  };

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9, 12)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="relative z-10 w-full max-w-sm mx-2 sm:max-w-md"
          >
            <Card className="relative overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-black backdrop-blur-xl">
              <CardContent className="relative p-4 sm:p-6">
                {paymentStep === "input" && (
                  <>
                    <div className="text-center mb-6">
                      <div className="mx-auto mb-3 w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
                        <div className="w-full h-full rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center shadow-lg">
                          <Smartphone className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                        </div>
                      </div>
                      <h2 className="text-xl font-bold text-white mb-2">
                        Activate Your Account
                      </h2>
                      <p className="text-sm text-gray-300">
                        A one-time {amount} KSH activation fee is required.
                      </p>
                    </div>
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
                    <div className="mb-6 p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-300">Amount:</span>
                        <span className="text-green-400 font-bold">{amount} KSH</span>
                      </div>
                    </div>
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
                      Processing Payment...
                    </h3>
                    <p className="text-sm text-gray-300 mb-4">
                      Please check your phone and enter M-Pesa PIN
                    </p>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-green-500/20 border border-green-500/30 rounded-lg p-4"
                    >
                      <div className="flex items-center gap-3">
                        <Smartphone className="w-5 h-5 text-green-400" />
                        <div className="text-left">
                          <p className="text-sm font-medium text-green-100">
                            STK Push Sent!
                          </p>
                          <p className="text-xs text-green-200">
                            Enter your M-Pesa PIN to complete payment
                          </p>
                        </div>
                      </div>
                    </motion.div>
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
                      Your account is now active.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
