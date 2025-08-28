import { useState } from "react";
import { ArrowLeft, Smartphone, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { STKWithdrawal } from "./STKWithdrawal";
import MinimumWithdrawalModal from "@/components/ui/MinimumWithdrawalModal";
import AccountActivationModal from "@/components/ui/AccountActivationModal";
import ActivationFeeModal from "@/components/ui/ActivationFeeModal";

interface WithdrawalInterfaceProps {
  totalEarnings: number;
  onBack: () => void;
  onStartEarning?: () => void;
}

const WithdrawalInterface = ({ totalEarnings, onBack, onStartEarning }: WithdrawalInterfaceProps) => {
  const [amount, setAmount] = useState('');
  const [showSTK, setShowSTK] = useState(false);
  const [showMinimumModal, setShowMinimumModal] = useState(false);
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [showActivationFeeModal, setShowActivationFeeModal] = useState(false);
  const [isAccountActive, setIsAccountActive] = useState(false);
  const { toast } = useToast();

  const minWithdrawal = 1000;
  const maxWithdrawal = totalEarnings;

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
  };

  const handleWithdraw = () => {
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
    
    if (!amount) {
      toast({
        title: "Missing Information",
        description: "Please enter withdrawal amount.",
        variant: "destructive"
      });
      return;
    }

    const withdrawAmount = parseInt(amount);
    if (withdrawAmount < minWithdrawal || withdrawAmount > maxWithdrawal) {
      toast({
        title: "Invalid Amount",
        description: `Amount must be between KSh ${minWithdrawal} and KSh ${maxWithdrawal}.`,
        variant: "destructive"
      });
      return;
    }

    // Show STK component
    setShowSTK(true);
  };

  const handleSTKSuccess = (reference: string) => {
    console.log('Withdrawal successful:', reference);
    toast({
      title: "Withdrawal Successful!",
      description: `KSh ${amount} has been processed successfully.`,
    });
    // Return to dashboard after success
    setTimeout(() => {
      onBack();
    }, 2000);
  };

  const handleSTKCancel = () => {
    setShowSTK(false);
  };

  // Show STK component if activated
  if (showSTK) {
    return (
      <div className="max-w-lg mx-auto">
        <STKWithdrawal
          amount={parseInt(amount)}
          onSuccess={handleSTKSuccess}
          onCancel={handleSTKCancel}
          description="EarnSpark Withdrawal"
        />
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
            disabled={!amount || totalEarnings < minWithdrawal}
            size="lg"
            className="w-full gradient-earning text-white hover:opacity-90 text-lg py-6"
          >
            {totalEarnings < minWithdrawal ? (
              <>
                Need KSh {(minWithdrawal - totalEarnings).toLocaleString()} More
              </>
            ) : (
              <>
                <Smartphone className="w-5 h-5" />
                Withdraw KSh {amount || '0'}
              </>
            )}
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
    </div>
  );
};

export default WithdrawalInterface;
