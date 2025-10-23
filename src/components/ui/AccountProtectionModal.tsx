import { useState, useEffect } from 'react';
import { AlertTriangle, Shield, Crown, ArrowRight, Sparkles, Clock, DollarSign, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface AccountProtectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentBalance: number;
  withdrawalAmount: number;
  onContinueTasking: () => void;
  onUpgradeToPlatinum: () => void;
  onWithdrawInstantly: () => void;
}

const AccountProtectionModal = ({ 
  open, 
  onOpenChange, 
  currentBalance,
  withdrawalAmount,
  onContinueTasking,
  onUpgradeToPlatinum,
  onWithdrawInstantly
}: AccountProtectionModalProps) => {
  const remainingBalance = currentBalance - withdrawalAmount;
  const isFullWithdrawal = remainingBalance < 350;

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md mx-auto p-0 overflow-hidden bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 border-0 shadow-2xl rounded-2xl sm:rounded-3xl max-h-[90vh] overflow-y-auto overscroll-contain touch-pan-y">
        <div className="relative">
          {/* Background decorative elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-orange-500/5 to-yellow-500/5" />
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-red-400/10 to-transparent rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-orange-400/10 to-transparent rounded-full blur-xl" />
          
          <div className="relative z-10 p-4 sm:p-6">
            {/* Header */}
            <div className="text-center mb-4 sm:mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-2">
                Account Protection Warning
              </h2>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed px-2">
                Withdrawing the <span className="font-bold text-red-600">whole amount</span> will deactivate your account
              </p>
            </div>

            {/* Warning Card */}
            <Card className="bg-gradient-to-r from-red-50 to-orange-50 p-4 sm:p-6 mb-4 sm:mb-6 border-2 border-red-200 shadow-lg">
              <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-red-800 mb-1 sm:mb-2 text-sm sm:text-base">KSh 350. Withdrawing the whole amount will deactivate your account permanently</h3>
                  <p className="text-xs sm:text-sm text-red-700 leading-relaxed">
                    Keep at least <span className="font-bold">KSh 350</span> to maintain account access.
                  </p>
                </div>
              </div>
              
              <div className="bg-white/60 rounded-lg p-3 sm:p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs sm:text-sm text-gray-600">Current Balance:</span>
                  <span className="font-bold text-sm sm:text-base">KSh {currentBalance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs sm:text-sm text-gray-600">Withdrawal Amount:</span>
                  <span className="font-bold text-sm sm:text-base text-red-600">-KSh {withdrawalAmount.toLocaleString()}</span>
                </div>
                <hr className="my-2 border-gray-300" />
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-600">Remaining Balance:</span>
                  <span className={`font-bold text-sm sm:text-base ${remainingBalance < 350 ? 'text-red-600' : 'text-green-600'}`}>
                    KSh {remainingBalance.toLocaleString()}
                  </span>
                </div>
                {remainingBalance < 350 && (
                  <div className="mt-2 text-xs text-red-600 font-medium text-center">
                    ⚠️ Below minimum required balance of KSh 350
                  </div>
                )}
              </div>
            </Card>

            {/* Recommendation */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 border border-blue-200">
              <h4 className="font-bold text-blue-800 mb-1 sm:mb-2 flex items-center gap-2 text-sm sm:text-base">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                Recommended Action
              </h4>
              <p className="text-xs sm:text-sm text-blue-700">
                Select an amount that won't leave your account with 0 balance. Keep tasking to increase the amount or upgrade to Platinum for full withdrawal privileges.
              </p>
            </div>

            {/* Platinum Benefits Preview */}
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 sm:p-4 mb-4 sm:mb-6 border-2 border-purple-200 shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                <h3 className="font-bold text-purple-800 text-sm sm:text-base">Platinum Benefits</h3>
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">PREMIUM</Badge>
              </div>
              
              <div className="grid grid-cols-1 gap-2 sm:gap-3">
                <div className="flex items-center gap-2 sm:gap-3 bg-white/60 rounded-lg p-2 sm:p-3">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
                  <div>
                    <p className="font-semibold text-xs sm:text-sm text-gray-800">Full withdrawals available once eligible</p>
                    <p className="text-xs text-gray-600">Eligibility and limits may apply</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 sm:gap-3 bg-white/60 rounded-lg p-2 sm:p-3">
                  <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  <div>
                    <p className="font-semibold text-xs sm:text-sm text-gray-800">Up to KSh 6,000 daily</p>
                    <p className="text-xs text-gray-600">Higher M-Pesa limits (limits may apply)</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 sm:gap-3 bg-white/60 rounded-lg p-2 sm:p-3">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  <div>
                    <p className="font-semibold text-xs sm:text-sm text-gray-800">Tasks up to KSh 200</p>
                    <p className="text-xs text-gray-600">Availability varies; up to 10 daily</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-2 sm:space-y-3">
              <Button
                onClick={onContinueTasking}
                className="w-full h-11 sm:h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold text-sm sm:text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 touch-manipulation active:scale-95"
              >
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Continue Tasking
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              </Button>
              
              <Button
                onClick={onUpgradeToPlatinum}
                className="w-full h-11 sm:h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold text-sm sm:text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 touch-manipulation active:scale-95"
              >
                <Crown className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Upgrade to Platinum
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              </Button>
              
              <Button
                onClick={onWithdrawInstantly}
                variant="outline"
                className="w-full h-10 sm:h-11 border-2 border-orange-300 text-orange-700 hover:bg-orange-50 font-semibold text-xs sm:text-sm rounded-xl touch-manipulation active:scale-95"
              >
                Withdraw when eligible (Platinum)
              </Button>
              
              <Button
                onClick={() => onOpenChange(false)}
                variant="ghost"
                className="w-full h-10 sm:h-11 text-gray-600 hover:bg-gray-100 text-xs sm:text-sm rounded-xl touch-manipulation active:scale-95"
              >
                Cancel
              </Button>
            </div>

            {/* Footer message */}
            <div className="text-center mt-3 sm:mt-4 p-2 sm:p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-xs text-yellow-800">
                💡 <span className="font-semibold">Pro Tip:</span> Keep your account active by maintaining a minimum balance!
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AccountProtectionModal;
