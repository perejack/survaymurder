import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Terms = () => {
  const businessInfo = {
    name: "BLUEROCK PARTNERS",
    registration: "BN-P7SAD8YK",
    owner: "MOSES NDIEMA TENDET",
    address: "LENANA BUILDING, LENANAN ROAD, NAIROBI",
    tradingAs: "EarnSpark"
  };
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <Button 
          variant="outline" 
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <Card className="p-8 shadow-lg">
          <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
          
          <div className="bg-muted p-4 rounded-lg mb-8">
            <h2 className="text-lg font-semibold mb-2">Business Information</h2>
            <p className="text-sm text-muted-foreground">
              <strong>Company:</strong> {businessInfo.name}<br />
              <strong>Registration:</strong> {businessInfo.registration}<br />
              <strong>Trading As:</strong> {businessInfo.tradingAs}<br />
              <strong>Address:</strong> {businessInfo.address}<br />
              <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
            </p>
          </div>
          
          <div className="space-y-6 text-sm text-muted-foreground">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">⚠️ EARNINGS DISCLAIMER</h2>
              <div className="bg-warning/10 border border-warning p-4 rounded-lg">
                <p className="font-bold text-foreground mb-2">NO GUARANTEED INCOME</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>This platform does NOT guarantee any specific income amount</li>
                  <li>Earnings vary SIGNIFICANTLY based on numerous factors including but not limited to:
                    <ul className="list-disc list-inside ml-6 mt-1">
                      <li>Task availability (which may be limited or zero)</li>
                      <li>Your location</li>
                      <li>Quality of work submitted</li>
                      <li>Account eligibility status</li>
                      <li>Market conditions</li>
                      <li>Platform policies</li>
                    </ul>
                  </li>
                  <li>Past performance does NOT indicate future results</li>
                  <li>Many users may earn nothing at all</li>
                  <li>Any examples of earnings shown are NOT typical</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Task Availability</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Tasks are NOT guaranteed to be available</li>
                <li>Task availability varies by location, time, and other factors</li>
                <li>We do not promise regular or consistent task opportunities</li>
                <li>Tasks may be limited to certain user profiles or demographics</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Account Activation & Refundable Fee</h2>
              <div className="bg-success/10 border border-success p-4 rounded-lg mb-3">
                <p className="font-semibold text-success mb-2">💰 REFUNDABLE ACTIVATION FEE</p>
                <p className="text-sm">The KSh 125 activation fee is <strong>100% REFUNDABLE</strong>.
                Once you reach the minimum withdrawal threshold, the full KSh 125 will be credited
                back to your account balance.</p>
              </div>
              <ul className="list-disc list-inside space-y-2">
                <li>One-time activation fee of KSh 125 is required for account verification</li>
                <li>This fee is fully refunded when you reach withdrawal eligibility</li>
                <li>The refund is automatic and added to your withdrawable balance</li>
                <li>Purpose: To verify serious users and prevent platform abuse</li>
                <li>Important notes:
                  <ul className="list-disc list-inside ml-6 mt-1">
                    <li>Refund does not mean guaranteed task availability</li>
                    <li>Reaching withdrawal threshold depends on task completion</li>
                    <li>Earnings and task availability still vary</li>
                  </ul>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Withdrawals</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Withdrawals are subject to:</li>
                <ul className="list-disc list-inside ml-6 mt-1">
                  <li>Minimum balance requirements</li>
                  <li>Account verification</li>
                  <li>Processing times (not guaranteed)</li>
                  <li>Platform fees</li>
                  <li>Third-party payment processor fees</li>
                </ul>
                <li>M-Pesa and other payment methods subject to their own terms</li>
                <li>We do not guarantee successful withdrawals</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">User Responsibilities</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Users must provide accurate information</li>
                <li>Users are responsible for their own tax obligations</li>
                <li>This is not employment - users are independent contractors</li>
                <li>No employee benefits are provided</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Platform Rights</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>We reserve the right to:</li>
                <ul className="list-disc list-inside ml-6 mt-1">
                  <li>Modify or discontinue services at any time</li>
                  <li>Change fees and requirements</li>
                  <li>Suspend or terminate accounts</li>
                  <li>Reject task submissions</li>
                  <li>Withhold payments for policy violations</li>
                </ul>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Legal Disclaimer</h2>
              <p className="text-xs">
                BY USING THIS PLATFORM, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO THESE TERMS.
                THE PLATFORM IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE ARE NOT LIABLE FOR ANY LOSSES
                OR DAMAGES ARISING FROM YOUR USE OF THE PLATFORM. YOUR USE OF THE PLATFORM IS AT YOUR OWN RISK.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Contact Information</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Business Name: BLUEROCK PARTNERS</li>
                <li>Registration Number: BN-P7SAD8YK</li>
                <li>Registered Address: LENANA BUILDING, LENANAN ROAD, NAIROBI</li>
                <li>Email: info@earntasking.online</li>
                <li>Phone: +254 712 222 6787</li>
                <li>Support Hours: Monday - Friday, 9:00 AM - 5:00 PM EAT</li>
              </ul>
            </section>

            <section className="pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                © 2024 BLUEROCK PARTNERS trading as EarnSpark. All rights reserved.<br />
                Business Registration: BN-P7SAD8YK
              </p>
            </section>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Terms;
