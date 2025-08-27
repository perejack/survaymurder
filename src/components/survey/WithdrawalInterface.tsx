import { useState } from "react";
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

interface WithdrawalInterfaceProps {
  totalEarnings: number;
  onBack: () => void;
  onStartEarning?: () => void;
}

const WithdrawalInterface = ({ totalEarnings, onBack, onStartEarning }: WithdrawalInterfaceProps) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [withdrawalMethod, setWithdrawalMethod] = useState('mpesa');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
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

    setIsProcessing(true);

    try {
      const withdrawalResponse = await initiateWithdrawal(phoneNumber, withdrawAmount, 'EarnSpark Withdrawal');
      
      if (withdrawalResponse.success && withdrawalResponse.data?.externalReference) {
        const stopPolling = pollWithdrawalStatus(
          withdrawalResponse.data.externalReference,
          (status: WithdrawalStatus) => {
            if (status.success && status.payment) {
              if (status.payment.status === 'SUCCESS') {
                setIsProcessing(false);
                setIsComplete(true);
                toast({
                  title: "Withdrawal Successful!",
                  description: `KSh ${withdrawAmount} has been sent to ${phoneNumber}`,
                });
                stopPolling();
              } else if (status.payment.status === 'FAILED') {
                setIsProcessing(false);
                toast({
                  title: "Withdrawal Failed",
                  description: status.payment.resultDesc || "Please try again.",
                  variant: "destructive"
                });
                stopPolling();
              }
            }
          }
        );
      } else {
        setIsProcessing(false);
        toast({
          title: "Withdrawal Failed",
          description: withdrawalResponse.message || "Failed to initiate withdrawal.",
          variant: "destructive"
        });
      }
    } catch (error) {
      setIsProcessing(false);
      toast({
        title: "Network Error",
        description: "Please check your connection and try again.",
        variant: "destructive"
      });
    }
  };

  
  if (isComplete) {
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
            disabled={isProcessing || !phoneNumber || !amount || totalEarnings < minWithdrawal}
            size="lg"
            className="w-full gradient-earning text-white hover:opacity-90 text-lg py-6"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : totalEarnings < minWithdrawal ? (
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