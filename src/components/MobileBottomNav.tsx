import { Home, Search, Trophy, Wallet, User, Sparkles, TrendingUp, CreditCard, UserCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface MobileBottomNavProps {
  currentView: 'categories' | 'survey' | 'earnings' | 'withdrawal';
  onViewChange: (view: 'categories' | 'survey' | 'earnings' | 'withdrawal') => void;
  totalEarnings: number;
}

const MobileBottomNav = ({ currentView, onViewChange, totalEarnings }: MobileBottomNavProps) => {
  const navigate = useNavigate();
  const navItems = [
    {
      id: 'categories' as const,
      icon: Home,
      label: 'Home',
      active: currentView === 'categories',
      gradient: 'from-blue-500 to-purple-600'
    },
    {
      id: 'survey' as const,
      icon: Sparkles,
      label: 'Surveys',
      active: currentView === 'survey',
      gradient: 'from-emerald-500 to-teal-600'
    },
    {
      id: 'earnings' as const,
      icon: TrendingUp,
      label: 'Earnings',
      active: currentView === 'earnings',
      badge: totalEarnings > 0,
      gradient: 'from-amber-500 to-orange-600'
    },
    {
      id: 'withdrawal' as const,
      icon: CreditCard,
      label: 'Withdraw',
      active: currentView === 'withdrawal',
      gradient: 'from-rose-500 to-pink-600'
    },
    {
      id: 'profile' as const,
      icon: UserCircle2,
      label: 'Profile',
      active: false,
      gradient: 'from-violet-500 to-indigo-600'
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-gray-200/50 mobile-safe shadow-lg">
      <div className="flex items-center justify-around py-3 px-4">
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            size="sm"
            onClick={() => {
              // Always scroll to top on navigation
              window.scrollTo({ top: 0, behavior: 'smooth' })
              if (item.id === 'profile') {
                navigate('/profile');
              } else {
                onViewChange(item.id);
              }
            }}
            className={`flex flex-col items-center gap-1.5 p-3 h-auto min-h-[64px] hover:bg-gray-100/50 relative rounded-xl transition-all duration-200 ${
              item.active 
                ? 'text-white shadow-lg transform scale-105' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="relative">
              <div className={`p-2 rounded-xl transition-all duration-200 ${
                item.active 
                  ? `bg-gradient-to-br ${item.gradient} shadow-lg` 
                  : 'bg-transparent'
              }`}>
                <item.icon className={`w-5 h-5 transition-all duration-200 ${
                  item.active ? 'text-white' : 'text-gray-500'
                }`} />
              </div>
              {item.badge && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-red-500 to-red-600 rounded-full border-2 border-white shadow-sm">
                  <div className="w-full h-full bg-red-500 rounded-full animate-pulse" />
                </div>
              )}
            </div>
            <span className={`text-xs font-medium transition-all duration-200 ${
              item.active ? 'text-gray-800 font-semibold' : 'text-gray-500'
            }`}>
              {item.label}
            </span>
            {item.active && (
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-gradient-to-r from-transparent via-gray-400 to-transparent rounded-full" />
            )}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default MobileBottomNav;