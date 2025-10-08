import { Shield, AlertTriangle, CheckCircle, ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface AccountActivationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onActivate: () => void;
}

const AccountActivationModal = ({ 
  open, 
  onOpenChange, 
  onActivate 
}: AccountActivationModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[420px] p-0 overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-0 shadow-2xl rounded-2xl sm:rounded-3xl">
        <div className="relative">
          {/* Background decorative elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-purple-500/5" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-400/10 to-transparent rounded-full blur-xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-400/10 to-transparent rounded-full blur-xl" />
          
          <div className="relative z-10 p-4 sm:p-6">
            {/* Header */}
            <div className="text-center mb-4 sm:mb-6">
              <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                Account Not Active 🔒
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed px-2">
                Activate your account to enable direct M-Pesa withdrawals and unlock premium features
              </p>
            </div>

            {/* Status Card */}
            <Card className="gradient-card p-4 sm:p-6 mb-4 sm:mb-6 border-0 shadow-lg">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm sm:text-base">Account Status</p>
                    <p className="text-xs sm:text-sm text-red-600 font-medium">Inactive</p>
                  </div>
                </div>
                <div className="px-2 sm:px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                  PENDING
                </div>
              </div>
              
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                  <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                  <span className="text-gray-600">M-Pesa withdrawals disabled</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                  <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                  <span className="text-gray-600">Limited earning features</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                  <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                  <span className="text-gray-600">Transfer timing varies</span>
                </div>
              </div>
            </Card>

            {/* Benefits after activation */}
            <div className="mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">After Activation You Get:</h3>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <Card className="gradient-card p-3 sm:p-4 border-0 shadow-md hover-lift">
                  <div className="text-center">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 bg-green-500/20 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-gray-800">M-Pesa withdrawals</p>
                    <p className="text-xs text-green-600">Direct withdrawals once eligible</p>
                  </div>
                </Card>
                
                <Card className="gradient-card p-3 sm:p-4 border-0 shadow-md hover-lift">
                  <div className="text-center">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-gray-800">Premium Features</p>
                    <p className="text-xs text-blue-600">Higher rewards</p>
                  </div>
                </Card>
              </div>
            </div>

            {/* Call to action */}
            <div className="space-y-2 sm:space-y-3">
              <Button
                onClick={() => {
                  onActivate();
                  onOpenChange(false);
                }}
                size="lg"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 sm:py-6 text-base sm:text-lg hover-bounce animate-pulse-glow touch-manipulation active:scale-95 transition-transform h-12 sm:h-auto"
              >
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Activate Account
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              </Button>
              
              <Button
                onClick={() => onOpenChange(false)}
                variant="outline"
                size="lg"
                className="w-full h-10 sm:h-12 text-sm sm:text-base touch-manipulation active:scale-95 transition-transform"
              >
                Maybe Later
              </Button>
            </div>

            {/* Security note */}
            <div className="text-center mt-3 sm:mt-4">
              <p className="text-xs text-gray-500 px-2">
                🔒 Secure activation process • One-time setup • Verification after payment confirmation
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AccountActivationModal;
