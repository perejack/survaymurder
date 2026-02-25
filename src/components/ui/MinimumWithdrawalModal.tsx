import { AlertTriangle, Target, Trophy, ArrowRight, Sparkles } from 'lucide-react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription } from '@/components/ui/dialog';

interface MinimumWithdrawalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentBalance: number;
  onStartEarning: () => void;
}

const MinimumWithdrawalModal = ({ 
  open, 
  onOpenChange, 
  currentBalance, 
  onStartEarning 
}: MinimumWithdrawalModalProps) => {
  const minimumAmount = 1000;
  const needed = minimumAmount - currentBalance;
  const progressPercent = Math.min((currentBalance / minimumAmount) * 100, 100);

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
      <DialogContent className="w-[95vw] max-w-md mx-auto p-0 overflow-hidden bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 border-0 shadow-2xl rounded-2xl sm:rounded-3xl max-h-[90vh] overflow-y-auto overscroll-contain touch-pan-y">
        <DialogDescription className="sr-only">
          Minimum withdrawal amount not met. Complete more surveys to reach withdrawal threshold.
        </DialogDescription>
        <div className="relative">
          {/* Background decorative elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-red-500/5 to-pink-500/5" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-orange-400/10 to-transparent rounded-full blur-xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-red-400/10 to-transparent rounded-full blur-xl" />
          
          <div className="relative z-10 p-4 sm:p-6">
            {/* Header */}
            <div className="text-center mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-2">
                Almost There! 🎯
              </h2>
              <p className="text-gray-600 text-sm sm:text-base px-2">
                You need a minimum of <span className="font-bold text-red-600">KSh 1,000</span> to withdraw
              </p>
            </div>

            {/* Progress Card */}
            <Card className="gradient-card p-4 sm:p-6 mb-4 sm:mb-6 border-0 shadow-lg">
              <div className="text-center mb-3 sm:mb-4">
                <div className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">
                  KSh {currentBalance.toLocaleString()}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Current Balance</div>
              </div>

              {/* Progress Bar */}
              <div className="relative mb-3 sm:mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-red-500 h-2 sm:h-3 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>KSh 0</span>
                  <span>KSh 1,000</span>
                </div>
              </div>

              <div className="text-center">
                <div className="text-base sm:text-lg font-semibold text-red-600 mb-1">
                  KSh {needed.toLocaleString()} more needed
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  {progressPercent.toFixed(0)}% of minimum reached
                </div>
              </div>
            </Card>

            {/* Earning opportunities */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
              <Card className="gradient-card p-3 sm:p-4 border-0 shadow-md hover-lift">
                <div className="text-center">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-1 sm:mb-2 bg-green-500/20 rounded-full flex items-center justify-center">
                    <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-gray-800">Complete Surveys</p>
                  <p className="text-xs text-green-600 font-semibold">Rewards vary</p>
                </div>
              </Card>
              
              <Card className="gradient-card p-3 sm:p-4 border-0 shadow-md hover-lift">
                <div className="text-center">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-1 sm:mb-2 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <Target className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-gray-800">Daily Tasks</p>
                  <p className="text-xs text-blue-600 font-semibold">Earnings vary</p>
                </div>
              </Card>
            </div>

            {/* Call to action */}
            <div className="space-y-2 sm:space-y-3">
              <Button
                onClick={() => {
                  onStartEarning();
                  onOpenChange(false);
                }}
                className="w-full h-11 sm:h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold text-sm sm:text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 touch-manipulation active:scale-95"
              >
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Complete More Tasks
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              </Button>
              
              <Button
                onClick={() => onOpenChange(false)}
                variant="outline"
                className="w-full h-10 sm:h-11 rounded-xl text-xs sm:text-sm touch-manipulation active:scale-95"
              >
                Maybe Later
              </Button>
            </div>

            {/* Motivational message */}
            <div className="text-center mt-3 sm:mt-4">
              <p className="text-xs sm:text-sm text-gray-600 px-2">
                💪 You're <span className="font-semibold text-orange-600">{Math.ceil(needed / 150)} surveys away</span> from your first withdrawal!
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MinimumWithdrawalModal;
