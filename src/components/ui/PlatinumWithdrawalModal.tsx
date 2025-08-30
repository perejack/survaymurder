import { useState } from 'react';
import { Crown, CheckCircle, ArrowRight, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface PlatinumWithdrawalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  withdrawalAmount: number;
  onConfirmWithdrawal: () => void;
}

const PlatinumWithdrawalModal = ({ 
  open, 
  onOpenChange, 
  withdrawalAmount,
  onConfirmWithdrawal
}: PlatinumWithdrawalModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onConfirmWithdrawal();
      onOpenChange(false);
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[420px] p-0 overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 border-0 shadow-2xl">
        <div className="relative">
          {/* Background decorative elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-yellow-500/5" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-400/10 to-transparent rounded-full blur-xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-400/10 to-transparent rounded-full blur-xl" />
          
          <div className="relative z-10 p-6">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <Crown className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
                Platinum Withdrawal 👑
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">PREMIUM</Badge>
              </h2>
              <p className="text-gray-600 leading-relaxed">
                You're about to withdraw the full amount from your account
              </p>
            </div>

            {/* Withdrawal Details */}
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 mb-6 border-2 border-purple-200 shadow-lg">
              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  KSh {withdrawalAmount.toLocaleString()}
                </div>
                <div className="text-sm text-purple-700">Full Account Balance</div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-white/60 rounded-lg p-3">
                  <span className="text-sm text-gray-600">Withdrawal Type:</span>
                  <span className="font-semibold text-purple-600">Full Balance</span>
                </div>
                <div className="flex items-center justify-between bg-white/60 rounded-lg p-3">
                  <span className="text-sm text-gray-600">Processing Time:</span>
                  <span className="font-semibold text-green-600">Within 24 hours</span>
                </div>
                <div className="flex items-center justify-between bg-white/60 rounded-lg p-3">
                  <span className="text-sm text-gray-600">Account Status:</span>
                  <span className="font-semibold text-purple-600">Remains Active</span>
                </div>
              </div>
            </Card>

            {/* Platinum Benefits Reminder */}
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 mb-6 border border-green-200 shadow-md">
              <h3 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Platinum Privileges Active
              </h3>
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-700">No minimum balance required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-700">Account remains active after withdrawal</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-700">Continue earning with premium tasks</span>
                </div>
              </div>
            </Card>

            {/* Processing Timeline */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 mb-6 border border-blue-200 shadow-md">
              <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                What Happens Next
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-blue-700">Withdrawal request processed immediately</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-blue-700">M-Pesa payment initiated within 1 hour</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-blue-700">Full amount received within 24 hours</span>
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleConfirm}
                disabled={isProcessing}
                size="lg"
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-4 text-base shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isProcessing ? (
                  <>
                    <Clock className="w-5 h-5 mr-2 animate-spin" />
                    Processing Withdrawal...
                  </>
                ) : (
                  <>
                    <Crown className="w-5 h-5 mr-2" />
                    Confirm Full Withdrawal
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
              
              <Button
                onClick={() => onOpenChange(false)}
                variant="outline"
                size="lg"
                className="w-full border-2 border-purple-300 text-purple-700 hover:bg-purple-50"
                disabled={isProcessing}
              >
                Cancel
              </Button>
            </div>

            {/* Footer message */}
            <div className="text-center mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
              <p className="text-xs text-purple-800">
                👑 <span className="font-semibold">Platinum Advantage:</span> Enjoy unlimited withdrawals and keep your account active!
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlatinumWithdrawalModal;
