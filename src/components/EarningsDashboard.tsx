import { useState, useEffect } from "react";
import { TrendingUp, DollarSign, Clock, Zap, Smartphone, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PhonePaymentPopup } from "@/components/survey/PhonePaymentPopup";

const EarningsDashboard = () => {
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [weeklyEarnings, setWeeklyEarnings] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [isAccountActive, setIsAccountActive] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const activationFee = 150; // set from UI/config as needed

  useEffect(() => {
    // Removed fake earning counters to comply with advertising policies
    // Real earnings should come from actual user data
  }, [isAccountActive]);

  const handlePaymentSuccess = () => {
    setIsAccountActive(true);
    setIsPopupOpen(false);
  };

  return (
    <>
      <PhonePaymentPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
        amount={activationFee}
      />
      <section id="earn" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Your Earning
              <span className="block gradient-earning bg-clip-text text-transparent">
                Dashboard
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {!isAccountActive
                ? "Account activation may be required to participate."
                : "Track your task completion progress."}
            </p>
            <p className="text-sm text-warning bg-warning/10 p-3 rounded-lg mt-4 max-w-2xl mx-auto">
              <strong>⚠️ Important Disclaimer:</strong> This is a task-based platform. Earnings vary significantly based on task availability, 
              completion quality, user location, and other factors. We do not guarantee any specific income amount, 
              regular task availability, or withdrawal eligibility. Past performance does not indicate future results.
            </p>
          </div>

          {!isAccountActive ? (
            <div className="max-w-2xl mx-auto">
              <Card className="gradient-card p-8 text-center shadow-elevated animate-slide-up">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShieldCheck className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Activate Your Account (Refundable)</h3>
                <p className="text-muted-foreground mb-4">
                  One-time activation fee of KSh 125 is required to verify your account.
                </p>
                <div className="bg-success/10 border border-success/30 rounded-lg p-3 mb-6">
                  <p className="text-sm text-success font-semibold mb-1">💰 Fee is 100% Refundable!</p>
                  <p className="text-sm text-muted-foreground">
                    Your KSh 125 activation fee will be refunded to your account balance once you reach 
                    the minimum withdrawal threshold. This helps us verify serious users while ensuring 
                    you don't lose any money.
                  </p>
                </div>
                <Button 
                  onClick={() => setIsPopupOpen(true)}
                  className="gradient-hero text-white hover:opacity-90 w-full sm:w-auto"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Activate Now
                </Button>
              </Card>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              {/* Header stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="gradient-card p-6 hover-lift shadow-elevated animate-slide-up">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 gradient-earning rounded-xl flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <TrendingUp className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-accent mb-1">
                      --
                    </div>
                    <div className="text-sm text-muted-foreground">Today's Activity</div>
                    <div className="text-xs text-muted-foreground mt-1">Varies by availability</div>
                  </div>
                </Card>

                <Card className="gradient-card p-6 hover-lift shadow-elevated animate-slide-up animate-delay-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 gradient-success rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <Zap className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-success mb-1">
                      --
                    </div>
                    <div className="text-sm text-muted-foreground">This Week</div>
                    <div className="text-xs text-muted-foreground mt-1">Performance varies</div>
                  </div>
                </Card>

                <Card className="gradient-card p-6 hover-lift shadow-elevated animate-slide-up animate-delay-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 gradient-hero rounded-xl flex items-center justify-center">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                      Active
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary mb-1">
                      --
                    </div>
                    <div className="text-sm text-muted-foreground">Tasks Completed</div>
                    <div className="text-xs text-muted-foreground mt-1">Track your progress</div>
                  </div>
                </Card>
              </div>

              {/* Progress section */}
              <Card className="gradient-card p-8 shadow-elevated animate-slide-up animate-delay-300">
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-2">Task Progress</h3>
                    <p className="text-muted-foreground">Complete available tasks to earn rewards.</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      <strong>Disclaimer:</strong> Individual results vary. Earnings depend on multiple factors including task availability, 
                      quality of work, and account eligibility. No specific income amounts are guaranteed.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button className="flex-1 gradient-hero text-white hover:opacity-90">
                      <Smartphone className="w-4 h-4 mr-2" />
                      View Available Tasks
                    </Button>
                    <Button variant="outline" className="flex-1 hover-lift">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Withdraw to M-Pesa
                    </Button>
                  </div>
                </div>
              </Card>

              {/* M-Pesa integration highlight */}
              <div className="mt-12 text-center">
                <Card className="gradient-success p-8 text-white shadow-elevated hover-lift">
                  <div className="max-w-2xl mx-auto">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Smartphone className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">M-Pesa Withdrawals</h3>
                    <p className="text-success-foreground/90 mb-6">
                      Withdrawals subject to eligibility requirements, minimum thresholds, and processing fees. 
                      Availability and timing not guaranteed.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <div className="bg-white/10 rounded-lg p-4">
                        <div className="text-lg font-bold">Fast</div>
                        <div className="text-sm opacity-90">Processing</div>
                      </div>
                      <div className="bg-white/10 rounded-lg p-4">
                        <div className="text-lg font-bold">Transparent</div>
                        <div className="text-sm opacity-90">Fees may apply</div>
                      </div>
                      <div className="bg-white/10 rounded-lg p-4">
                        <div className="text-lg font-bold">24/7</div>
                        <div className="text-sm opacity-90">Available</div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default EarningsDashboard;