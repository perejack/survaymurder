import React, { useState } from 'react';
import { Package, Zap, DollarSign, CheckCircle, ArrowRight, Sparkles, Crown, Loader2, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { initiatePayment, pollPaymentStatus, validatePhoneNumber } from '@/utils/paymentService';

interface TaskPackagesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPurchaseSuccess: (packageType: 'basic' | 'pro') => void;
}

interface TaskPackage {
  id: 'basic' | 'pro';
  name: string;
  price: number;
  tasks: number;
  payPerTask: number;
  withdrawalLimit: number;
  instantWithdrawal: boolean;
  features: string[];
  popular?: boolean;
}

const TaskPackagesModal = ({ 
  open, 
  onOpenChange, 
  onPurchaseSuccess
}: TaskPackagesModalProps) => {
  const [selectedPackage, setSelectedPackage] = useState<TaskPackage | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');
  const { toast } = useToast();

  const packages: TaskPackage[] = [
    {
      id: 'basic',
      name: 'Basic Package',
      price: 250,
      tasks: 10,
      payPerTask: 250,
      withdrawalLimit: 5000,
      instantWithdrawal: true,
      features: [
        '10 premium tasks',
        'KSh 250 per task',
        'Instant M-Pesa withdrawal',
        'KSh 5,000 daily withdrawal limit',
        'Valid for 30 days'
      ]
    },
    {
      id: 'pro',
      name: 'Pro Package',
      price: 350,
      tasks: 20,
      payPerTask: 250,
      withdrawalLimit: 0, // No limit
      instantWithdrawal: true,
      popular: true,
      features: [
        '20 premium tasks',
        'KSh 250 per task',
        'No withdrawal limit',
        'Instant M-Pesa withdrawal',
        'Priority task access',
        'Valid for 30 days'
      ]
    }
  ];

  const handlePurchase = async (pkg: TaskPackage) => {
    if (!phoneNumber) {
      setError("Please enter your M-Pesa phone number.");
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setError("Please enter a valid Kenyan phone number.");
      return;
    }

    setSelectedPackage(pkg);
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
    } catch (error: any) {
      console.error('Payment error:', error);
      setError(error.message || 'Failed to initiate payment');
      setIsProcessing(false);
      setStatusMessage('');
      setSelectedPackage(null);
    }
  };

  const pollPaymentStatusReal = async (requestId: string, pkg: TaskPackage) => {
    let attempts = 0;
    const maxAttempts = 50;
    
    const checkStatus = async () => {
      try {
        const response = await fetch(`/.netlify/functions/payment-status/${requestId}`);
        const data = await response.json();
        
        if (data.success && data.payment) {
          if (data.payment.status === 'SUCCESS') {
            setIsProcessing(false);
            setIsComplete(true);
            setStatusMessage('Package purchased successfully!');
            
            setTimeout(() => {
              onPurchaseSuccess(pkg.id);
              onOpenChange(false);
            }, 2000);
            return;
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
        setSelectedPackage(null);
      }
    };
    
    checkStatus();
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
            
            <div className="relative z-10 p-6 text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <Package className="w-12 h-12 text-white" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Package Activated! 🎉
              </h2>
              <p className="text-gray-600 mb-6">
                Your {selectedPackage.name} has been purchased successfully
              </p>

              <Card className="bg-white/60 p-4 mb-6 border border-green-200">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Package:</span>
                    <span className="font-semibold">{selectedPackage.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tasks Available:</span>
                    <span className="font-semibold text-green-600">{selectedPackage.tasks}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Pay per Task:</span>
                    <span className="font-semibold text-green-600">KSh {selectedPackage.payPerTask}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Earning Potential:</span>
                    <span className="font-bold text-green-600">KSh {selectedPackage.tasks * selectedPackage.payPerTask}</span>
                  </div>
                </div>
              </Card>

              <Button
                onClick={() => {
                  onPurchaseSuccess(selectedPackage.id);
                  onOpenChange(false);
                }}
                size="lg"
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-6 text-lg"
              >
                Start Completing Tasks
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
      <DialogContent className="w-[95vw] max-w-[500px] p-0 overflow-hidden bg-gradient-to-br from-orange-50 via-yellow-50 to-amber-50 border-0 shadow-2xl">
        <DialogDescription className="sr-only">
          Purchase task packages to unlock additional daily surveys
        </DialogDescription>
        <div className="relative">
          {/* Background decorative elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-yellow-500/5 to-amber-500/5" />
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-orange-400/10 to-transparent rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-yellow-400/10 to-transparent rounded-full blur-xl" />
          
          <div className="relative z-10 p-6">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <Package className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Unlock More Tasks 🚀
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Choose a task package to continue earning without waiting
              </p>
            </div>

            {/* Package Cards */}
            <div className="grid grid-cols-1 gap-4 mb-6">
              {packages.map((pkg) => (
                <Card 
                  key={pkg.id}
                  className={`relative p-5 border-2 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer ${
                    pkg.popular 
                      ? 'border-orange-300 bg-gradient-to-r from-orange-50 to-yellow-50' 
                      : 'border-gray-200 bg-white hover:border-orange-200'
                  }`}
                >
                  {pkg.popular && (
                    <Badge className="absolute -top-2 left-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
                      MOST POPULAR
                    </Badge>
                  )}
                  
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-1">{pkg.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-3xl font-bold text-orange-600">KSh {pkg.price}</span>
                        <Badge variant="outline" className="text-xs">One-time</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">{pkg.tasks} Tasks</div>
                      <div className="text-sm text-gray-600">KSh {pkg.payPerTask} each</div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {pkg.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white/60 rounded-lg p-3 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Total Earning Potential:</span>
                      <span className="text-lg font-bold text-green-600">
                        KSh {(pkg.tasks * pkg.payPerTask).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={() => handlePurchase(pkg)}
                    disabled={isProcessing}
                    size="lg"
                    className={`w-full font-semibold py-3 text-base shadow-md hover:shadow-lg transition-all duration-300 ${
                      pkg.popular
                        ? 'bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white'
                        : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white'
                    }`}
                  >
                    {isProcessing && selectedPackage?.id === pkg.id ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5 mr-2" />
                        Purchase {pkg.name}
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </Card>
              ))}
            </div>

            {/* Phone number input */}
            <div className="mb-6">
              <Label htmlFor="package-phone" className="text-base font-semibold mb-3 block text-gray-800">
                M-Pesa Phone Number
              </Label>
              <div className="relative">
                <Input
                  id="package-phone"
                  type="tel"
                  placeholder="07XXXXXXXX or 01XXXXXXXX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="h-12 text-base border-2 border-orange-200 focus:border-orange-500 transition-colors rounded-xl bg-orange-50/30"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                The package fee will be charged to this number
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Status message */}
            {statusMessage && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-600 text-sm">{statusMessage}</p>
              </div>
            )}

            {/* Cancel Button */}
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              size="lg"
              className="w-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50"
              disabled={isProcessing}
            >
              Maybe Later
            </Button>

            {/* Value proposition */}
            <div className="text-center mt-4 p-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-200">
              <p className="text-xs text-orange-800">
                💰 <span className="font-semibold">Smart Investment:</span> Each package pays for itself with just 1-2 completed tasks!
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskPackagesModal;
