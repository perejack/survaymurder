import { useState, useEffect } from 'react';
import { CreditCard, Smartphone, Shield, CheckCircle, ArrowRight, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { initiatePayment, pollPaymentStatus, validatePhoneNumber, PaymentStatus } from '@/utils/paymentService';

interface ActivationFeeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const ActivationFeeModal = ({ 
  open, 
  onOpenChange, 
  onSuccess 
}: ActivationFeeModalProps) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [paymentReference, setPaymentReference] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleActivate = async () => {
    if (!phoneNumber) {
      setError("Please enter your M-Pesa phone number.");
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setError("Please enter a valid Kenyan phone number.");
      return;
    }

    setIsProcessing(true);
    setStatusMessage('Processing payment...');
    setError('');

    try {
      // Initiate STK Push payment using working genesis functions
      const paymentResponse = await initiatePayment(phoneNumber, 150, 'Account Activation Fee');
      
      if (paymentResponse.success && paymentResponse.data) {
        const requestId = paymentResponse.data.checkoutRequestId || paymentResponse.data.externalReference;
        setPaymentReference(requestId);
        setStatusMessage('STK Push sent. Please complete payment on your phone.');
        
        // Start polling for payment status with same logic as genesis verification
        pollPaymentStatusReal(requestId);
      } else {
        throw new Error(paymentResponse.message || 'Failed to initiate payment');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError(error.message || 'Failed to initiate payment');
      setIsProcessing(false);
      setStatusMessage('');
    }
  };

  const pollPaymentStatusReal = async (requestId: string) => {
    let attempts = 0;
    const maxAttempts = 50; // Poll for up to 50 attempts (25 seconds at 0.5s intervals)
    
    const checkStatus = async () => {
      try {
        const response = await fetch(`/.netlify/functions/payment-status/${requestId}`);
        const data = await response.json();
        
        if (data.success && data.payment) {
          if (data.payment.status === 'SUCCESS') {
            setIsProcessing(false);
            setIsComplete(true);
            setStatusMessage('Payment successful! Account activated.');
            
            // After 2 seconds, trigger success callback
            setTimeout(() => {
              onSuccess();
              onOpenChange(false);
            }, 2000);
            return;
          } else if (data.payment.status === 'FAILED') {
            throw new Error(data.payment.resultDesc || 'Payment canceled by user');
          }
        }
        
        // Continue polling if still pending
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 500); // Check every 0.5 seconds
        } else {
          throw new Error('Payment timeout - please try again');
        }
      } catch (error) {
        console.error('Status check error:', error);
        setError(error.message || 'Payment verification failed');
        setIsProcessing(false);
        setStatusMessage('');
      }
    };
    
    checkStatus();
  };

  if (isComplete) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[95vw] max-w-[420px] p-0 overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-0 shadow-2xl">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-emerald-500/5 to-teal-500/5" />
            
            <div className="relative z-10 p-6 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Account Activated! 🎉
              </h2>
              <p className="text-gray-600 mb-6">
                Your account is now active and ready for M-Pesa withdrawals
              </p>

              <Card className="gradient-card p-6 mb-6 border-0 shadow-lg">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Activation Fee:</span>
                    <span className="font-bold text-lg">KSh 150</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Charged to:</span>
                    <span className="font-medium">{phoneNumber}</span>
                  </div>
                  {paymentReference && (
                    <div className="flex justify-between items-center">
                      <span>Reference:</span>
                      <span className="font-mono text-sm">{paymentReference}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span>Status:</span>
                    <span className="text-green-600 font-semibold">✅ Active</span>
                  </div>
                </div>
              </Card>

              <Button
                onClick={() => {
                  onSuccess();
                  onOpenChange(false);
                }}
                size="lg"
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-6 text-lg"
              >
                Start Withdrawing Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[420px] p-0 overflow-hidden bg-white border-0 shadow-2xl">
        <div className="relative">
          <div className="relative z-10 p-6">
            {/* Header matching screenshot */}
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
                Account Activation Fee 💳
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                A one-time activation fee is required to enable M-Pesa withdrawals
              </p>
            </div>

            {/* Fee breakdown card matching screenshot */}
            <Card className="bg-gray-50 p-6 mb-6 border border-gray-200 rounded-xl">
              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-orange-500 mb-2">
                  KSh 150
                </div>
                <div className="text-sm text-gray-600">One-time activation fee</div>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Account verification</span>
                  <span className="text-gray-800 font-medium">KSh 50</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">M-Pesa integration</span>
                  <span className="text-gray-800 font-medium">KSh 75</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Security setup</span>
                  <span className="text-gray-800 font-medium">KSh 25</span>
                </div>
                <hr className="border-gray-300 my-3" />
                <div className="flex items-center justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-orange-500 text-lg">KSh 150</span>
                </div>
              </div>
            </Card>

            {/* Phone number input matching screenshot */}
            <div className="mb-6">
              <Label htmlFor="activation-phone" className="text-base font-semibold mb-3 block text-gray-800">
                M-Pesa Phone Number
              </Label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <Input
                  id="activation-phone"
                  type="tel"
                  placeholder="07XXXXXXXX or 01XXXXXXXX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="pl-12 h-12 text-base border-2 border-gray-200 focus:border-orange-500 transition-colors rounded-xl bg-gray-50"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                The activation fee will be charged to this number
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Security features matching screenshot */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <Card className="bg-gray-50 p-3 border border-gray-200 rounded-xl">
                <div className="text-center">
                  <Shield className="w-6 h-6 mx-auto mb-1 text-blue-600" />
                  <p className="text-xs font-medium text-gray-800">Secure</p>
                  <p className="text-xs text-gray-600">256-bit encryption</p>
                </div>
              </Card>
              
              <Card className="bg-gray-50 p-3 border border-gray-200 rounded-xl">
                <div className="text-center">
                  <CheckCircle className="w-6 h-6 mx-auto mb-1 text-green-600" />
                  <p className="text-xs font-medium text-gray-800">Verified</p>
                  <p className="text-xs text-gray-600">Instant activation</p>
                </div>
              </Card>
            </div>

            {/* Action button matching screenshot */}
            <div className="space-y-3">
              <Button
                onClick={handleActivate}
                disabled={isProcessing || !phoneNumber}
                size="lg"
                className="w-full bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-semibold py-4 text-base rounded-xl shadow-lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {statusMessage || 'Processing Payment...'}
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    Pay KSh 150 & Activate
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
              
              <Button
                onClick={() => onOpenChange(false)}
                variant="outline"
                size="lg"
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl"
                disabled={isProcessing}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ActivationFeeModal;
