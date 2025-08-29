import { useEffect, useState } from "react";
import { ArrowLeft, Trophy, Wallet, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import SurveyCategories from "@/components/survey/SurveyCategories";
import SurveyInterface from "@/components/survey/SurveyInterface";
import EarningsInterface from "@/components/survey/EarningsInterface";
import WithdrawalInterface from "@/components/survey/WithdrawalInterface";
import MobileBottomNav from "@/components/MobileBottomNav";
import MinimumWithdrawalModal from "@/components/ui/MinimumWithdrawalModal";
import ModernDailyTaskLimitModal from "@/components/ui/ModernDailyTaskLimitModal";
import { useAuth } from "@/contexts/AuthContext";

const SurveyPlatform = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<'categories' | 'survey' | 'earnings' | 'withdrawal'>('categories');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const { user, balance, profile, getSurveyStatus, completeSurvey } = useAuth();
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [showMinimumModal, setShowMinimumModal] = useState(false);
  const [showTaskLimitModal, setShowTaskLimitModal] = useState(false);
  const [surveyStatus, setSurveyStatus] = useState({
    surveys_completed: 0,
    daily_limit: 2,
    can_complete_survey: true,
    is_account_activated: false,
    is_platinum_user: false
  });

  // Keep local total in sync with server-side balance and load survey status
  useEffect(() => {
    setTotalEarnings(balance || 0);
  }, [balance]);

  useEffect(() => {
    if (user) {
      loadSurveyStatus();
    }
  }, [user]);

  const loadSurveyStatus = async () => {
    try {
      const status = await getSurveyStatus();
      setSurveyStatus(status);
    } catch (error) {
      console.error('Error loading survey status:', error);
    }
  };

  const handleStartSurvey = async (category: string) => {
    // Check if user can complete survey before starting
    if (!surveyStatus.can_complete_survey) {
      setShowTaskLimitModal(true);
      return;
    }
    
    setSelectedCategory(category);
    setCurrentView('survey');
  };

  const handleSurveyComplete = async (earnings: number) => {
    try {
      // Use database function to complete survey
      const result = await completeSurvey(selectedCategory);
      
      if (result.success) {
        // Update survey status
        setSurveyStatus(prev => ({
          ...prev,
          surveys_completed: result.surveys_completed,
          can_complete_survey: result.surveys_completed < result.daily_limit
        }));
        
        // Show task limit modal if needed
        if (result.show_task_limit_modal) {
          setShowTaskLimitModal(true);
        }
        
        setCurrentView('earnings');
      } else {
        console.error('Survey completion failed:', result.message);
      }
    } catch (error) {
      console.error('Error completing survey:', error);
    }
  };

  const canStartNewSurvey = () => {
    return surveyStatus.can_complete_survey;
  };

  const handleAccountActivation = async () => {
    await loadSurveyStatus(); // Refresh status after activation
  };

  const handleBackToCategories = () => {
    setCurrentView('categories');
    setSelectedCategory('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background pt-0 pb-28">
      {/* Mobile Header - App Style (fixed under site header) */}
      <header
        className="mobile-header fixed left-0 right-0 z-40 shadow-none relative overflow-hidden h-36 sm:h-44"
        style={{
          top: 0,
          paddingTop: 'env(safe-area-inset-top)',
          backgroundImage: 'url(https://www.therodinhoods.com/wp-content/uploads/2017/10/Web-Application-Development.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/40"></div>
        <div className="mobile-container pt-3 pb-0 sm:pt-4 sm:pb-0 relative z-10">
          {/* Top Row - Navigation & Status */}
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="gap-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <div className="text-center">
              <h1 className="text-lg font-bold text-white">EarnSpark Survey</h1>
              <p className="text-xs text-white/70">Earn as you answer</p>
            </div>
            
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
          </div>
          
          {/* Earnings Card - Mobile Centered */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-accent to-accent/80 rounded-full flex items-center justify-center shadow-lg">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs text-white/70 font-medium">Total Balance</p>
                  <p className="text-2xl font-bold text-white">
                    KSh {totalEarnings.toLocaleString()}
                  </p>
                </div>
              </div>
              
              <Button
                onClick={() => {
                  if (totalEarnings < 1000) {
                    setShowMinimumModal(true);
                  } else {
                    setCurrentView('withdrawal');
                  }
                }}
                className="bg-accent hover:bg-accent/90 text-white rounded-full px-6 py-2 font-semibold shadow-lg"
              >
                Withdraw
              </Button>
            </div>
          </div>
        </div>
      </header>
      {/* Main Content - Mobile Optimized (offset for fixed banner height) */}
      <main className="mobile-container pb-6 pt-36 sm:pt-44 -mt-20 sm:-mt-20">
        <div className="animate-slide-up">
          {currentView === 'categories' && (
            <SurveyCategories 
              onStartSurvey={handleStartSurvey}
            />
          )}
          
          {currentView === 'survey' && (
            <SurveyInterface
              category={selectedCategory}
              onComplete={handleSurveyComplete}
              onBack={handleBackToCategories}
            />
          )}
          
          {currentView === 'earnings' && (
            <EarningsInterface
              earnings={150}
              totalEarnings={totalEarnings}
              onContinue={handleBackToCategories}
              onWithdraw={() => setCurrentView('withdrawal')}
            />
          )}
          
          {currentView === 'withdrawal' && (
            <WithdrawalInterface
              totalEarnings={totalEarnings}
              onBack={() => setCurrentView('categories')}
              onStartEarning={() => setCurrentView('categories')}
              completedTasks={surveyStatus.surveys_completed}
              isAccountActive={surveyStatus.is_account_activated || profile?.account_activated || false}
              onAccountActivation={handleAccountActivation}
            />
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav 
        currentView={currentView} 
        onViewChange={setCurrentView}
        totalEarnings={totalEarnings}
      />

      {/* Minimum Withdrawal Modal */}
      <MinimumWithdrawalModal
        open={showMinimumModal}
        onOpenChange={setShowMinimumModal}
        currentBalance={totalEarnings}
        onStartEarning={() => {
          setShowMinimumModal(false);
          setCurrentView('categories');
        }}
      />

      {/* Task Limit Modal */}
      <ModernDailyTaskLimitModal
        open={showTaskLimitModal}
        onOpenChange={setShowTaskLimitModal}
        completedTasks={surveyStatus.surveys_completed}
        dailyLimit={surveyStatus.daily_limit}
        onUnlockTasks={() => {
          setShowTaskLimitModal(false);
          setCurrentView('withdrawal');
        }}
      />
    </div>
  );
};

export default SurveyPlatform;