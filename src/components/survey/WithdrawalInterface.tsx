import React, { useState, useEffect } from 'react';
import { ArrowLeft, Smartphone, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { initiateWithdrawal, pollWithdrawalStatus, validatePhoneNumber, WithdrawalStatus } from '@/utils/withdrawalService';
import MinimumWithdrawalModal from "@/components/ui/MinimumWithdrawalModal";
import AccountActivationModal from "@/components/ui/AccountActivationModal";
import ActivationFeeModal from "@/components/ui/ActivationFeeModal";
import AccountWarningModal from "@/components/ui/AccountWarningModal";
import AccountOptionsModal from "@/components/ui/AccountOptionsModal";
import PlatinumUpgradeModal from "@/components/ui/PlatinumUpgradeModal";
import PlatinumWithdrawalModal from "@/components/ui/PlatinumWithdrawalModal";
import ModernDailyTaskLimitModal from "@/components/ui/ModernDailyTaskLimitModal";
import ModernTaskPackagesModal from "@/components/ui/ModernTaskPackagesModal";
import WithdrawalSuccessModal from "@/components/ui/WithdrawalSuccessModal";

interface WithdrawalInterfaceProps {
  totalEarnings: number;
  onBack: () => void;
  onStartEarning?: () => void;
}

const WithdrawalInterface = ({ totalEarnings, onBack, onStartEarning }: WithdrawalInterfaceProps) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [withdrawalMethod, setWithdrawalMethod] = useState('mpesa');
  const [withdrawalStep, setWithdrawalStep] = useState<'input' | 'processing' | 'success' | 'failed'>('input');
  const [statusMessage, setStatusMessage] = useState('');
  const [showMinimumModal, setShowMinimumModal] = useState(false);
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [showActivationFeeModal, setShowActivationFeeModal] = useState(false);
  const [showAccountWarningModal, setShowAccountWarningModal] = useState(false);
  const [showAccountOptionsModal, setShowAccountOptionsModal] = useState(false);
  const [showPlatinumUpgradeModal, setShowPlatinumUpgradeModal] = useState(false);
  const [showPlatinumWithdrawalModal, setShowPlatinumWithdrawalModal] = useState(false);
  const [showDailyTaskLimitModal, setShowDailyTaskLimitModal] = useState(false);
  const [showTaskPackagesModal, setShowTaskPackagesModal] = useState(false);
  const [showWithdrawalSuccessModal, setShowWithdrawalSuccessModal] = useState(false);
  const [isAccountActive, setIsAccountActive] = useState(false);
  const [isPlatinumUser, setIsPlatinumUser] = useState(false);
  const [completedTasks, setCompletedTasks] = useState(0);
  
  // Track survey completion and show task limit modal on 3rd attempt
  const handleSurveyCompletion = () => {
    const newCompletedTasks = completedTasks + 1;
    setCompletedTasks(newCompletedTasks);
    
    // Show task exhaustion modal only after 3rd survey attempt
    if (newCompletedTasks >= 3) {
      setShowDailyTaskLimitModal(true);
    }
  };
  
  // Expose survey completion handler to parent component
  useEffect(() => {
    if (onStartEarning) {
      // Override the onStartEarning to include our tracking
      const originalOnStartEarning = onStartEarning;
      (window as any).handleSurveyCompletion = handleSurveyCompletion;
    }
  }, [completedTasks, onStartEarning]);
  const [dailyTaskLimit, setDailyTaskLimit] = useState(3);
    const { toast } = useToast();

  const minWithdrawal = 1000;
  const maxWithdrawal = totalEarnings;

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
  };

  const handleWithdraw = async () => {
    // Check minimum balance first
    if (totalEarnings < minWithdrawal) {
      setShowMinimumModal(true);
      return;
    }

    // Check account activation status
    if (!isAccountActive) {
      setShowActivationModal(true);
      return;
    }

    if (!phoneNumber || !amount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const withdrawAmount = parseInt(amount);
    const remainingBalance = totalEarnings - withdrawAmount;
    
    // Dynamic minimum balance - always ensure user needs to upgrade or do more surveys
    const calculateMinimumBalance = (totalBalance: number) => {
      // Always require at least 30% of total balance to remain
      // This ensures users can never fully withdraw without upgrading
      return Math.max(350, Math.floor(totalBalance * 0.3));
    };
    
    const dynamicMinimumBalance = calculateMinimumBalance(totalEarnings);
    
    // Check if withdrawal would leave account below dynamic minimum
    if (!isPlatinumUser && remainingBalance < dynamicMinimumBalance) {
      setShowAccountWarningModal(true);
      return;
    }

    // For platinum users, show platinum withdrawal modal for full withdrawals
    if (isPlatinumUser && withdrawAmount === totalEarnings) {
      setShowPlatinumWithdrawalModal(true);
      return;
    }
    if (withdrawAmount < minWithdrawal || withdrawAmount > maxWithdrawal) {
      toast({
        title: "Invalid Amount",
        description: `Amount must be between KSh ${minWithdrawal} and KSh ${maxWithdrawal}.`,
        variant: "destructive"
      });
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid Kenyan phone number.",
        variant: "destructive"
      });
      return;
    }

    // Additional safety check - non-platinum users should never reach here
    // They should be blocked by dynamic minimum balance above
    if (!isPlatinumUser) {
      // Force them back to the warning modal instead of processing
      setShowAccountWarningModal(true);
      return;
    }

    setWithdrawalStep('processing');
    setStatusMessage('STK Push sent. Please check your phone and enter your M-Pesa PIN.');

    try {
      const withdrawalResponse = await initiateWithdrawal(phoneNumber, withdrawAmount, 'EarnSpark Withdrawal');
      
      if (withdrawalResponse.success && withdrawalResponse.data?.externalReference) {
        const stopPolling = pollWithdrawalStatus(
          withdrawalResponse.data.externalReference,
          (status: WithdrawalStatus) => {
            if (status.success && status.payment) {
              if (status.payment.status === 'SUCCESS') {
                setWithdrawalStep('success');
                setStatusMessage(`KSh ${withdrawAmount} has been sent to ${phoneNumber}`);
                toast({
                  title: "Withdrawal Successful!",
                  description: `KSh ${withdrawAmount} has been sent to ${phoneNumber}`,
                });
                stopPolling();
              } else if (status.payment.status === 'FAILED') {
                setWithdrawalStep('failed');
                const failureReason = status.payment.resultDesc || "Please try again.";
                setStatusMessage(failureReason);
                toast({
                  title: "Withdrawal Failed",
                  description: failureReason,
                  variant: "destructive"
                });
                stopPolling();
                
                // Reset to input form after 3 seconds
                setTimeout(() => {
                  setWithdrawalStep('input');
                  setStatusMessage('');
                }, 3000);
              }
            }
          }
        );
      } else {
        setWithdrawalStep('failed');
        const errorMessage = withdrawalResponse.message || "Failed to initiate withdrawal.";
        setStatusMessage(errorMessage);
        toast({
          title: "Withdrawal Failed",
          description: errorMessage,
          variant: "destructive"
        });
        
        // Reset to input form after 3 seconds
        setTimeout(() => {
          setWithdrawalStep('input');
          setStatusMessage('');
        }, 3000);
      }
    } catch (error) {
      setWithdrawalStep('failed');
      setStatusMessage('Network error. Please check your connection and try again.');
      toast({
        title: "Network Error",
        description: "Please check your connection and try again.",
        variant: "destructive"
      });
      
      // Reset to input form after 3 seconds
      setTimeout(() => {
        setWithdrawalStep('input');
        setStatusMessage('');
      }, 3000);
    }
  };


  
  // Processing State - Show loading with real-time status
  if (withdrawalStep === 'processing') {
    return (
      <div className="max-w-lg mx-auto space-y-8 text-center">
        <div className="space-y-6">
          <div className="w-24 h-24 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">Processing Withdrawal</h2>
            <p className="text-muted-foreground">
              {statusMessage}
            </p>
          </div>
        </div>

        <Card className="p-6 shadow-elevated">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Amount:</span>
              <span className="font-bold text-lg">KSh {amount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>To:</span>
              <span className="font-medium">{phoneNumber}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Status:</span>
              <span className="text-blue-600 font-medium">Waiting for confirmation</span>
            </div>
          </div>
        </Card>

        <Alert>
          <Smartphone className="h-4 w-4" />
          <AlertDescription>
            Please check your phone and enter your M-Pesa PIN to complete the withdrawal.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Failed State - Show error with auto-reset
  if (withdrawalStep === 'failed') {
    return (
      <div className="max-w-lg mx-auto space-y-8 text-center">
        <div className="space-y-6">
          <div className="w-24 h-24 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-12 h-12 text-red-600" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-red-600">Withdrawal Failed</h2>
            <p className="text-muted-foreground">
              {statusMessage}
            </p>
          </div>
        </div>

        <Card className="p-6 shadow-elevated border-red-200">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Amount:</span>
              <span className="font-bold text-lg">KSh {amount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>To:</span>
              <span className="font-medium">{phoneNumber}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Status:</span>
              <span className="text-red-600 font-medium">Failed</span>
            </div>
          </div>
        </Card>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Returning to withdrawal form in a few seconds...
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Success State
  if (withdrawalStep === 'success') {
    return (
      <div className="max-w-lg mx-auto space-y-8 text-center">
        <div className="space-y-6">
          <div className="w-24 h-24 mx-auto gradient-success rounded-full flex items-center justify-center animate-bounce shadow-glow">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-success">Withdrawal Successful!</h2>
            <p className="text-muted-foreground">
              Your money has been sent to your M-Pesa account.
            </p>
          </div>
        </div>

        <Card className="p-6 shadow-elevated">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Amount Withdrawn:</span>
              <span className="font-bold text-lg">KSh {amount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Sent to:</span>
              <span className="font-medium">{phoneNumber}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Transaction ID:</span>
              <span className="font-mono text-sm">TXN{Date.now().toString().slice(-8)}</span>
            </div>
          </div>
        </Card>

        <Button onClick={onBack} size="lg" className="w-full">
          Continue Earning
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Withdraw Earnings</h2>
          <p className="text-muted-foreground">
            Available balance: KSh {totalEarnings.toLocaleString()}
          </p>
        </div>
      </div>

      <Card className="p-6 shadow-elevated">
        <div className="space-y-6">
          {/* Withdrawal Method */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Withdrawal Method</Label>
            <RadioGroup value={withdrawalMethod} onValueChange={setWithdrawalMethod}>
              <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-accent/5">
                <RadioGroupItem value="mpesa" id="mpesa" />
                <Label htmlFor="mpesa" className="flex items-center gap-3 flex-1 cursor-pointer">
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-medium">M-Pesa</div>
                    <div className="text-sm text-muted-foreground">Instant transfer</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Phone Number */}
          <div className="space-y-3">
            <Label htmlFor="phone" className="text-base font-semibold">
              M-Pesa Phone Number
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="07XXXXXXXX or 01XXXXXXXX"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="text-base p-3"
            />
          </div>

          {/* Amount */}
          <div className="space-y-3">
            <Label htmlFor="amount" className="text-base font-semibold">
              Withdrawal Amount (KSh)
            </Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min={minWithdrawal}
              max={maxWithdrawal}
              className="text-base p-3"
            />
            
            {/* Quick Amount Buttons */}
            <div className="flex gap-2 flex-wrap">
              {[1000, 2000, Math.min(5000, totalEarnings), totalEarnings].filter(v => v >= minWithdrawal).map((value) => (
                <Button
                  key={value}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAmount(value)}
                  className="text-sm"
                  disabled={value > totalEarnings}
                >
                  KSh {value.toLocaleString()}
                </Button>
              ))}
            </div>
          </div>

          {/* Info Alert */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              • Minimum withdrawal: KSh {minWithdrawal}
              <br />
              • Processing time: Instant to 5 minutes
              <br />
              • No transaction fees
            </AlertDescription>
          </Alert>

          {/* Withdraw Button */}
          <Button
            onClick={handleWithdraw}
            disabled={withdrawalStep === 'processing' || withdrawalStep === 'success' || !phoneNumber || !amount || totalEarnings < minWithdrawal}
            size="lg"
            className="w-full gradient-earning text-white hover:opacity-90 text-lg py-6"
          >
            {(() => {
              if (withdrawalStep === 'processing') {
                return (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                );
              }
              if (totalEarnings < minWithdrawal) {
                return (
                  <>
                    Need KSh {(minWithdrawal - totalEarnings).toLocaleString()} More
                  </>
                );
              }
              return (
                <>
                  <Smartphone className="w-5 h-5" />
                  Withdraw KSh {amount || '0'}
                </>
              );
            })()}
          </Button>
        </div>
      </Card>

      {/* Minimum Withdrawal Modal */}
      <MinimumWithdrawalModal
        open={showMinimumModal}
        onOpenChange={setShowMinimumModal}
        currentBalance={totalEarnings}
        onStartEarning={() => onStartEarning?.()}
      />

      {/* Account Activation Modal */}
      <AccountActivationModal
        open={showActivationModal}
        onOpenChange={setShowActivationModal}
        onActivate={() => setShowActivationFeeModal(true)}
      />

      {/* Activation Fee Modal */}
      <ActivationFeeModal
        open={showActivationFeeModal}
        onOpenChange={setShowActivationFeeModal}
        onSuccess={() => {
          setIsAccountActive(true);
          toast({
            title: "Account Activated!",
            description: "You can now withdraw directly to M-Pesa.",
          });
        }}
      />

      {/* Account Warning Modal */}
      <AccountWarningModal
        isOpen={showAccountWarningModal}
        onOpenChange={setShowAccountWarningModal}
        currentBalance={totalEarnings}
        withdrawalAmount={parseInt(amount) || 0}
        remainingBalance={totalEarnings - (parseInt(amount) || 0)}
        onContinue={() => {
          setShowAccountWarningModal(false);
          setShowAccountOptionsModal(true);
        }}
      />

      {/* Account Options Modal */}
      <AccountOptionsModal
        isOpen={showAccountOptionsModal}
        onOpenChange={setShowAccountOptionsModal}
        onContinueTasking={() => {
          setShowAccountOptionsModal(false);
          // Let users complete 2 surveys first, then block on 3rd attempt
          setCompletedTasks(0); // Reset to allow surveys
          onStartEarning?.(); // Let them do surveys
        }}
        onUpgradeToPlatinum={() => {
          setShowAccountOptionsModal(false);
          setShowPlatinumUpgradeModal(true);
        }}
        onWithdrawInstantly={() => {
          if (isPlatinumUser) {
            setShowAccountOptionsModal(false);
            setShowPlatinumWithdrawalModal(true);
          } else {
            toast({
              title: "Platinum Required",
              description: "Upgrade to Platinum for instant full withdrawals.",
              variant: "destructive"
            });
          }
        }}
      />


      {/* Platinum Upgrade Modal */}
      <PlatinumUpgradeModal
        open={showPlatinumUpgradeModal}
        onOpenChange={setShowPlatinumUpgradeModal}
        onUpgradeSuccess={() => {
          setIsPlatinumUser(true);
          toast({
            title: "Upgrade Successful!",
            description: "Welcome to Platinum! You now have unlimited withdrawal privileges.",
          });
        }}
        onWithdrawalSuccess={(amount, phoneNumber) => {
          setShowWithdrawalSuccessModal(true);
        }}
      />

      {/* Platinum Withdrawal Modal */}
      <PlatinumWithdrawalModal
        open={showPlatinumWithdrawalModal}
        onOpenChange={setShowPlatinumWithdrawalModal}
        withdrawalAmount={parseInt(amount) || 0}
        onConfirmWithdrawal={() => {
          // Process the withdrawal
          setWithdrawalStep('processing');
          setStatusMessage('Your withdrawal is being processed and will be received within 24 hours.');
          
          // Simulate processing
          setTimeout(() => {
            setWithdrawalStep('success');
            setStatusMessage(`KSh ${amount} withdrawal is being processed. You will receive the full amount within 24 hours.`);
          }, 2000);
        }}
      />

      {/* Modern Daily Task Limit Modal */}
      <ModernDailyTaskLimitModal
        open={showDailyTaskLimitModal}
        onOpenChange={setShowDailyTaskLimitModal}
        completedTasks={completedTasks}
        totalTasks={dailyTaskLimit}
        onUnlockMoreTasks={() => {
          setShowDailyTaskLimitModal(false);
          setShowTaskPackagesModal(true);
        }}
      />

      {/* Modern Task Packages Modal */}
      <ModernTaskPackagesModal
        open={showTaskPackagesModal}
        onOpenChange={setShowTaskPackagesModal}
        onPurchaseSuccess={(packageType) => {
          setShowTaskPackagesModal(false);
          // Add more tasks based on package
          const additionalTasks = packageType === 'basic' ? 10 : 20;
          setDailyTaskLimit(prev => prev + additionalTasks);
          setCompletedTasks(0); // Reset completed tasks
          
          toast({
            title: "Package Activated!",
            description: `${additionalTasks} additional tasks unlocked. Happy earning!`,
          });
          
          // Let them continue with surveys
          onStartEarning?.();
        }}
      />

      {/* Withdrawal Success Modal */}
      <WithdrawalSuccessModal
        isOpen={showWithdrawalSuccessModal}
        onOpenChange={setShowWithdrawalSuccessModal}
        amount={parseInt(amount) || 1000}
        phoneNumber={phoneNumber}
        onContinue={() => {
          setShowWithdrawalSuccessModal(false);
          onStartEarning?.();
        }}
      />
    </div>
  );
};

export default WithdrawalInterface;