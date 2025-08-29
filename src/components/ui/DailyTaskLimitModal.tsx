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
      <DialogContent className="w-[95vw] max-w-[420px] p-0 overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-0 shadow-2xl">
        <div className="relative">
          {/* Background decorative elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-purple-500/5" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-400/10 to-transparent rounded-full blur-xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-400/10 to-transparent rounded-full blur-xl" />
          
          <div className="relative z-10 p-6">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <Clock className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Daily Tasks Complete! 🎉
              </h2>
              <p className="text-gray-600 leading-relaxed">
                You've completed all your daily tasks. Great work!
              </p>
            </div>

            {/* Countdown Timer */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 mb-6 border-2 border-blue-200 shadow-lg">
              <div className="text-center mb-4">
                <h3 className="font-bold text-blue-800 mb-2 flex items-center justify-center gap-2">
                  <Timer className="w-5 h-5" />
                  Tasks Reload In:
                </h3>
                <div className="flex justify-center gap-2">
                  <div className="bg-white/60 rounded-lg p-3 min-w-[60px]">
                    <div className="text-2xl font-bold text-blue-600">{timeLeft.hours.toString().padStart(2, '0')}</div>
                    <div className="text-xs text-blue-700">Hours</div>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3 min-w-[60px]">
                    <div className="text-2xl font-bold text-blue-600">{timeLeft.minutes.toString().padStart(2, '0')}</div>
                    <div className="text-xs text-blue-700">Minutes</div>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3 min-w-[60px]">
                    <div className="text-2xl font-bold text-blue-600">{timeLeft.seconds.toString().padStart(2, '0')}</div>
                    <div className="text-xs text-blue-700">Seconds</div>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-blue-700">
                  Your tasks will automatically reload within 24 hours
                </p>
              </div>
            </Card>

            {/* Current Progress */}
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 mb-6 border border-green-200 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-green-800">Today's Progress</h4>
                    <p className="text-sm text-green-700">3/3 surveys completed</p>
                  </div>
                </div>
                <Badge className="bg-green-500 text-white">Complete</Badge>
              </div>
            </Card>

            {/* Unlock More Tasks Option */}
            <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 p-5 mb-6 border-2 border-orange-200 shadow-lg">
              <div className="text-center mb-4">
                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-orange-800 mb-2">Want More Tasks?</h3>
                <p className="text-sm text-orange-700 mb-4">
                  Don't wait! Unlock premium task packages and keep earning
                </p>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-white/60 rounded-lg p-3">
                    <div className="font-bold text-orange-600">Basic Pack</div>
                    <div className="text-xs text-orange-700">10 tasks • KSh 250</div>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3">
                    <div className="font-bold text-orange-600">Pro Pack</div>
                    <div className="text-xs text-orange-700">20 tasks • KSh 350</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={onUnlockTasks}
                size="lg"
                className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold py-4 text-base shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Package className="w-5 h-5 mr-2" />
                Unlock More Tasks
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              <Button
                onClick={() => onOpenChange(false)}
                variant="outline"
                size="lg"
                className="w-full border-2 border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                <Clock className="w-4 h-4 mr-2" />
                Wait for Auto Reload
              </Button>
            </div>

            {/* Motivational message */}
            <div className="text-center mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
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
