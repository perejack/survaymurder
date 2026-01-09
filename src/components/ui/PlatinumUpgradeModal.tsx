import React, { useState } from 'react';
import { Crown, Zap, DollarSign, Clock, CheckCircle, ArrowRight, Sparkles, Star, Shield, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { initiatePayment, validatePhoneNumber } from '@/utils/paymentService';

interface PlatinumUpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpgradeSuccess: () => void;
  onWithdrawalSuccess?: (amount: number, phoneNumber: string) => void;
}

const PlatinumUpgradeModal = ({ 
  open, 
  onOpenChange, 
  onUpgradeSuccess,
  onWithdrawalSuccess
}: PlatinumUpgradeModalProps) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');
  const { toast } = useToast();

  const upgradePrice = 500; // KSh 500 for platinum upgrade

  const handleUpgrade = async () => {
    if (!phoneNumber) {
      setError("Please enter your M-Pesa phone number.");
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setError("Please enter a valid Kenyan phone number.");
      return;
    }

    setIsProcessing(true);
    setStatusMessage('Processing upgrade payment...');
    setError('');

    try {
      const paymentResponse = await initiatePayment(phoneNumber, upgradePrice, 'Platinum Account Upgrade');
      
      if (paymentResponse.success && paymentResponse.data) {
        const requestId = paymentResponse.data.checkoutRequestId || paymentResponse.data.externalReference;
        setStatusMessage('STK Push sent. Please complete payment on your phone.');
        
        // Start polling for payment status
        pollPaymentStatusReal(requestId);
      } else {
        throw new Error(paymentResponse.message || 'Failed to initiate payment');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      setError(error.message || 'Failed to initiate payment');
      setIsProcessing(false);
      setStatusMessage('');
    }
  };

  const pollPaymentStatusReal = async (requestId: string) => {
    let attempts = 0;
    const maxAttempts = 50;
    
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/payment-status?reference=${requestId}`);
        const data = await response.json();
        
        if (data.success && data.payment) {
          if (data.payment.status === 'SUCCESS') {
            setIsProcessing(false);
            setIsComplete(true);
            setStatusMessage('Upgrade successful! Welcome to Platinum!');
            
            // Show success for a moment before triggering withdrawal success
            setTimeout(() => {
              onUpgradeSuccess();
              onOpenChange(false);
              
              // Trigger withdrawal success modal instead of withdrawal prompt
              if (onWithdrawalSuccess) {
                onWithdrawalSuccess(1000, phoneNumber); // Show success for the original withdrawal amount
              }
              
              setIsComplete(false);
              setIsProcessing(false);
              setPhoneNumber('');
              setStatusMessage('');
            }, 2000);
          } else if (data.payment.status === 'FAILED') {
            throw new Error(data.payment.resultDesc || 'Payment canceled by user');
          }
        }
        
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 500);
        } else {
          throw new Error('Payment timeout - please try again');
        }
      } catch (error: any) {
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
        <DialogContent className="w-[95vw] max-w-[420px] p-0 overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 border-0 shadow-2xl rounded-2xl sm:rounded-3xl">
          <DialogDescription className="sr-only">
            Platinum upgrade successful confirmation
          </DialogDescription>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-yellow-500/5" />
            
            <div className="relative z-10 p-4 sm:p-6 text-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <Crown className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
              </div>
              
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                Welcome to Platinum! 👑
              </h2>
              <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base px-2">
                Your account has been upgraded successfully. Enjoy premium benefits!
              </p>

              <div className="grid grid-cols-1 gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3 bg-white/60 rounded-lg p-2 sm:p-3">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium">Full withdrawals available once eligible</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 bg-white/60 rounded-lg p-2 sm:p-3">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium">Higher withdrawal limits (subject to eligibility)</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 bg-white/60 rounded-lg p-2 sm:p-3">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium">Access to premium tasks (earnings vary)</span>
                </div>
              </div>

              <Button
                onClick={() => {
                  onUpgradeSuccess();
                  onOpenChange(false);
                }}
                size="lg"
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 sm:py-6 text-base sm:text-lg h-12 sm:h-auto touch-manipulation active:scale-95 transition-transform"
              >
                Start Using Platinum Benefits
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
      <DialogContent className="w-[95vw] max-w-[480px] p-0 overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 border-0 shadow-2xl rounded-2xl sm:rounded-3xl max-h-[90vh] overflow-y-auto">
        <DialogDescription className="sr-only">
          Upgrade to Platinum membership for more surveys and exclusive benefits
        </DialogDescription>
        <div className="relative">
          {/* Background decorative elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-yellow-500/5" />
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-purple-400/10 to-transparent rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-pink-400/10 to-transparent rounded-full blur-xl" />
          
          <div className="relative z-10 p-4 sm:p-6">
            {/* Header */}
            <div className="text-center mb-4 sm:mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <Crown className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                <span>Upgrade to Platinum 👑</span>
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">PREMIUM</Badge>
              </h2>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base px-2">
                Unlock higher withdrawal limits and premium earning opportunities
              </p>
            </div>

            {/* Price Card */}
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 sm:p-6 mb-4 sm:mb-6 border-2 border-purple-200 shadow-lg">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-purple-600 mb-2">
                  KSh {upgradePrice.toLocaleString()}
                </div>
                <div className="text-xs sm:text-sm text-purple-700">One-time upgrade fee</div>
              </div>
            </Card>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 sm:p-4 border border-green-200 shadow-md">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-green-800 text-sm sm:text-base">Full withdrawals once eligible</h3>
                    <p className="text-xs sm:text-sm text-green-700">Eligibility and limits may apply</p>
                  </div>
                </div>
              </Card>

              <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 p-3 sm:p-4 border border-blue-200 shadow-md">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-blue-800 text-sm sm:text-base">Enhanced Limits</h3>
                    <p className="text-xs sm:text-sm text-blue-700">Higher withdrawal limits (subject to eligibility and availability)</p>
                  </div>
                </div>
              </Card>

              <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 p-3 sm:p-4 border border-orange-200 shadow-md">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Star className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-orange-800 text-sm sm:text-base">Premium Tasks</h3>
                    <p className="text-xs sm:text-sm text-orange-700">Access to higher value tasks (earnings and availability vary)</p>
                  </div>
                </div>
              </Card>

              <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 p-3 sm:p-4 border border-indigo-200 shadow-md">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-indigo-800 text-sm sm:text-base">Priority Support</h3>
                    <p className="text-xs sm:text-sm text-indigo-700">24/7 premium customer service</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Phone number input */}
            <div className="mb-4 sm:mb-6">
              <Label htmlFor="upgrade-phone" className="text-sm sm:text-base font-semibold mb-2 sm:mb-3 block text-gray-800">
                M-Pesa Phone Number
              </Label>
              <div className="relative">
                <Input
                  id="upgrade-phone"
                  type="tel"
                  placeholder="07XXXXXXXX or 01XXXXXXXX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="h-10 sm:h-12 text-sm sm:text-base border-2 border-purple-200 focus:border-purple-500 transition-colors rounded-xl bg-purple-50/30"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                The upgrade fee will be charged to this number
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 sm:space-y-3">
              <Button
                onClick={handleUpgrade}
                disabled={isProcessing || !phoneNumber}
                size="lg"
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 sm:py-4 text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-300 h-12 sm:h-auto touch-manipulation active:scale-95"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                    <span className="text-xs sm:text-sm">{statusMessage || 'Processing Upgrade...'}</span>
                  </>
                ) : (
                  <>
                    <Crown className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    <span className="text-xs sm:text-sm">Upgrade to Platinum - KSh {upgradePrice}</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                  </>
                )}
              </Button>
              
              <Button
                onClick={() => onOpenChange(false)}
                variant="outline"
                size="lg"
                className="w-full border-2 border-purple-300 text-purple-700 hover:bg-purple-50 h-10 sm:h-12 text-sm sm:text-base touch-manipulation active:scale-95 transition-transform"
                disabled={isProcessing}
              >
                Maybe Later
              </Button>
            </div>

            {/* Value proposition */}
            <div className="text-center mt-3 sm:mt-4 p-2 sm:p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
              <p className="text-xs text-purple-800">
                💎 <span className="font-semibold">Limited Time:</span> Upgrade now and start earning more with premium tasks and higher withdrawal limits!
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlatinumUpgradeModal;
