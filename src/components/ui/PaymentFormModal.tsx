import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './dialog';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Loader2, CreditCard } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { useAuth } from '../../contexts/AuthContext';
import { initiatePayment, pollPaymentStatus, validatePhoneNumber } from '../../utils/paymentService';

interface PaymentFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packageType: 'basic' | 'pro';
  packageName: string;
  packagePrice: number;
  onPaymentSuccess: () => void;
}

export default function PaymentFormModal({ 
  open, 
  onOpenChange, 
  packageType,
  packageName,
  packagePrice,
  onPaymentSuccess
}: PaymentFormModalProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { purchaseTaskPackage, getSurveyStatus } = useAuth();

  const handlePayment = async () => {
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
      const description = `${packageName} - Premium Tasks (Test: KSH ${testAmount})`;
      
      const paymentResult = await initiatePayment(phoneNumber, testAmount, description);
      
      if (paymentResult.success && paymentResult.data?.checkoutRequestId) {
        toast({
          title: "STK Push Sent! 📱",
          description: "Check your phone and enter your M-Pesa PIN to complete payment",
        });
        
        // Start real payment status polling
        const cleanup = pollPaymentStatus(
          paymentResult.data.checkoutRequestId,
          async (status) => {
            if (status.success && status.payment) {
              if (status.success && status.payment?.status === 'SUCCESS') {
                setIsProcessing(false);
                
                // Grant additional tasks in database
                try {
                  console.log('About to call purchaseTaskPackage with:', packageType);
                  const result = await purchaseTaskPackage(packageType);
                  console.log('purchaseTaskPackage completed with result:', result);
                  
                  toast({
                    title: "Payment Successful! 🎉",
                    description: `${packageName} package activated successfully! You can now complete more surveys.`,
                    variant: "default",
                  });
                  
                  // Trigger survey status refresh in parent component
                  onPaymentSuccess();
                  
                  // Auto-close and redirect to premium survey
                  setTimeout(() => {
                    onOpenChange(false);
                    setPhoneNumber(''); // Reset form
                    // Redirect to premium survey page
                    window.location.href = '/premium-survey';
                  }, 2000);
                } catch (error) {
                  console.error('Error activating package:', error);
                  toast({
                    title: "Package Activation Error",
                    description: `Payment successful but failed to activate package. Error: ${error.message}`,
                    variant: "destructive",
                  });
                }
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

  const handleClose = () => {
    if (!isProcessing) {
      onOpenChange(false);
      setPhoneNumber(''); // Reset form when closing
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            <DialogTitle className="text-lg font-semibold">Payment Details</DialogTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={isProcessing}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <DialogDescription>
          Complete your payment for {packageName} to unlock additional tasks
        </DialogDescription>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="phone-input">M-Pesa Phone Number</Label>
            <Input
              id="phone-input"
              type="tel"
              placeholder="07XXXXXXXX"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={isProcessing}
              className="w-full"
              autoComplete="tel"
            />
            <p className="text-xs text-muted-foreground">
              Enter your M-Pesa registered phone number
            </p>
          </div>

          <Button
            onClick={handlePayment}
            disabled={!phoneNumber || isProcessing}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processing Payment...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                <span>Pay KSH {packagePrice} via M-Pesa</span>
              </div>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            🔒 Secure M-Pesa payment • Instant activation • No hidden fees
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentFormModal;
