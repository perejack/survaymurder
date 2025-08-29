import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package, Zap, DollarSign, CheckCircle, ArrowRight, Sparkles, Crown, Loader2, CreditCard, Star, Shield, Trophy, Infinity } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { initiatePayment, pollPaymentStatus, validatePhoneNumber } from '../../utils/paymentService';

interface PremiumTaskPackagesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPurchaseSuccess: (packageType: 'basic' | 'pro') => void;
}

const PremiumTaskPackagesModal = ({ 
  open, 
  onOpenChange, 
  onPurchaseSuccess 
}: PremiumTaskPackagesModalProps) => {
  const [selectedPackage, setSelectedPackage] = useState<'basic' | 'pro' | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const { toast } = useToast();

  const packages = {
    basic: {
      name: 'Basic Package',
      price: 250,
      tasks: 10,
      perTask: 250,
      totalEarning: 2500,
      dailyLimit: 5000,
      features: [
        '10 Additional Tasks',
        '250 KSH per task',
        'Up to 5,000 KSH daily earning',
        'Instant M-Pesa withdrawal',
        'Valid for 24 hours'
      ],
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-50 to-cyan-50',
      icon: Package
    },
    pro: {
      name: 'Pro Package',
      price: 350,
      tasks: 20,
      perTask: 250,
      totalEarning: 5000,
      dailyLimit: 'unlimited',
      features: [
        '20 Additional Tasks',
        '250 KSH per task',
        'Unlimited daily earning',
        'No withdrawal limits',
        'Instant M-Pesa withdrawal',
        'Priority support',
        'Valid for 24 hours'
      ],
      color: 'from-purple-500 to-pink-500',
      bgColor: 'from-purple-50 to-pink-50',
      icon: Crown,
      popular: true
    }
  };

  const handlePurchase = async (packageType: 'basic' | 'pro') => {
    if (!validatePhoneNumber(phoneNumber)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid Kenyan phone number (07XXXXXXXX or 01XXXXXXXX)",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Use 20 KSH for testing STK push while keeping UI display at original price
      const testAmount = 20;
      const displayAmount = packages[packageType].price;
      const description = `${packages[packageType].name} - ${packages[packageType].tasks} tasks (Test: KSH ${testAmount})`;
      
      const paymentResult = await initiatePayment(phoneNumber, testAmount, description);
      
      if (paymentResult.success && paymentResult.data?.checkoutRequestId) {
        toast({
          title: "STK Push Sent! 📱",
          description: "Check your phone and enter your M-Pesa PIN to complete payment",
        });
        
        // Start real payment status polling
        const cleanup = pollPaymentStatus(
          paymentResult.data.checkoutRequestId,
          (status) => {
            if (status.success && status.payment) {
              if (status.payment.status === 'SUCCESS') {
                setIsProcessing(false);
                setIsComplete(true);
                setSelectedPackage(packageType);
                onPurchaseSuccess(packageType);
                
                toast({
                  title: "Payment Successful! 🎉",
                  description: `${packages[packageType].name} activated! You can now complete more tasks.`,
                });
                
                // Auto-redirect after 2 seconds
                setTimeout(() => {
                  onOpenChange(false);
                }, 2000);
              } else if (status.payment.status === 'FAILED') {
                setIsProcessing(false);
                toast({
                  title: "Payment Failed",
                  description: status.payment.resultDesc || "Payment was not completed. Please try again.",
                  variant: "destructive",
                });
              }
            } else if (!status.success && status.message) {
              setIsProcessing(false);
              toast({
                title: "Payment Error",
                description: status.message,
                variant: "destructive",
              });
            }
          }
        );
        
        // Cleanup polling if component unmounts
        return cleanup;
        
      } else {
        throw new Error(paymentResult.message || 'Payment initiation failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  if (isComplete && selectedPackage) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[95vw] max-w-[420px] p-0 overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-0 shadow-2xl">
          <DialogDescription className="sr-only">
            Task package purchase successful confirmation
          </DialogDescription>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-emerald-500/5 to-teal-500/5" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-green-400/20 to-transparent rounded-full blur-2xl animate-pulse" />
            
            <div className="relative z-10 p-8 text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <Trophy className="w-12 h-12 text-white" />
              </div>
              
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                🎉 Package Activated!
              </h2>
              
              <p className="text-gray-600 mb-6">
                Your <span className="font-bold text-green-600">{packages[selectedPackage].name}</span> is now active!
              </p>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-green-200">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{packages[selectedPackage].tasks}</div>
                    <div className="text-sm text-gray-600">Additional Tasks</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{packages[selectedPackage].totalEarning.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Max Earning (KSH)</div>
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={() => onOpenChange(false)}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg"
              >
                Start Earning Now! 🚀
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (isProcessing) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[95vw] max-w-[420px] p-0 overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-0 shadow-2xl">
          <DialogDescription className="sr-only">
            Processing task package payment
          </DialogDescription>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5" />
            
            <div className="relative z-10 p-8 text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <Loader2 className="w-12 h-12 text-white animate-spin" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Processing Payment...
              </h2>
              
              <p className="text-gray-600 mb-4">
                Please complete the M-Pesa payment on your phone
              </p>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-blue-200">
                <p className="text-sm text-gray-700">
                  Check your phone for the M-Pesa prompt and enter your PIN to complete the payment.
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
      <DialogContent className="w-[98vw] max-w-[420px] sm:max-w-[600px] p-0 overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 border-0 shadow-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto mx-2 sm:mx-auto">
        <DialogDescription className="sr-only">
          Purchase premium task packages to unlock additional daily surveys and earning opportunities
        </DialogDescription>
        <div className="relative">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5" />
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-blue-400/10 to-transparent rounded-full blur-2xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-400/10 to-transparent rounded-full blur-xl animate-pulse" />
          
          <div className="relative z-10 p-3 sm:p-6">
            {/* Header */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                🚀 Unlock More Tasks
              </h2>
              <p className="text-gray-600 text-base sm:text-lg px-2">
                Choose your premium package and start earning more!
              </p>
            </div>

            {/* Package Cards */}
            <div className="grid gap-4 sm:gap-6 mb-6 sm:mb-8">
              {Object.entries(packages).map(([key, pkg]) => {
                const IconComponent = pkg.icon;
                const isSelected = selectedPackage === key;
                
                return (
                  <Card 
                    key={key}
                    className={`relative overflow-hidden border-2 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
                      isSelected 
                        ? 'border-orange-400 shadow-lg ring-2 ring-orange-200' 
                        : 'border-gray-200 hover:border-orange-300'
                    }`}
                    onClick={() => setSelectedPackage(key as 'basic' | 'pro')}
                  >
                    {(pkg as any).popular && (
                      <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 sm:px-3 py-1 text-xs font-bold rounded-bl-lg">
                        ⭐ POPULAR
                      </div>
                    )}
                    
                    <div className={`bg-gradient-to-br ${pkg.bgColor} p-4 sm:p-6`}>
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-3 sm:gap-0">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${pkg.color} rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}>
                            <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-800 leading-tight">{pkg.name}</h3>
                            <p className="text-sm sm:text-base text-gray-600">{pkg.tasks} additional tasks</p>
                          </div>
                        </div>
                        <div className="text-left sm:text-right flex-shrink-0">
                          <div className="text-xl sm:text-2xl font-bold text-gray-800">KSH {pkg.price}</div>
                          <div className="text-xs sm:text-sm text-gray-500">One-time payment</div>
                        </div>
                      </div>
                      
                      {/* Earning Potential */}
                      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 sm:p-4 mb-3 sm:mb-4 border border-white/40">
                        <div className="text-center">
                          <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1">
                            {typeof pkg.totalEarning === 'number' ? `KSH ${pkg.totalEarning.toLocaleString()}` : pkg.totalEarning}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-600">Maximum earning potential</div>
                        </div>
                      </div>
                      
                      {/* Features */}
                      <div className="space-y-2 mb-3 sm:mb-4">
                        {pkg.features.map((feature, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-xs sm:text-sm text-gray-700 leading-relaxed">{feature}</span>
                          </div>
                        ))}
                      </div>
                      
                      {/* Daily Limit Badge */}
                      <div className="flex justify-center mb-4">
                        <Badge className={`bg-gradient-to-r ${pkg.color} text-white border-0 px-3 sm:px-4 py-1 text-xs sm:text-sm`}>
                          {pkg.dailyLimit === 'unlimited' ? (
                            <div className="flex items-center gap-1">
                              <Infinity className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span>Unlimited Daily Earning</span>
                            </div>
                          ) : (
                            <span>Up to KSH {pkg.dailyLimit.toLocaleString()} daily</span>
                          )}
                        </Badge>
                      </div>

                      {/* Purchase Button */}
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPackage(key as 'basic' | 'pro');
                          setShowPaymentForm(true);
                        }}
                        className={`w-full bg-gradient-to-r ${pkg.color} hover:opacity-90 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <CreditCard className="w-4 h-4 flex-shrink-0" />
                          <span>Unlock Tasks - KSH {pkg.price}</span>
                        </div>
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>


            {/* Footer */}
            <div className="text-center mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
              <p className="text-sm text-gray-700">
                💡 <span className="font-semibold">Pro Tip:</span> Pro package offers the best value with unlimited earning potential!
              </p>
            </div>
          </div>
        </div>
      </DialogContent>

      {/* Payment Form Overlay */}
      {showPaymentForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-auto shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-800">Payment Details</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPaymentForm(false)}
                className="h-8 w-8 p-0"
              >
                ✕
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  M-Pesa Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="07XXXXXXXX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter your M-Pesa registered phone number
                </p>
              </div>
              
              <Button
                onClick={() => {
                  if (selectedPackage) {
                    handlePurchase(selectedPackage);
                    setShowPaymentForm(false);
                  }
                }}
                disabled={!selectedPackage || isProcessing || !phoneNumber}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing Payment...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <CreditCard className="w-5 h-5 flex-shrink-0" />
                    <span>
                      {selectedPackage 
                        ? `Pay KSH ${packages[selectedPackage].price} via M-Pesa` 
                        : 'Select a package first'
                      }
                    </span>
                  </div>
                )}
              </Button>
              
              <p className="text-xs text-gray-500 text-center leading-relaxed">
                🔒 Secure M-Pesa payment • Instant activation • No hidden fees
              </p>
            </div>
          </div>
        </div>
      )}
    </Dialog>
  );
};

export default PremiumTaskPackagesModal;
