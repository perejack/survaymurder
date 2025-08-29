import { useState } from 'react';
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[480px] p-0 overflow-hidden bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 border-0 shadow-2xl">
        <div className="relative">
          {/* Background decorative elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-orange-500/5 to-yellow-500/5" />
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-red-400/10 to-transparent rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-orange-400/10 to-transparent rounded-full blur-xl" />
          
          <div className="relative z-10 p-6">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <AlertTriangle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                ⚠️ Account Protection Alert
              </h2>
              <p className="text-gray-600 leading-relaxed">
                You're trying to withdraw the <span className="font-bold text-red-600">whole amount</span> from your account
              </p>
            </div>

            {/* Warning Card */}
            <Card className="bg-gradient-to-r from-red-50 to-orange-50 p-6 mb-6 border-2 border-red-200 shadow-lg">
              <div className="flex items-start gap-3 mb-4">
                <Shield className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-red-800 mb-2">Account Safety Notice</h3>
                  <p className="text-sm text-red-700 leading-relaxed">
                    Your tasking account should remain with at least <span className="font-bold">KSh 350</span>. 
                    Withdrawing the whole amount will <span className="font-bold">deactivate your account permanently</span>.
                  </p>
                </div>
              </div>
              
              <div className="bg-white/60 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Current Balance:</span>
                  <span className="font-bold text-lg">KSh {currentBalance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Withdrawal Amount:</span>
                  <span className="font-bold text-lg text-red-600">-KSh {withdrawalAmount.toLocaleString()}</span>
                </div>
                <hr className="my-2 border-gray-300" />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Remaining Balance:</span>
                  <span className={`font-bold text-lg ${remainingBalance < 350 ? 'text-red-600' : 'text-green-600'}`}>
                    KSh {remainingBalance.toLocaleString()}
                  </span>
                </div>
                {remainingBalance < 350 && (
                  <div className="mt-2 text-xs text-red-600 font-medium">
                    ⚠️ Below minimum required balance of KSh 350
                  </div>
                )}
              </div>
            </Card>

            {/* Recommendation */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-6 border border-blue-200">
              <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Recommended Action
              </h4>
              <p className="text-sm text-blue-700">
                Select an amount that won't leave your account with 0 balance. Keep tasking to increase the amount or upgrade to Platinum for full withdrawal privileges.
              </p>
            </div>

            {/* Platinum Benefits Preview */}
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 p-5 mb-6 border-2 border-purple-200 shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <Crown className="w-6 h-6 text-purple-600" />
                <h3 className="font-bold text-purple-800">Platinum Account Benefits</h3>
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">PREMIUM</Badge>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center gap-3 bg-white/60 rounded-lg p-3">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  <div>
                    <p className="font-semibold text-sm text-gray-800">Instant Full Withdrawal</p>
                    <p className="text-xs text-gray-600">No minimum balance required</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 bg-white/60 rounded-lg p-3">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-semibold text-sm text-gray-800">Up to KSh 6,000 Daily M-Pesa</p>
                    <p className="text-xs text-gray-600">Higher withdrawal limits</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 bg-white/60 rounded-lg p-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-semibold text-sm text-gray-800">Tasks up to KSh 200</p>
                    <p className="text-xs text-gray-600">10 premium tasks daily</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={onContinueTasking}
                size="lg"
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-4 text-base shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Continue Tasking
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              <Button
                onClick={onUpgradeToPlatinum}
                size="lg"
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-4 text-base shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Crown className="w-5 h-5 mr-2" />
                Upgrade to Platinum
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              <Button
                onClick={onWithdrawInstantly}
                variant="outline"
                size="lg"
                className="w-full border-2 border-orange-300 text-orange-700 hover:bg-orange-50 font-semibold py-4 text-base"
              >
                Withdraw Instantly (Platinum Only)
              </Button>
              
              <Button
                onClick={() => onOpenChange(false)}
                variant="ghost"
                size="lg"
                className="w-full text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </Button>
            </div>

            {/* Footer message */}
            <div className="text-center mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-xs text-yellow-800">
                💡 <span className="font-semibold">Pro Tip:</span> Keep your account active by maintaining a minimum balance and enjoy continuous earning opportunities!
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AccountProtectionModal;
