import { useState, useEffect } from 'react';
import { Clock, Zap, Package, ArrowRight, Sparkles, Timer, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface DailyTaskLimitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUnlockTasks: () => void;
}

const DailyTaskLimitModal = ({ 
  open, 
  onOpenChange, 
  onUnlockTasks
}: DailyTaskLimitModalProps) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // Calculate time until next day (24 hours from now for demo)
    const calculateTimeLeft = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0); // Set to midnight
      
      const difference = tomorrow.getTime() - now.getTime();
      
      if (difference > 0) {
        setTimeLeft({
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[420px] p-0 overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-0 shadow-2xl rounded-2xl sm:rounded-3xl max-h-[90vh] overflow-y-auto">
        <div className="relative">
          {/* Background decorative elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-purple-500/5" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-400/10 to-transparent rounded-full blur-xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-400/10 to-transparent rounded-full blur-xl" />
          
          <div className="relative z-10 p-4 sm:p-6">
            {/* Header */}
            <div className="text-center mb-4 sm:mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                Daily Tasks Complete! 🎉
              </h2>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base px-2">
                You've completed all your daily tasks. Great work!
              </p>
            </div>

            {/* Countdown Timer */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6 mb-4 sm:mb-6 border-2 border-blue-200 shadow-lg">
              <div className="text-center mb-3 sm:mb-4">
                <h3 className="font-bold text-blue-800 mb-2 flex items-center justify-center gap-2 text-sm sm:text-base">
                  <Timer className="w-4 h-4 sm:w-5 sm:h-5" />
                  Tasks Reload In:
                </h3>
                <div className="flex justify-center gap-1 sm:gap-2">
                  <div className="bg-white/60 rounded-lg p-2 sm:p-3 min-w-[50px] sm:min-w-[60px]">
                    <div className="text-xl sm:text-2xl font-bold text-blue-600">{timeLeft.hours.toString().padStart(2, '0')}</div>
                    <div className="text-xs text-blue-700">Hours</div>
                  </div>
                  <div className="bg-white/60 rounded-lg p-2 sm:p-3 min-w-[50px] sm:min-w-[60px]">
                    <div className="text-xl sm:text-2xl font-bold text-blue-600">{timeLeft.minutes.toString().padStart(2, '0')}</div>
                    <div className="text-xs text-blue-700">Minutes</div>
                  </div>
                  <div className="bg-white/60 rounded-lg p-2 sm:p-3 min-w-[50px] sm:min-w-[60px]">
                    <div className="text-xl sm:text-2xl font-bold text-blue-600">{timeLeft.seconds.toString().padStart(2, '0')}</div>
                    <div className="text-xs text-blue-700">Seconds</div>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-xs sm:text-sm text-blue-700">
                  Your tasks will automatically reload within 24 hours
                </p>
              </div>
            </Card>

            {/* Current Progress */}
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 sm:p-4 mb-4 sm:mb-6 border border-green-200 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-green-800 text-sm sm:text-base">Today's Progress</h4>
                    <p className="text-xs sm:text-sm text-green-700">3/3 surveys completed</p>
                  </div>
                </div>
                <Badge className="bg-green-500 text-white text-xs">Complete</Badge>
              </div>
            </Card>

            {/* Unlock More Tasks Option */}
            <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 sm:p-5 mb-4 sm:mb-6 border-2 border-orange-200 shadow-lg">
              <div className="text-center mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center">
                  <Package className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h3 className="font-bold text-orange-800 mb-2 text-sm sm:text-base">Want More Tasks?</h3>
                <p className="text-xs sm:text-sm text-orange-700 mb-3 sm:mb-4 px-2">
                  Unlock additional earning opportunities!
                </p>
                
                <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="bg-white/60 rounded-lg p-2 sm:p-3">
                    <div className="font-bold text-orange-600 text-xs sm:text-sm">Earn up to 5,000 KSH daily</div>
                    <div className="text-xs text-orange-700">Withdrawal limits may apply</div>
                  </div>
                  <div className="bg-white/60 rounded-lg p-2 sm:p-3">
                    <div className="font-bold text-orange-600 text-xs sm:text-sm">M-Pesa withdrawals once eligible</div>
                    <div className="text-xs text-orange-700">Task rewards vary by type and quality</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-2 sm:space-y-3">
              <Button
                onClick={onUnlockTasks}
                size="lg"
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 sm:py-4 text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-300 h-12 sm:h-auto touch-manipulation active:scale-95"
              >
                <Package className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Unlock More Tasks
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              </Button>
              
              <Button
                onClick={() => onOpenChange(false)}
                variant="outline"
                size="lg"
                className="w-full border-2 border-blue-300 text-blue-700 hover:bg-blue-50 h-10 sm:h-12 text-sm sm:text-base touch-manipulation active:scale-95 transition-transform"
              >
                <Clock className="w-4 h-4 mr-2" />
                Wait for Auto Reload
              </Button>
            </div>

            {/* Motivational message */}
            <div className="text-center mt-3 sm:mt-4 p-2 sm:p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-800">
                🌟 <span className="font-semibold">Great Job!</span> You've earned today's rewards. Come back tomorrow for more opportunities!
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DailyTaskLimitModal;
