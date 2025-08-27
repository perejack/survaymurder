import { useState, useEffect } from "react";
import { ArrowRight, Smartphone, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/auth/AuthModal";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-image.jpg";

const Hero = () => {
  const [earnings, setEarnings] = useState(0);
  const [activeUsers, setActiveUsers] = useState(12847);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Animate earning counter
    const targetEarnings = 5847;
    const increment = targetEarnings / 100;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= targetEarnings) {
        setEarnings(targetEarnings);
        clearInterval(timer);
      } else {
        setEarnings(Math.floor(current));
      }
    }, 20);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-10 sm:pt-28">
      {/* Background with overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Kenyan users earning money"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/60 to-accent/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Main heading */}
          <div className="space-y-4 animate-slide-up">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
              Earn Real Money
              <span className="block gradient-earning bg-clip-text text-transparent">
                Doing Simple Tasks
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto">
              Join thousands of Kenyans earning extra income through verified tasks. 
              Withdraw directly to your M-Pesa account.
            </p>
          </div>

          {/* Stats */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-slide-up animate-delay-200">
            <Card className="gradient-card p-6 hover-lift border-0 shadow-elevated">
              <div className="text-center">
                <div className="text-3xl font-bold text-accent mb-2">
                  KSh {earnings.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  Earned Today
                </div>
              </div>
            </Card>
            
            <Card className="gradient-card p-6 hover-lift border-0 shadow-elevated">
              <div className="text-center">
                <div className="text-3xl font-bold text-success mb-2">
                  {activeUsers.toLocaleString()}+
                </div>
                <div className="text-sm text-muted-foreground">
                  Active Earners
                </div>
              </div>
            </Card>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up animate-delay-300">
            <Button 
              size="lg" 
              className="w-full sm:w-auto gradient-earning text-white font-semibold px-8 py-6 text-lg hover-bounce animate-pulse-glow"
              onClick={() => user ? navigate('/survey') : setAuthModalOpen(true)}
            >
              <Smartphone className="w-5 h-5 mr-2" />
              {user ? 'Continue Earning' : 'Start Earning Now'}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            <Button 
              size="lg" 
              variant="outline" 
              className="w-full sm:w-auto bg-white/10 border-white/30 text-white hover:bg-white/20 px-8 py-6 text-lg backdrop-blur-sm"
            >
              <Zap className="w-5 h-5 mr-2" />
              See How It Works
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="pt-8 animate-slide-up animate-delay-300">
            <p className="text-white/70 text-sm mb-4">Trusted by thousands • Instant M-Pesa withdrawals • Verified tasks only</p>
            <div className="flex justify-center items-center gap-6 opacity-60">
              <span className="text-sm">🇰🇪 Made for Kenya</span>
              <span className="text-sm">📱 M-Pesa Ready</span>
              <span className="text-sm">✅ Verified Safe</span>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </section>
  );
};

export default Hero;