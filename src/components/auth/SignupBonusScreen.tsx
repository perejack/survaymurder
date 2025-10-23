import { useState, useEffect } from 'react';
import { Trophy, Sparkles, ArrowRight, Gift, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface SignupBonusScreenProps {
  onContinue: () => void;
  userName?: string;
}

const SignupBonusScreen = ({ onContinue, userName }: SignupBonusScreenProps) => {
  const [showBonus, setShowBonus] = useState(false);
  const [animatedAmount, setAnimatedAmount] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Trigger animations in sequence
    const timer1 = setTimeout(() => setShowBonus(true), 500);
    const timer2 = setTimeout(() => setShowConfetti(true), 800);
    
    // Animate the bonus amount
    const timer3 = setTimeout(() => {
      let current = 0;
      const target = 250;
      const increment = target / 30;
      
      const countUp = setInterval(() => {
        current += increment;
        if (current >= target) {
          setAnimatedAmount(target);
          clearInterval(countUp);
        } else {
          setAnimatedAmount(Math.floor(current));
        }
      }, 50);
    }, 1000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-primary via-primary/90 to-accent flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {showConfetti && (
          <>
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              >
                <Sparkles className="w-4 h-4 text-accent opacity-60" />
              </div>
            ))}
          </>
        )}
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center max-w-md w-full">
        {/* Welcome message */}
        <div className="mb-8 animate-slide-up">
          <div className="w-20 h-20 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
            <Gift className="w-10 h-10 text-white animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome{userName ? `, ${userName}` : ''}! 🎉
          </h1>
          <p className="text-white/80 text-lg">
            You've successfully joined EarnSpark
          </p>
        </div>

        {/* Bonus card */}
        <Card className={`gradient-card p-8 mb-8 border-0 shadow-2xl transform transition-all duration-1000 ${
          showBonus ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
        }`}>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-accent to-accent/80 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Signup Bonus Unlocked!
            </h2>
            
            <div className="relative">
              <div className="text-5xl font-bold gradient-earning bg-clip-text text-transparent mb-2">
                KSh {animatedAmount.toLocaleString()}
              </div>
              {showConfetti && (
                <div className="absolute -top-2 -right-2">
                  <Zap className="w-6 h-6 text-accent animate-bounce" />
                </div>
              )}
            </div>
            
            <p className="text-muted-foreground text-sm">
              Added to your account balance
            </p>
          </div>
        </Card>

        {/* Features preview */}
        <div className="grid grid-cols-2 gap-4 mb-8 animate-slide-up animate-delay-300">
          <Card className="gradient-card p-4 border-0 shadow-lg hover-lift">
            <div className="text-center">
              <div className="w-10 h-10 mx-auto mb-2 bg-success/20 rounded-full flex items-center justify-center">
                <Trophy className="w-5 h-5 text-success" />
              </div>
              <p className="text-sm font-medium">Earn More</p>
              <p className="text-xs text-muted-foreground">Complete surveys</p>
            </div>
          </Card>
          
          <Card className="gradient-card p-4 border-0 shadow-lg hover-lift">
            <div className="text-center">
              <div className="w-10 h-10 mx-auto mb-2 bg-accent/20 rounded-full flex items-center justify-center">
                <Zap className="w-5 h-5 text-accent" />
              </div>
              <p className="text-sm font-medium">Quick Withdraw</p>
              <p className="text-xs text-muted-foreground">Direct to M-Pesa</p>
            </div>
          </Card>
        </div>

        {/* Continue button */}
        <Button
          onClick={onContinue}
          size="lg"
          className="w-full gradient-earning text-white font-semibold py-6 text-lg hover-bounce animate-pulse-glow"
        >
          Start Earning Now
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>

        <p className="text-white/60 text-sm mt-4">
          Your bonus has been added to your account
        </p>
      </div>
    </div>
  );
};

export default SignupBonusScreen;
