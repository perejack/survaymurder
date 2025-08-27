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
    <div className="max-w-lg mx-auto space-y-8 text-center">
      {/* Success Animation */}
      <div className="space-y-6">
        <div className="relative">
          <div className="w-24 h-24 mx-auto gradient-success rounded-full flex items-center justify-center animate-bounce shadow-glow">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          {showConfetti && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-4xl animate-pulse">🎉</div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-success">Survey Complete!</h2>
          <p className="text-muted-foreground">
            Congratulations! You've successfully completed the survey.
          </p>
        </div>
      </div>

      {/* Earnings Display */}
      <Card className="p-8 shadow-elevated bg-gradient-to-br from-card to-accent/5">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Trophy className="w-5 h-5" />
              <span>You earned</span>
            </div>
            <div className="text-5xl font-bold gradient-earning bg-clip-text text-transparent">
              KSh {animatedEarnings.toLocaleString()}
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Survey Reward:</span>
              <span className="font-semibold">+KSh {earnings}</span>
            </div>
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total Balance:</span>
              <span className="gradient-earning bg-clip-text text-transparent">
                KSh {totalEarnings.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Achievement Badges */}
          <div className="flex justify-center gap-4">
            <div className="flex items-center gap-2 bg-success/10 text-success px-3 py-2 rounded-full text-sm">
              <Zap className="w-4 h-4" />
              <span>Fast Earner</span>
            </div>
            <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-2 rounded-full text-sm">
              <Trophy className="w-4 h-4" />
              <span>Survey Master</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="space-y-4">
        <Button
          onClick={onWithdraw}
          size="lg"
          className="w-full gradient-earning text-white hover:opacity-90 hover:scale-105 transition-all duration-300 shadow-lg text-lg py-6"
        >
          <Wallet className="w-5 h-5" />
          Withdraw to M-Pesa
          <ArrowRight className="w-5 h-5" />
        </Button>

        <Button
          onClick={onContinue}
          variant="outline"
          size="lg"
          className="w-full hover-lift"
        >
          Take Another Survey
        </Button>
      </div>

      {/* Motivational Message */}
      <div className="bg-primary/10 text-primary p-4 rounded-lg">
        <p className="text-sm">
          <strong>Keep going!</strong> Complete more surveys to maximize your earnings. 
          Each survey takes just a few minutes and pays KSh 150.
        </p>
      </div>
    </div>
  );
};

export default EarningsInterface;