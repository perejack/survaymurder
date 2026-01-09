import { useState, useEffect } from 'react';
import { CreditCard, Smartphone, Shield, CheckCircle, ArrowRight, Loader2, X, Zap, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { initiatePayment, validatePhoneNumber } from '@/utils/paymentService';

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
  const { activateAccount } = useAuth();
  const activationFee = 20;

  // Lock background scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [open]);

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
      const paymentResponse = await initiatePayment(phoneNumber, activationFee, 'Account Activation Fee');
      
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
    const maxAttempts = 120; // Poll for up to 120 attempts (4 minutes at 2s intervals)
    
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/payment-status?reference=${requestId}`);
        const data = await response.json();
        
        if (data.success && data.payment) {
          const normalizedStatus = String(data.payment.status || '').toUpperCase();
          if (normalizedStatus === 'SUCCESS') {
            setIsProcessing(false);
            setIsComplete(true);
            setStatusMessage('Payment successful! Account activated.');
            
            // After 2 seconds, trigger success callback
            setTimeout(async () => {
              try {
                // Call the database activation function
                await activateAccount();
                
                // Call the activation callback
                onSuccess();
              } catch (error) {
                console.error('Error activating account:', error);
              }
              
              // Close modal after a short delay
              setTimeout(() => {
                onOpenChange(false);
              }, 2000);
            }, 2000);
            return;
          } else if (normalizedStatus === 'FAILED') {
            throw new Error(data.payment.resultDesc || 'Payment canceled by user');
          }
        }
        
        // Continue polling if still pending
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 2000); // Check every 2 seconds
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
        <DialogContent className="w-[95vw] max-w-md mx-auto p-0 overflow-hidden bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 border-0 shadow-2xl rounded-2xl sm:rounded-3xl max-h-[90vh] overflow-y-auto overscroll-contain touch-pan-y">
          <div className="relative">
            {/* Animated background elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-green-500/5 to-teal-500/10" />
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-400/20 to-transparent rounded-full blur-xl" />
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-green-400/20 to-transparent rounded-full blur-xl" />
            
            <div className="relative z-10 p-4 sm:p-6 text-center">
              {/* Success icon with animation */}
              <div className="relative mx-auto mb-4 sm:mb-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-xl animate-bounce">
                  <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Star className="w-3 h-3 text-white" />
                </div>
              </div>
              
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                Account Activated! 🎉
              </h2>
              <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base px-2">
                Your account is now active and ready for M-Pesa withdrawals
              </p>

              {/* Compact success details */}
              <Card className="bg-white/80 backdrop-blur-sm p-4 sm:p-6 mb-4 sm:mb-6 border-0 shadow-lg rounded-xl">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm sm:text-base">
                    <span className="text-gray-600">Activation Fee:</span>
                    <span className="font-bold text-emerald-600">KSh {activationFee}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm sm:text-base">
                    <span className="text-gray-600">Charged to:</span>
                    <span className="font-medium text-gray-800">{phoneNumber}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm sm:text-base">
                    <span className="text-gray-600">Status:</span>
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Active
                    </span>
                  </div>
                </div>
              </Card>

              <Button
                onClick={() => {
                  onSuccess();
                  onOpenChange(false);
                }}
                className="w-full h-12 sm:h-14 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold text-sm sm:text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 touch-manipulation active:scale-95"
              >
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Start Earning Now
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md mx-auto p-0 overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 border-0 shadow-2xl rounded-2xl sm:rounded-3xl max-h-[90vh] overflow-y-auto overscroll-contain touch-pan-y">
        <div className="relative">
          {/* Animated background elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-indigo-500/5" />
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-400/20 to-transparent rounded-full blur-xl" />
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-purple-400/20 to-transparent rounded-full blur-xl" />
          
          <div className="relative z-10 p-4 sm:p-6">
            {/* Modern header with icon */}
            <div className="text-center mb-4 sm:mb-6">
              <div className="relative mx-auto mb-3 sm:mb-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center">
                  <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                </div>
              </div>
              
              <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Account Activation
              </h2>
              <p className="text-gray-600 text-xs sm:text-sm px-2">
                One-time fee to enable M-Pesa withdrawals
              </p>
            </div>

            {/* Compact fee display */}
            <div className="text-center mb-4 sm:mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full border-4 border-blue-200 mb-3">
                <span className="text-2xl sm:text-3xl font-bold text-blue-600">{activationFee}</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600">KSh activation fee</p>
            </div>

            {/* Compact breakdown */}
            <Card className="bg-white/80 backdrop-blur-sm p-3 sm:p-4 mb-4 sm:mb-6 border-0 shadow-md rounded-xl">
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Verification</span>
                  <span className="font-medium">KSh 100</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">M-Pesa setup</span>
                  <span className="font-medium">KSh 40</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Security</span>
                  <span className="font-medium">KSh 10</span>
                </div>
                <hr className="border-gray-200 my-2" />
                <div className="flex justify-between items-center font-semibold text-sm sm:text-base">
                  <span>Total</span>
                  <span className="text-blue-600">KSh {activationFee}</span>
                </div>
              </div>
            </Card>

            {/* Phone input */}
            <div className="mb-4 sm:mb-6">
              <Label htmlFor="activation-phone" className="text-sm sm:text-base font-semibold mb-2 block text-gray-800">
                M-Pesa Phone Number
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <Smartphone className="w-3 h-3 text-green-600" />
                </div>
                <Input
                  id="activation-phone"
                  type="tel"
                  placeholder="07XXXXXXXX or 01XXXXXXXX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="pl-12 h-11 sm:h-12 text-sm sm:text-base border-2 border-gray-200 focus:border-blue-500 transition-colors rounded-xl bg-gray-50/50 backdrop-blur-sm"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1 px-1">
                Fee will be charged to this number
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-xs sm:text-sm text-center">{error}</p>
              </div>
            )}

            {/* Compact security badges */}
            <div className="flex gap-2 mb-4 sm:mb-6">
              <div className="flex-1 bg-blue-50 p-2 sm:p-3 rounded-xl border border-blue-100">
                <div className="text-center">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 text-blue-600" />
                  <p className="text-xs font-medium text-blue-800">Secure</p>
                  <p className="text-xs text-blue-600">256-bit</p>
                </div>
              </div>
              
              <div className="flex-1 bg-green-50 p-2 sm:p-3 rounded-xl border border-green-100">
                <div className="text-center">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 text-green-600" />
                  <p className="text-xs font-medium text-green-800">Verified</p>
                  <p className="text-xs text-green-600">After confirmation</p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-2 sm:space-y-3">
              <Button
                onClick={handleActivate}
                disabled={isProcessing || !phoneNumber}
                className="w-full h-11 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold text-sm sm:text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 touch-manipulation active:scale-95"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                    <span className="text-xs sm:text-sm">{statusMessage || 'Processing...'}</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    <span className="text-xs sm:text-sm">Pay KSh {activationFee} & Activate</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                  </>
                )}
              </Button>
              
              <Button
                onClick={() => onOpenChange(false)}
                variant="outline"
                className="w-full h-10 sm:h-11 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl text-xs sm:text-sm touch-manipulation active:scale-95"
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
