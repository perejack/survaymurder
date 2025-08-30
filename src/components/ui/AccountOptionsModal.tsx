import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Sparkles, ArrowRight, Zap, DollarSign, Clock } from "lucide-react";

interface AccountOptionsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onContinueTasking: () => void;
  onUpgradeToPlatinum: () => void;
  onWithdrawInstantly: () => void;
}

const AccountOptionsModal = ({ 
  isOpen, 
  onOpenChange, 
  onContinueTasking,
  onUpgradeToPlatinum,
  onWithdrawInstantly
}: AccountOptionsModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg mx-auto bg-white rounded-2xl shadow-2xl border-0 p-0 overflow-hidden">
        <div className="relative">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-center">
            <div className="flex justify-center mb-3">
              <div className="bg-white/20 rounded-full p-3">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Recommended Action</h2>
            <p className="text-blue-100 text-sm">
              Select an amount that won't leave your account with 0 balance. Keep tasking to increase the amount or upgrade to Platinum for full withdrawal privileges.
            </p>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Platinum Benefits Preview */}
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 p-5 mb-6 border-2 border-purple-200 shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <Crown className="w-6 h-6 text-purple-600" />
                <h3 className="font-bold text-purple-800">Platinum Account Benefits</h3>
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">PREMIUM</Badge>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center gap-3 bg-white/60 rounded-lg p-3">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  <div>
                    <p className="font-semibold text-sm text-gray-800">Instant Full Withdrawal</p>
                    <p className="text-xs text-gray-600">No minimum balance required</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 bg-white/60 rounded-lg p-3">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-semibold text-sm text-gray-800">Up to KSh 6,000 Daily M-Pesa</p>
                    <p className="text-xs text-gray-600">Higher withdrawal limits</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 bg-white/60 rounded-lg p-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-semibold text-sm text-gray-800">Tasks up to KSh 200</p>
                    <p className="text-xs text-gray-600">10 premium tasks daily</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={onContinueTasking}
                size="lg"
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-4 text-base shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Continue Tasking
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              <Button
                onClick={onUpgradeToPlatinum}
                size="lg"
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-4 text-base shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Crown className="w-5 h-5 mr-2" />
                Upgrade to Platinum
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              <Button
                onClick={onWithdrawInstantly}
                variant="outline"
                size="lg"
                className="w-full border-2 border-orange-300 text-orange-700 hover:bg-orange-50 font-semibold py-4 text-base"
              >
                Withdraw Instantly (Platinum Only)
              </Button>
              
              <Button
                onClick={() => onOpenChange(false)}
                variant="ghost"
                size="lg"
                className="w-full text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </Button>
            </div>

            {/* Footer message */}
            <div className="text-center mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-xs text-yellow-800">
                💡 <span className="font-semibold">Pro Tip:</span> Keep your account active by maintaining a minimum balance and enjoy continuous earning opportunities!
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AccountOptionsModal;
