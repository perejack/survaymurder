import { useState } from 'react';
import { CreditCard, Smartphone, Shield, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
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
  const { toast } = useToast();

  const handleActivate = async () => {
    if (!phoneNumber) {
      toast({
        title: "Phone Number Required",
        description: "Please enter your M-Pesa phone number.",
        variant: "destructive"
      });
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid Kenyan phone number.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setStatusMessage('Initiating payment...');

    try {
      // Initiate STK Push payment
      const paymentResponse = await initiatePayment(phoneNumber, 150, 'EarnSpark Account Activation');
      
      if (paymentResponse.success && paymentResponse.data?.externalReference) {
        setPaymentReference(paymentResponse.data.externalReference);
        setStatusMessage('STK Push sent. Please complete payment on your phone.');
        
        // Start polling for payment status
        const stopPolling = pollPaymentStatus(
          paymentResponse.data.externalReference,
          (status: PaymentStatus) => {
            if (status.success && status.payment) {
              if (status.payment.status === 'SUCCESS') {
                setIsProcessing(false);
                setIsComplete(true);
                setStatusMessage('Payment successful! Account activated.');
                toast({
                  title: "Payment Successful!",
                  description: "Your account is now active. You can withdraw to M-Pesa.",
                });
              } else if (status.payment.status === 'FAILED') {
                setIsProcessing(false);
                setStatusMessage('Payment failed. Please try again.');
                toast({
                  title: "Payment Failed",
                  description: status.payment.resultDesc || "Please try again.",
                  variant: "destructive"
                });
              } else {
                setStatusMessage('Waiting for payment confirmation...');
              }
            } else if (!status.success) {
              setIsProcessing(false);
              setStatusMessage('Payment status check failed.');
              toast({
                title: "Error",
                description: status.message || "Failed to check payment status.",
                variant: "destructive"
              });
            }
          }
        );
        
        // Cleanup polling on component unmount
        return () => stopPolling();
      } else {
        setIsProcessing(false);
        setStatusMessage('Failed to initiate payment.');
        toast({
          title: "Payment Failed",
          description: paymentResponse.message || "Failed to initiate payment.",
          variant: "destructive"
        });
      }
    } catch (error) {
      setIsProcessing(false);
      setStatusMessage('Network error occurred.');
      toast({
        title: "Network Error",
        description: "Please check your connection and try again.",
        variant: "destructive"
      });
    }
  };

  if (isComplete) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[95vw] max-w-[420px] p-0 overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-0 shadow-2xl">
          <DialogTitle className="sr-only">Account Activation Successful</DialogTitle>
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
      <DialogContent className="w-[95vw] max-w-[420px] p-0 overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 border-0 shadow-2xl">
        <DialogTitle className="sr-only">Account Activation Fee Payment</DialogTitle>
        <div className="relative">
          {/* Background decorative elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-orange-500/5 to-red-500/5" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-orange-400/10 to-transparent rounded-full blur-xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-red-400/10 to-transparent rounded-full blur-xl" />
          
          <div className="relative z-10 p-6">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Account Activation Fee 💳
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                A one-time activation fee is required to enable M-Pesa withdrawals
              </p>
            </div>

            {/* Fee breakdown */}
            <Card className="gradient-card p-6 mb-6 border-0 shadow-lg">
              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-orange-600 mb-2">
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
                <hr className="border-gray-200" />
                <div className="flex items-center justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-orange-600">KSh 150</span>
                </div>
              </div>
            </Card>

            {/* Phone number input */}
            <div className="mb-6">
              <Label htmlFor="activation-phone" className="text-base font-semibold mb-3 block">
                M-Pesa Phone Number
              </Label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="activation-phone"
                  type="tel"
                  placeholder="07XXXXXXXX or 01XXXXXXXX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="pl-12 h-12 text-base border-2 border-gray-200 focus:border-orange-500 transition-colors"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                The activation fee will be charged to this number
              </p>
            </div>

            {/* Security features */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <Card className="gradient-card p-3 border-0 shadow-sm">
                <div className="text-center">
                  <Shield className="w-6 h-6 mx-auto mb-1 text-blue-600" />
                  <p className="text-xs font-medium text-gray-800">Secure</p>
                  <p className="text-xs text-gray-600">256-bit encryption</p>
                </div>
              </Card>
              
              <Card className="gradient-card p-3 border-0 shadow-sm">
                <div className="text-center">
                  <CheckCircle className="w-6 h-6 mx-auto mb-1 text-green-600" />
                  <p className="text-xs font-medium text-gray-800">Verified</p>
                  <p className="text-xs text-gray-600">Instant activation</p>
                </div>
              </Card>
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleActivate}
                disabled={isProcessing || !phoneNumber}
                size="lg"
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-6 text-lg hover-bounce"
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
                className="w-full"
                disabled={isProcessing}
              >
                Cancel
              </Button>
            </div>

            {/* Terms */}
            <div className="text-center mt-4">
              <p className="text-xs text-gray-500">
                By activating, you agree to our Terms of Service • Secure M-Pesa payment
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ActivationFeeModal;
