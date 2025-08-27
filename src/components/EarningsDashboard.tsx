import { useState, useEffect } from "react";
import { TrendingUp, DollarSign, Clock, Zap, Smartphone } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const EarningsDashboard = () => {
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [weeklyEarnings, setWeeklyEarnings] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);

  useEffect(() => {
    // Animate counters
    const animateCounter = (setter: (value: number) => void, target: number, duration: number) => {
      let start = 0;
      const increment = target / (duration / 16);
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
          setter(target);
          clearInterval(timer);
        } else {
          setter(Math.floor(start));
        }
      }, 16);
      
      return timer;
    };

    const timer1 = animateCounter(setTodayEarnings, 1247, 2000);
    const timer2 = animateCounter(setWeeklyEarnings, 8934, 2500);
    const timer3 = animateCounter(setCompletedTasks, 23, 1500);

    return () => {
      clearInterval(timer1);
      clearInterval(timer2);
      clearInterval(timer3);
    };
  }, []);

  return (
    <section id="earn" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Your Earning
            <span className="block gradient-earning bg-clip-text text-transparent">
              Dashboard Preview
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Track your progress, manage your tasks, and watch your earnings grow in real-time.
          </p>
        </div>

        {/* Dashboard mockup */}
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
                  KSh {todayEarnings.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Today's Earnings</div>
                <div className="text-xs text-success mt-1">+23% from yesterday</div>
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
                  KSh {weeklyEarnings.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">This Week</div>
                <div className="text-xs text-success mt-1">+45% from last week</div>
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
                  {completedTasks}
                </div>
                <div className="text-sm text-muted-foreground">Tasks Completed</div>
                <div className="text-xs text-primary mt-1">7 in progress</div>
              </div>
            </Card>
          </div>

          {/* Progress section */}
          <Card className="gradient-card p-8 shadow-elevated animate-slide-up animate-delay-300">
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">Weekly Goal Progress</h3>
                <p className="text-muted-foreground">You're doing great! Keep it up to reach your target.</p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Earnings Goal</span>
                  <span className="text-sm text-muted-foreground">KSh 8,934 / KSh 15,000</span>
                </div>
                <Progress value={59.6} className="h-3" />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Task Completion</span>
                  <span className="text-sm text-muted-foreground">23 / 30 tasks</span>
                </div>
                <Progress value={76.7} className="h-3" />
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
                <h3 className="text-2xl font-bold mb-4">Instant M-Pesa Withdrawals</h3>
                <p className="text-success-foreground/90 mb-6">
                  Withdraw your earnings instantly to your M-Pesa account. No waiting, no fees, no hassle.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="text-lg font-bold">Instant</div>
                    <div className="text-sm opacity-90">Processing</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="text-lg font-bold">0%</div>
                    <div className="text-sm opacity-90">Fees</div>
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
      </div>
    </section>
  );
};

export default EarningsDashboard;