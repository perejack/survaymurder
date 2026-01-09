import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertTriangle, ArrowRight } from "lucide-react";

interface AccountWarningModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onContinue: () => void;
  currentBalance: number;
  withdrawalAmount: number;
  remainingBalance: number;
}

const AccountWarningModal = ({ 
  isOpen, 
  onOpenChange, 
  onContinue,
  currentBalance,
  withdrawalAmount,
  remainingBalance
}: AccountWarningModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md mx-auto bg-white rounded-2xl shadow-2xl border-0 p-0 overflow-hidden">
        <div className="relative">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 text-center">
            <div className="flex justify-center mb-3">
              <div className="bg-white/20 rounded-full p-3">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Account Protection Warning</h2>
            <p className="text-red-100 text-sm">
              <span className="font-semibold text-white">KSh 350.</span> Withdrawing the whole amount will 
              <span className="font-semibold text-white"> deactivate your account permanently</span>.
            </p>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Balance Breakdown */}
            <Card className="bg-gradient-to-r from-red-50 to-orange-50 p-4 mb-6 border-2 border-red-200">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Current Balance:</span>
                  <span className="font-bold text-lg text-gray-900">KSh {currentBalance.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Withdrawal Amount:</span>
                  <span className="font-bold text-lg text-red-600">-KSh {withdrawalAmount.toLocaleString()}</span>
                </div>
                
                <hr className="border-red-200" />
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Remaining Balance:</span>
                  <span className="font-bold text-xl text-red-700">KSh {remainingBalance.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-red-100 rounded-lg border border-red-200">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <p className="text-sm font-semibold text-red-800">
                    Below minimum required balance of KSh {Math.max(350, Math.floor(currentBalance * 0.3)).toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>

            {/* Continue Button */}
            <Button
              onClick={onContinue}
              size="lg"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 text-base shadow-lg hover:shadow-xl transition-all duration-300"
            >
              See Options & Recommendations
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AccountWarningModal;
