import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, Package, Sparkles, ArrowRight, Trophy, Zap } from "lucide-react";

interface ModernDailyTaskLimitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUnlockMoreTasks: () => void;
  completedTasks: number;
  totalTasks: number;
}

const ModernDailyTaskLimitModal = ({ 
  open, 
  onOpenChange, 
  onUnlockMoreTasks,
  completedTasks,
  totalTasks
}: ModernDailyTaskLimitModalProps) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 11,
    minutes: 25,
    seconds: 31
  });

  useEffect(() => {
    if (!open) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md mx-auto bg-white rounded-3xl shadow-2xl border-0 p-0 overflow-hidden">
        <div className="relative">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-400/20 to-transparent rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-400/20 to-transparent rounded-full blur-xl animate-pulse"></div>

          {/* Header */}
          <div className="relative z-10 text-center p-6 pb-4">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-full p-4 shadow-lg animate-bounce">
                <Trophy className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              🎉 Great Work!
            </h2>
            <p className="text-gray-600 text-sm">
              You've completed all your daily tasks. Great work!
            </p>
          </div>

          {/* Content */}
          <div className="relative z-10 px-6 pb-6">
            {/* Countdown Timer */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 mb-4 border-2 border-blue-200 shadow-lg">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-800">Tasks Reload In:</span>
                </div>
                
                <div className="flex justify-center gap-4 mb-3">
                  <div className="text-center">
                    <div className="bg-white rounded-lg p-2 shadow-md min-w-[50px]">
                      <div className="text-2xl font-bold text-blue-600">{timeLeft.hours.toString().padStart(2, '0')}</div>
                    </div>
                    <div className="text-xs text-blue-600 mt-1 font-medium">Hours</div>
                  </div>
                  <div className="text-center">
                    <div className="bg-white rounded-lg p-2 shadow-md min-w-[50px]">
                      <div className="text-2xl font-bold text-blue-600">{timeLeft.minutes.toString().padStart(2, '0')}</div>
                    </div>
                    <div className="text-xs text-blue-600 mt-1 font-medium">Minutes</div>
                  </div>
                  <div className="text-center">
                    <div className="bg-white rounded-lg p-2 shadow-md min-w-[50px]">
                      <div className="text-2xl font-bold text-blue-600">{timeLeft.seconds.toString().padStart(2, '0')}</div>
                    </div>
                    <div className="text-xs text-blue-600 mt-1 font-medium">Seconds</div>
                  </div>
                </div>
                
                <p className="text-xs text-blue-700">
                  Your tasks will automatically reload within 24 hours
                </p>
              </div>
            </Card>

            {/* Progress Card */}
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 mb-4 border-2 border-green-200">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 rounded-full p-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-green-800">Today's Progress</span>
                    <Badge className="bg-green-500 text-white">Complete</Badge>
                  </div>
                  <p className="text-xs text-green-700">{completedTasks}/{totalTasks} surveys completed</p>
                </div>
              </div>
            </Card>

            {/* Unlock More Tasks Card */}
            <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 mb-6 border-2 border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="bg-gradient-to-r from-orange-400 to-yellow-500 rounded-full p-3 shadow-lg animate-pulse">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                </div>
                
                <h3 className="font-bold text-orange-800 mb-2">Want More Tasks?</h3>
                <p className="text-sm text-orange-700 mb-4">
                  Don't wait! Unlock premium task packages and keep earning
                </p>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-white/60 rounded-lg p-3 border border-orange-200">
                    <div className="text-center">
                      <div className="font-semibold text-orange-800">Basic Pack</div>
                      <div className="text-xs text-orange-600">10 tasks • KSh 250</div>
                    </div>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3 border border-orange-200">
                    <div className="text-center">
                      <div className="font-semibold text-orange-800">Pro Pack</div>
                      <div className="text-xs text-orange-600">20 tasks • KSh 350</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={onUnlockMoreTasks}
                size="lg"
                className="w-full bg-gradient-to-r from-orange-500 to-yellow-600 hover:from-orange-600 hover:to-yellow-700 text-white font-semibold py-4 text-base shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse"
              >
                <Zap className="w-5 h-5 mr-2" />
                Unlock More Tasks
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              <Button
                onClick={() => onOpenChange(false)}
                variant="outline"
                size="lg"
                className="w-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-4 text-base"
              >
                Wait for Reload
              </Button>
            </div>

            {/* Footer message */}
            <div className="text-center mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
              <p className="text-xs text-purple-800">
                ⭐ <span className="font-semibold">Pro Tip:</span> Premium task packages give you instant access to high-paying surveys!
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModernDailyTaskLimitModal;
