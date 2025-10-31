import { useEffect, useState } from "react";
import { CheckCircle2, Trophy, Zap, ArrowRight, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import confetti from 'canvas-confetti';

interface EarningsInterfaceProps {
  earnings: number;
  totalEarnings: number;
  onContinue: () => void;
  onWithdraw: () => void;
}

const EarningsInterface = ({ earnings, totalEarnings, onContinue, onWithdraw }: EarningsInterfaceProps) => {
  const [animatedEarnings, setAnimatedEarnings] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Trigger confetti
    const timer = setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      setShowConfetti(true);
    }, 500);

    // Animate earnings counter
    const duration = 2000;
    const steps = 60;
    const increment = earnings / steps;
    let current = 0;

    const counter = setInterval(() => {
      current += increment;
      if (current >= earnings) {
        setAnimatedEarnings(earnings);
        clearInterval(counter);
      } else {
        setAnimatedEarnings(Math.floor(current));
      }
    }, duration / steps);

    return () => {
      clearTimeout(timer);
      clearInterval(counter);
    };
  }, [earnings]);

  return (
    <div className="w-full max-w-lg mx-auto px-4 sm:px-6 space-y-6 sm:space-y-8 text-center">
      {/* Success Animation */}
      <div className="space-y-4 sm:space-y-6">
        <div className="relative">
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto gradient-success rounded-full flex items-center justify-center animate-bounce shadow-glow">
            <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
          </div>
          {showConfetti && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-3xl sm:text-4xl animate-pulse">🎉</div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-success">Survey Complete!</h2>
          <p className="text-sm sm:text-base text-muted-foreground px-2">
            Congratulations! You've successfully completed the survey.
          </p>
        </div>
      </div>

      {/* Earnings Display */}
      <Card className="p-4 sm:p-8 shadow-elevated bg-gradient-to-br from-card to-accent/5 mx-2 sm:mx-0">
        <div className="space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">You earned</span>
            </div>
            <div className="text-4xl sm:text-5xl font-bold gradient-earning bg-clip-text text-transparent">
              Reward Added
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm sm:text-base">Task Completed:</span>
              <span className="font-semibold text-sm sm:text-base">✓ Success</span>
            </div>
            <div className="flex justify-between items-center text-base sm:text-lg font-bold">
              <span>Account Status:</span>
              <span className="gradient-earning bg-clip-text text-transparent">
                Active
              </span>
            </div>
          </div>

          {/* Achievement Badges */}
          <div className="flex justify-center gap-2 sm:gap-4 flex-wrap">
            <div className="flex items-center gap-2 bg-success/10 text-success px-2 sm:px-3 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Fast Earner</span>
            </div>
            <div className="flex items-center gap-2 bg-primary/10 text-primary px-2 sm:px-3 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm">
              <Trophy className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Survey Master</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="space-y-3 sm:space-y-4 px-2 sm:px-0">
        <Button
          onClick={onWithdraw}
          size="lg"
          className="w-full gradient-earning text-white hover:opacity-90 hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg text-base sm:text-lg h-12 sm:h-16 touch-manipulation"
        >
          <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="mx-2">Withdraw to M-Pesa</span>
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>

        <Button
          onClick={onContinue}
          variant="outline"
          size="lg"
          className="w-full hover-lift h-12 sm:h-14 text-base sm:text-lg touch-manipulation active:scale-95 transition-transform"
        >
          Take Another Survey
        </Button>
      </div>

      {/* Disclaimer Message */}
      <div className="bg-warning/10 text-warning p-3 sm:p-4 rounded-lg mx-2 sm:mx-0">
        <p className="text-xs sm:text-sm">
          <strong>Note:</strong> Task rewards vary based on availability and other factors. 
          No specific earning amounts are guaranteed. Terms and conditions apply.
        </p>
      </div>
    </div>
  );
};

export default EarningsInterface;