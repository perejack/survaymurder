import { useState } from "react";
import { ArrowRight, Smartphone, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/auth/AuthModal";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-image.jpg";

const Hero = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Removed animated daily earnings counter to avoid implying specific earning amounts

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
              Complete Tasks
              <span className="block gradient-earning bg-clip-text text-transparent">
                Earn Rewards
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto">
              Complete available tasks and earn rewards. Earnings vary by task and availability.
            </p>
          </div>


          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up animate-delay-300">
            <Button 
              size="lg" 
              className="w-full sm:w-auto gradient-earning text-white font-semibold px-8 py-6 text-lg hover-bounce animate-pulse-glow"
              onClick={() => user ? navigate('/survey') : setAuthModalOpen(true)}
            >
              <Smartphone className="w-5 h-5 mr-2" />
              {user ? 'Continue to Tasks' : 'Get Started'}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            <Button 
              size="lg" 
              variant="outline" 
              className="w-full sm:w-auto bg-white/10 border-white/30 text-white hover:bg-white/20 px-8 py-6 text-lg backdrop-blur-sm"
              onClick={() => navigate('/#earn')}
            >
              <Zap className="w-5 h-5 mr-2" />
              See How It Works
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="pt-8 animate-slide-up animate-delay-300">
            <p className="text-white/70 text-sm mb-4">Tasks subject to availability • Withdrawal eligibility requirements apply • Terms and conditions apply</p>
            <div className="flex justify-center items-center gap-6 opacity-60">
              <span className="text-sm">🇰🇪 Kenya Based</span>
              <span className="text-sm">📱 M-Pesa Supported</span>
              <span className="text-sm">✅ Terms Apply</span>
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