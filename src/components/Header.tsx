import { Smartphone, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { UserProfile } from "@/components/auth/UserProfile";
import { AuthModal } from "@/components/auth/AuthModal";
import { useState } from "react";
import { useLocation } from "react-router-dom";

const Header = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const isSurvey = location.pathname.startsWith('/survey');
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 ${isSurvey ? 'bg-transparent' : 'bg-background/95 border-border backdrop-blur-sm border-b'}`}>
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-hero rounded-lg flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <span className={`text-xl font-bold ${isSurvey ? 'text-white' : 'text-foreground'}`}>EarnSpark</span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <a href="/#tasks" className="text-muted-foreground hover:text-foreground transition-colors">
              Tasks
            </a>
            <a href="/#earn" className="text-muted-foreground hover:text-foreground transition-colors">
              How to Earn
            </a>
            <a href="/#withdraw" className="text-muted-foreground hover:text-foreground transition-colors">
              Withdraw
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {!loading && (
              user ? (
                <UserProfile />
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    className="hidden md:flex"
                    onClick={() => setAuthModalOpen(true)}
                  >
                    Sign In
                  </Button>
                  <Button 
                    className="gradient-hero text-white hover:opacity-90"
                    onClick={() => setAuthModalOpen(true)}
                  >
                    Get Started
                  </Button>
                </>
              )
            )}
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>
      
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </>
  );
};

export default Header;