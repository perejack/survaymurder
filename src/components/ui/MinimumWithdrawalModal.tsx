import { AlertTriangle, Target, Trophy, ArrowRight, Sparkles } from 'lucide-react';
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[420px] p-0 overflow-hidden bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 border-0 shadow-2xl">
        <DialogDescription className="sr-only">
          Minimum withdrawal amount not met. Complete more surveys to reach withdrawal threshold.
        </DialogDescription>
        <div className="relative">
          {/* Background decorative elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-red-500/5 to-pink-500/5" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-orange-400/10 to-transparent rounded-full blur-xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-red-400/10 to-transparent rounded-full blur-xl" />
          
          <div className="relative z-10 p-6">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Almost There! 🎯
              </h2>
              <p className="text-gray-600">
                You need a minimum of <span className="font-bold text-red-600">KSh 1,000</span> to withdraw
              </p>
            </div>

            {/* Progress Card */}
            <Card className="gradient-card p-6 mb-6 border-0 shadow-lg">
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-gray-800 mb-1">
                  KSh {currentBalance.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Current Balance</div>
              </div>

              {/* Progress Bar */}
              <div className="relative mb-4">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>KSh 0</span>
                  <span>KSh 1,000</span>
                </div>
              </div>

              <div className="text-center">
                <div className="text-lg font-semibold text-red-600 mb-1">
                  KSh {needed.toLocaleString()} more needed
                </div>
                <div className="text-sm text-gray-600">
                  {progressPercent.toFixed(0)}% of minimum reached
                </div>
              </div>
            </Card>

            {/* Earning opportunities */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <Card className="gradient-card p-4 border-0 shadow-md hover-lift">
                <div className="text-center">
                  <div className="w-10 h-10 mx-auto mb-2 bg-green-500/20 rounded-full flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-800">Complete Surveys</p>
                  <p className="text-xs text-green-600 font-semibold">+KSh 150 each</p>
                </div>
              </Card>
              
              <Card className="gradient-card p-4 border-0 shadow-md hover-lift">
                <div className="text-center">
                  <div className="w-10 h-10 mx-auto mb-2 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <Target className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-800">Daily Tasks</p>
                  <p className="text-xs text-blue-600 font-semibold">+KSh 50-200</p>
                </div>
              </Card>
            </div>

            {/* Call to action */}
            <div className="space-y-3">
              <Button
                onClick={() => {
                  onStartEarning();
                  onOpenChange(false);
                }}
                size="lg"
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-6 text-lg hover-bounce animate-pulse-glow"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Complete More Tasks
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              <Button
                onClick={() => onOpenChange(false)}
                variant="outline"
                size="lg"
                className="w-full"
              >
                Maybe Later
              </Button>
            </div>

            {/* Motivational message */}
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
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
