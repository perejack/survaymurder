import React from 'react';
import { Dialog, DialogContent, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, Package, Sparkles, ArrowRight, Trophy, Zap } from "lucide-react";

interface ModernDailyTaskLimitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUnlockTasks: () => void;
  completedTasks: number;
  dailyLimit: number;
}

const ModernDailyTaskLimitModal = ({ 
  open, 
  onOpenChange, 
  onUnlockTasks,
  completedTasks,
  dailyLimit
}: ModernDailyTaskLimitModalProps) => {

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md mx-auto bg-white rounded-2xl sm:rounded-3xl shadow-2xl border-0 p-0 overflow-hidden">
        <DialogDescription className="sr-only">
          Daily task limit reached. You can unlock more tasks with task packages or wait for reset.
        </DialogDescription>
        <div className="relative">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-400/20 to-transparent rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-400/20 to-transparent rounded-full blur-xl animate-pulse"></div>

          {/* Header */}
          <div className="relative z-10 text-center p-4 sm:p-6 pb-3 sm:pb-4">
            <div className="flex justify-center mb-3 sm:mb-4">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-full p-3 sm:p-4 shadow-lg animate-bounce">
                <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
              🎉 Great Work!
            </h2>
            <p className="text-gray-600 text-sm px-2">
              You've completed all your daily tasks. Great work!
            </p>
          </div>

          {/* Content */}
          <div className="relative z-10 px-4 sm:px-6 pb-4 sm:pb-6">
            {/* 24 Hour Reload Message */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6 mb-3 sm:mb-4 border-2 border-blue-200 shadow-lg">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2 sm:mb-3">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  <span className="text-base sm:text-lg font-bold text-blue-800">Tasks Reload In:</span>
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">24 Hours</div>
                <p className="text-sm sm:text-base text-gray-700 font-medium">Tasks will reload in 24 hours</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2 px-2">Come back tomorrow for more earning opportunities!</p>
              </div>
            </Card>

            {/* Progress Card */}
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 sm:p-4 mb-3 sm:mb-4 border-2 border-green-200">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="bg-green-100 rounded-full p-1.5 sm:p-2">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-green-800 text-sm sm:text-base">Today's Progress</div>
                  <div className="text-xs sm:text-sm text-green-600">{completedTasks}/{dailyLimit} surveys completed</div>
                </div>
                <Badge className="bg-green-100 text-green-800 border-green-300 text-xs">
                  Complete
                </Badge>
              </div>
            </Card>

            {/* Benefits Section */}
            <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 p-3 sm:p-4 mb-3 sm:mb-4 border-2 border-orange-200">
              <div className="text-center mb-3 sm:mb-4">
                <Package className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 mx-auto mb-2" />
                <h3 className="font-bold text-gray-800 mb-2 text-sm sm:text-base">Want More Tasks?</h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 px-2">Unlock additional earning opportunities!</p>
              </div>
              
              <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span>Earn up to 5,000 KSH daily</span>
                </div>
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span>No withdrawal limits</span>
                </div>
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span>M-Pesa withdrawals once eligible</span>
                </div>
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span>250 KSH per task completed</span>
                </div>
              </div>
            </Card>

            {/* Unlock Button */}
            <div className="space-y-2 sm:space-y-3">
              <Button 
                onClick={onUnlockTasks}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl touch-manipulation active:scale-95 h-12 sm:h-auto"
              >
                <div className="flex items-center justify-center gap-2">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">Unlock More Tasks</span>
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </div>
              </Button>
              
              <div className="text-center">
                <p className="text-xs text-gray-500 px-2">
                  Or wait 24 hours for tasks to reload
                </p>
              </div>
            </div>

            {/* Footer message */}
            <div className="text-center mt-3 sm:mt-4 p-2 sm:p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
              <p className="text-xs text-purple-800 px-1">
                ⭐ <span className="font-semibold">Pro Tip:</span> Premium task packages can unlock access to additional surveys.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModernDailyTaskLimitModal;
