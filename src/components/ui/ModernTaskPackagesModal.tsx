import React, { useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package, Zap, Crown, CheckCircle, Smartphone, Loader2, Star, Trophy, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { initiatePayment, validatePhoneNumber } from "@/utils/paymentService";

interface ModernTaskPackagesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPurchaseSuccess: (packageType: 'basic' | 'pro') => void;
}

const ModernTaskPackagesModal = ({ 
  open, 
  onOpenChange, 
  onPurchaseSuccess
}: ModernTaskPackagesModalProps) => {
  const [selectedPackage, setSelectedPackage] = useState<'basic' | 'pro' | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');
  const { toast } = useToast();

  const packages = [
    {
      id: 'basic' as const,
      name: 'Basic Pack',
      price: 250,
      tasks: 10,
      earnings: 'Varies',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-50 to-cyan-50',
      borderColor: 'border-blue-200',
      icon: Package,
      features: [
        '10 Premium Surveys',
        'Quick Access',
        'Higher Payouts',
        '24/7 Support'
      ]
    },
    {
      id: 'pro' as const,
      name: 'Pro Pack',
      price: 350,
      tasks: 20,
      earnings: 'Varies',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'from-purple-50 to-pink-50',
      borderColor: 'border-purple-200',
      icon: Crown,
      popular: true,
      features: [
        '20 Premium Surveys',
        'Priority Access',
        'Maximum Payouts',
        'Bonus Rewards',
        'VIP Support'
      ]
    }
  ];

  const handlePurchase = async (pkg: typeof packages[0]) => {
    if (!phoneNumber) {
      setError("Please enter your phone number");
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setError("Please enter a valid Kenyan phone number.");
      return;
    }

    setSelectedPackage(pkg.id);
    setIsProcessing(true);
    setStatusMessage('Processing package purchase...');
    setError('');

    try {
      const paymentResponse = await initiatePayment(phoneNumber, pkg.price, `${pkg.name} Purchase`);
      
      if (paymentResponse.success && paymentResponse.data) {
        const requestId = paymentResponse.data.checkoutRequestId || paymentResponse.data.externalReference;
        setStatusMessage('STK Push sent. Please complete payment on your phone.');
        
        // Start polling for payment status
        pollPaymentStatusReal(requestId, pkg);
      } else {
        throw new Error(paymentResponse.message || 'Failed to initiate payment');
      }
    } catch (error) {
      setIsProcessing(false);
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      setError(errorMessage);
      setStatusMessage('');
      toast({
        title: "Payment Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const pollPaymentStatusReal = async (requestId: string, pkg: typeof packages[0]) => {
    let attempts = 0;
    const maxAttempts = 60; // 30 seconds

    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/payment-status?reference=${requestId}`);
        const data = await response.json();
        
        if (data.success && data.payment) {
          if (data.payment.status === 'SUCCESS') {
            setIsProcessing(false);
            setStatusMessage('Package activated successfully!');
            
            setTimeout(() => {
              onPurchaseSuccess(pkg.id);
              onOpenChange(false);
              setIsProcessing(false);
              setSelectedPackage(null);
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
      } catch (error) {
        setIsProcessing(false);
        const errorMessage = error instanceof Error ? error.message : 'Payment verification failed';
        setError(errorMessage);
        setStatusMessage('');
        toast({
          title: "Payment Failed",
          description: errorMessage,
          variant: "destructive"
        });
      }
    };

    checkStatus();
  };

  if (isProcessing) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[95vw] max-w-md mx-auto bg-white rounded-2xl sm:rounded-3xl shadow-2xl border-0 p-0 overflow-hidden">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50"></div>
            
            <div className="relative z-10 p-4 sm:p-8 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-white animate-spin" />
              </div>
              
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
                Processing Purchase
              </h2>
              <p className="text-gray-600 mb-4 sm:mb-6 text-sm px-2">
                {statusMessage}
              </p>

              {selectedPackage && (
                <Card className="bg-white/60 p-3 sm:p-4 mb-3 sm:mb-4 mx-2 sm:mx-0">
                  <div className="text-center">
                    <div className="font-semibold text-gray-800 text-sm sm:text-base">
                      {packages.find(p => p.id === selectedPackage)?.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      KSh {packages.find(p => p.id === selectedPackage)?.price}
                    </div>
                  </div>
                </Card>
              )}

              <div className="text-center p-2 sm:p-3 bg-blue-50 rounded-lg border border-blue-200 mx-2 sm:mx-0">
                <p className="text-xs text-blue-800 px-1">
                  📱 Please check your phone and enter your M-Pesa PIN to complete the purchase.
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl mx-auto bg-white rounded-2xl sm:rounded-3xl shadow-2xl border-0 p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="relative">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-purple-50 to-pink-50"></div>
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-orange-400/20 to-transparent rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-400/20 to-transparent rounded-full blur-xl animate-pulse"></div>

          {/* Header */}
          <div className="relative z-10 text-center p-4 sm:p-6 pb-3 sm:pb-4">
            <div className="flex justify-center mb-3 sm:mb-4">
              <div className="bg-gradient-to-r from-orange-500 to-yellow-600 rounded-full p-3 sm:p-4 shadow-lg animate-bounce">
                <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
              🚀 Unlock More Tasks
            </h2>
            <p className="text-gray-600 text-sm px-2">
              Don't wait! Unlock premium task packages and keep earning
            </p>
          </div>

          {/* Content */}
          <div className="relative z-10 px-4 sm:px-6 pb-4 sm:pb-6">
            {/* Package Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
              {packages.map((pkg) => {
                const IconComponent = pkg.icon;
                return (
                  <Card 
                    key={pkg.id}
                    className={`relative bg-gradient-to-br ${pkg.bgColor} border-2 ${pkg.borderColor} shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer touch-manipulation ${selectedPackage === pkg.id ? 'ring-2 sm:ring-4 ring-orange-300' : ''}`}
                    onClick={() => setSelectedPackage(pkg.id)}
                  >
                    {pkg.popular && (
                      <div className="absolute -top-2 sm:-top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 sm:px-3 py-1 shadow-lg text-xs">
                          🔥 POPULAR
                        </Badge>
                      </div>
                    )}
                    
                    <div className="p-4 sm:p-6">
                      <div className="text-center mb-3 sm:mb-4">
                        <div className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-3 bg-gradient-to-r ${pkg.color} rounded-full flex items-center justify-center shadow-lg`}>
                          <IconComponent className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">{pkg.name}</h3>
                        <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">KSh {pkg.price}</div>
                        <div className="text-xs sm:text-sm text-gray-600">{pkg.tasks} premium tasks</div>
                        <div className="text-xs sm:text-sm font-semibold text-green-600">Earn {pkg.earnings}</div>
                      </div>

                      <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
                        {pkg.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                            <span className="text-xs sm:text-sm text-gray-700">{feature}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-center">
                        {selectedPackage === pkg.id ? (
                          <div className="flex items-center gap-2 text-orange-600">
                            <Target className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="font-semibold text-sm">Selected</span>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-xs sm:text-sm">Tap to select</span>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Phone Number Input */}
            {selectedPackage && (
              <Card className="bg-white/80 p-3 sm:p-4 mb-3 sm:mb-4 border-2 border-orange-200">
                <div className="space-y-3">
                  <Label htmlFor="phone" className="text-sm font-semibold text-gray-800">
                    M-Pesa Phone Number
                  </Label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="0712345678"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="pl-9 sm:pl-10 border-2 border-orange-200 focus:border-orange-400 h-12 touch-manipulation"
                      inputMode="tel"
                    />
                  </div>
                  {error && (
                    <p className="text-sm text-red-600">{error}</p>
                  )}
                </div>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 sm:space-y-3">
              {selectedPackage && (
                <Button
                  onClick={() => {
                    const pkg = packages.find(p => p.id === selectedPackage);
                    if (pkg) handlePurchase(pkg);
                  }}
                  size="lg"
                  className="w-full bg-gradient-to-r from-orange-500 to-yellow-600 hover:from-orange-600 hover:to-yellow-700 text-white font-semibold py-3 sm:py-4 text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-300 touch-manipulation active:scale-95 h-12 sm:h-auto"
                  disabled={!phoneNumber}
                >
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  <span className="truncate">Purchase {packages.find(p => p.id === selectedPackage)?.name} - KSh {packages.find(p => p.id === selectedPackage)?.price}</span>
                </Button>
              )}
              
              <Button
                onClick={() => onOpenChange(false)}
                variant="outline"
                size="lg"
                className="w-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3 sm:py-4 text-sm sm:text-base touch-manipulation h-12 sm:h-auto"
              >
                Maybe Later
              </Button>
            </div>

            {/* Footer Benefits */}
            <div className="grid grid-cols-3 gap-2 mt-4 sm:mt-6">
              <div className="text-center p-2 sm:p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 text-green-600" />
                <p className="text-xs font-semibold text-green-800">Quick</p>
                <p className="text-xs text-green-600">Access</p>
              </div>
              <div className="text-center p-2 sm:p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                <Star className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 text-blue-600" />
                <p className="text-xs font-semibold text-blue-800">Premium</p>
                <p className="text-xs text-blue-600">Quality</p>
              </div>
              <div className="text-center p-2 sm:p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 text-purple-600" />
                <p className="text-xs font-semibold text-purple-800">Higher</p>
                <p className="text-xs text-purple-600">Payouts</p>
              </div>
            </div>

            {/* Disclaimer */}
            <p className="text-[10px] sm:text-xs text-gray-500 text-center mt-3 sm:mt-4">
              Earnings and task availability vary by profile, location, and inventory. No guarantee of income. Withdrawal eligibility and limits may apply.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModernTaskPackagesModal;
