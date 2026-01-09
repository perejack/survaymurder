import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Privacy = () => {
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
          <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
          
          <div className="bg-muted p-4 rounded-lg mb-8">
            <p className="text-sm text-muted-foreground">
              <strong>Company:</strong> BLUEROCK PARTNERS<br />
              <strong>Registration:</strong> BN-P7SAD8YK<br />
              <strong>Trading As:</strong> EarnSpark<br />
              <strong>Address:</strong> LENANA BUILDING, LENANAN ROAD, NAIROBI<br />
              <strong>Effective Date:</strong> {new Date().toLocaleDateString()}
            </p>
          </div>
          
          <div className="space-y-6 text-sm text-muted-foreground">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">1. Information We Collect</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Personal identification information (Name, phone number, email address)</li>
                <li>M-Pesa transaction details for withdrawals</li>
                <li>Task completion history and performance data</li>
                <li>Device and browser information for platform optimization</li>
                <li>Location data (when tasks require location verification)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">2. How We Use Your Information</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>To provide and maintain our services</li>
                <li>To process payments and withdrawals</li>
                <li>To verify user eligibility for tasks</li>
                <li>To communicate about task availability and account status</li>
                <li>To improve our platform and user experience</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">3. Data Protection</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>We implement appropriate security measures to protect your data</li>
                <li>Access to personal information is restricted to authorized personnel only</li>
                <li>We do not sell or rent your personal information to third parties</li>
                <li>Data is encrypted during transmission and storage</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">4. Third-Party Services</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>We use M-Pesa for payment processing</li>
                <li>We may use analytics services to improve our platform</li>
                <li>Third-party services have their own privacy policies</li>
                <li>We are not responsible for third-party data practices</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">5. Data Retention</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>We retain personal data as long as necessary to provide services</li>
                <li>Financial records are kept as required by law</li>
                <li>You may request deletion of your account and associated data</li>
                <li>Some data may be retained for legal compliance</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">6. Your Rights</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Right to access your personal information</li>
                <li>Right to correct inaccurate data</li>
                <li>Right to request deletion of your data</li>
                <li>Right to object to data processing</li>
                <li>Right to data portability</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">7. Children's Privacy</h2>
              <p>
                Our services are not intended for individuals under 18 years of age. 
                We do not knowingly collect personal information from children.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">8. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any 
                changes by posting the new Privacy Policy on this page and updating the effective date.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">9. Contact Information</h2>
              <p>
                If you have questions about this Privacy Policy, please contact us:<br />
                <strong>BLUEROCK PARTNERS</strong><br />
                LENANA BUILDING, LENANAN ROAD, NAIROBI<br />
                Email: info@earntasking.online<br />
                Phone: +254 712 222 6787<br />
                Business Registration: BN-P7SAD8YK
              </p>
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

export default Privacy;
