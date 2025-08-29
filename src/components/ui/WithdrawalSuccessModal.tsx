import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Smartphone, Clock, Sparkles, ArrowRight } from "lucide-react";

interface WithdrawalSuccessModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  phoneNumber: string;
  onContinue?: () => void;
}

const WithdrawalSuccessModal = ({ 
  isOpen, 
  onOpenChange, 
  amount,
  phoneNumber,
  onContinue
}: WithdrawalSuccessModalProps) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg mx-auto bg-white rounded-3xl shadow-2xl border-0 p-0 overflow-hidden">
        <div className="relative">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 opacity-10 animate-pulse"></div>
          
          {/* Confetti Effect */}
          {showConfetti && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-4 left-4 w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
              <div className="absolute top-8 right-8 w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              <div className="absolute top-12 left-1/2 w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
              <div className="absolute top-6 right-1/4 w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.6s'}}></div>
              <div className="absolute top-16 left-1/4 w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.8s'}}></div>
            </div>
          )}

          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600 p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <div className="relative z-10">
              <div className="flex justify-center mb-4">
                <div className="bg-white/20 rounded-full p-4 animate-pulse">
                  <CheckCircle2 className="w-12 h-12 text-white animate-bounce" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2 animate-fade-in">
                🎉 Withdrawal Successful!
              </h2>
              <p className="text-green-100 text-sm font-medium">
                Your transaction is being processed
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Success Message */}
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 mb-6 border-2 border-green-200 shadow-lg">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <Smartphone className="w-8 h-8 text-green-600 animate-pulse" />
                </div>
                <div>
                  <p className="text-lg font-bold text-green-800 mb-2">
                    KSh {amount.toLocaleString()} 
                  </p>
                  <p className="text-sm text-green-700 mb-1">
                    Sent to: <span className="font-semibold">{phoneNumber}</span>
                  </p>
                </div>
              </div>
            </Card>

            {/* Processing Info */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 mb-6 border-2 border-blue-200">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 rounded-full p-2 mt-1">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-blue-800 mb-2">Processing Timeline</h3>
                  <p className="text-sm text-blue-700 leading-relaxed">
                    You will receive your earnings to M-Pesa <span className="font-semibold text-blue-800">within 24 hours</span>. 
                    Our secure payment system ensures your money reaches you safely.
                  </p>
                </div>
              </div>
            </Card>

            {/* Success Features */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-semibold text-purple-800">Secure</span>
                </div>
                <p className="text-xs text-purple-700">Bank-level encryption</p>
              </div>
              
              <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg border border-orange-200">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-orange-600" />
                  <span className="text-xs font-semibold text-orange-800">Verified</span>
                </div>
                <p className="text-xs text-orange-700">Transaction confirmed</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {onContinue && (
                <Button
                  onClick={onContinue}
                  size="lg"
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-4 text-base shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Continue Earning
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              )}
              
              <Button
                onClick={() => onOpenChange(false)}
                variant="outline"
                size="lg"
                className="w-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-4 text-base"
              >
                Close
              </Button>
            </div>

            {/* Footer message */}
            <div className="text-center mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
              <p className="text-xs text-yellow-800">
                💰 <span className="font-semibold">Thank you!</span> Your withdrawal has been processed successfully. Check your M-Pesa for confirmation.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawalSuccessModal;
