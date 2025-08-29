import React, { useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package, Zap, Crown, CheckCircle, Smartphone, Loader2, Star, Trophy, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { initiatePayment, pollPaymentStatus, validatePhoneNumber } from "@/utils/paymentService";

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
      earnings: '~KSh 200',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-50 to-cyan-50',
      borderColor: 'border-blue-200',
      icon: Package,
      features: [
        '10 Premium Surveys',
        'Instant Access',
        'Higher Payouts',
        '24/7 Support'
      ]
    },
    {
      id: 'pro' as const,
      name: 'Pro Pack',
      price: 350,
      tasks: 20,
      earnings: '~KSh 350',
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
      const paymentResponse = await initiatePayment(phoneNumber, 20, `${pkg.name} Purchase`); // Testing: Always use 20 KES
      
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
        const response = await fetch(`/.netlify/functions/payment-status/${requestId}`);
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
        <DialogContent className="sm:max-w-md mx-auto bg-white rounded-3xl shadow-2xl border-0 p-0 overflow-hidden">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50"></div>
            
            <div className="relative z-10 p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                <Loader2 className="w-10 h-10 text-white animate-spin" />
              </div>
              
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Processing Purchase
              </h2>
              <p className="text-gray-600 mb-6">
                {statusMessage}
              </p>

              {selectedPackage && (
                <Card className="bg-white/60 p-4 mb-4">
                  <div className="text-center">
                    <div className="font-semibold text-gray-800">
                      {packages.find(p => p.id === selectedPackage)?.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      KSh {packages.find(p => p.id === selectedPackage)?.price}
                    </div>
                  </div>
                </Card>
              )}

              <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-800">
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
      <DialogContent className="sm:max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl border-0 p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="relative">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-purple-50 to-pink-50"></div>
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-orange-400/20 to-transparent rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-400/20 to-transparent rounded-full blur-xl animate-pulse"></div>

          {/* Header */}
          <div className="relative z-10 text-center p-6 pb-4">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-r from-orange-500 to-yellow-600 rounded-full p-4 shadow-lg animate-bounce">
                <Zap className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              🚀 Unlock More Tasks
            </h2>
            <p className="text-gray-600 text-sm">
              Don't wait! Unlock premium task packages and keep earning
            </p>
          </div>

          {/* Content */}
          <div className="relative z-10 px-6 pb-6">
            {/* Package Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {packages.map((pkg) => {
                const IconComponent = pkg.icon;
                return (
                  <Card 
                    key={pkg.id}
                    className={`relative bg-gradient-to-br ${pkg.bgColor} border-2 ${pkg.borderColor} shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer ${selectedPackage === pkg.id ? 'ring-4 ring-orange-300' : ''}`}
                    onClick={() => setSelectedPackage(pkg.id)}
                  >
                    {pkg.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 shadow-lg">
                          🔥 POPULAR
                        </Badge>
                      </div>
                    )}
                    
                    <div className="p-6">
                      <div className="text-center mb-4">
                        <div className={`w-16 h-16 mx-auto mb-3 bg-gradient-to-r ${pkg.color} rounded-full flex items-center justify-center shadow-lg`}>
                          <IconComponent className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-1">{pkg.name}</h3>
                        <div className="text-3xl font-bold text-gray-900 mb-1">KSh {pkg.price}</div>
                        <div className="text-sm text-gray-600">{pkg.tasks} premium tasks</div>
                        <div className="text-sm font-semibold text-green-600">Earn {pkg.earnings}</div>
                      </div>

                      <div className="space-y-2 mb-4">
                        {pkg.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-gray-700">{feature}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-center">
                        {selectedPackage === pkg.id ? (
                          <div className="flex items-center gap-2 text-orange-600">
                            <Target className="w-5 h-5" />
                            <span className="font-semibold">Selected</span>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-sm">Click to select</span>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Phone Number Input */}
            {selectedPackage && (
              <Card className="bg-white/80 p-4 mb-4 border-2 border-orange-200">
                <div className="space-y-3">
                  <Label htmlFor="phone" className="text-sm font-semibold text-gray-800">
                    M-Pesa Phone Number
                  </Label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="0712345678"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="pl-10 border-2 border-orange-200 focus:border-orange-400"
                    />
                  </div>
                  {error && (
                    <p className="text-sm text-red-600">{error}</p>
                  )}
                </div>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {selectedPackage && (
                <Button
                  onClick={() => {
                    const pkg = packages.find(p => p.id === selectedPackage);
                    if (pkg) handlePurchase(pkg);
                  }}
                  size="lg"
                  className="w-full bg-gradient-to-r from-orange-500 to-yellow-600 hover:from-orange-600 hover:to-yellow-700 text-white font-semibold py-4 text-base shadow-lg hover:shadow-xl transition-all duration-300"
                  disabled={!phoneNumber}
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Purchase {packages.find(p => p.id === selectedPackage)?.name} - KSh {packages.find(p => p.id === selectedPackage)?.price}
                </Button>
              )}
              
              <Button
                onClick={() => onOpenChange(false)}
                variant="outline"
                size="lg"
                className="w-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-4 text-base"
              >
                Maybe Later
              </Button>
            </div>

            {/* Footer Benefits */}
            <div className="grid grid-cols-3 gap-2 mt-6">
              <div className="text-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <Trophy className="w-6 h-6 mx-auto mb-1 text-green-600" />
                <p className="text-xs font-semibold text-green-800">Instant</p>
                <p className="text-xs text-green-600">Access</p>
              </div>
              <div className="text-center p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                <Star className="w-6 h-6 mx-auto mb-1 text-blue-600" />
                <p className="text-xs font-semibold text-blue-800">Premium</p>
                <p className="text-xs text-blue-600">Quality</p>
              </div>
              <div className="text-center p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                <Zap className="w-6 h-6 mx-auto mb-1 text-purple-600" />
                <p className="text-xs font-semibold text-purple-800">Higher</p>
                <p className="text-xs text-purple-600">Payouts</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModernTaskPackagesModal;
