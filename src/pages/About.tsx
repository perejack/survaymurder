import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building2, Shield, Users, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const About = () => {
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
          <h1 className="text-3xl font-bold mb-8">About EarnSpark</h1>
          
          <div className="space-y-8">
            {/* Company Information */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Building2 className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-semibold">Company Information</h2>
              </div>
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p className="text-sm">
                  <strong>Legal Entity:</strong> BLUEROCK PARTNERS
                </p>
                <p className="text-sm">
                  <strong>Registration Number:</strong> BN-P7SAD8YK
                </p>
                <p className="text-sm">
                  <strong>Owner:</strong> MOSES NDIEMA TENDET
                </p>
                <p className="text-sm">
                  <strong>Registered Address:</strong> LENANA BUILDING, LENANAN ROAD, NAIROBI
                </p>
                <p className="text-sm">
                  <strong>Trading As:</strong> EarnSpark
                </p>
              </div>
            </section>

            {/* What We Do */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-semibold">What We Do</h2>
              </div>
              <p className="text-muted-foreground">
                EarnSpark is a task-based platform operated by BLUEROCK PARTNERS. We connect 
                users with various task opportunities when available. Our platform facilitates 
                task completion and reward distribution, subject to availability and eligibility requirements.
              </p>
            </section>

            {/* Important Disclaimers */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-warning" />
                <h2 className="text-xl font-semibold">Important Information</h2>
              </div>
              <div className="bg-warning/10 border border-warning p-4 rounded-lg">
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2">
                    <CheckCircle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                    <span>This is NOT an employment opportunity - users are independent contractors</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                    <span>No guaranteed income - earnings depend on multiple factors</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                    <span>Task availability varies and is not guaranteed</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                    <span>KSh 125 activation fee is fully refundable upon reaching withdrawal threshold</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                    <span>All users must comply with our Terms of Service</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Our Commitment */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Our Commitment</h2>
              <p className="text-muted-foreground">
                BLUEROCK PARTNERS is committed to operating EarnSpark with transparency and integrity. 
                We strive to provide a legitimate platform for task completion while being clear about 
                the nature of opportunities available. We encourage all users to read our Terms of Service 
                and Privacy Policy before participating.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Contact Us</h2>
              <div className="bg-muted p-4 rounded-lg space-y-3">
                <p className="text-sm">
                  For inquiries about our services, please reach out to us:
                </p>
                <div className="text-sm space-y-2">
                  <p><strong>Company:</strong> BLUEROCK PARTNERS</p>
                  <p><strong>Email:</strong> info@earntasking.online</p>
                  <p><strong>Phone:</strong> +254 712 222 6787</p>
                  <p><strong>Support Hours:</strong> Monday - Friday, 9:00 AM - 5:00 PM EAT</p>
                  <p><strong>Address:</strong> LENANA BUILDING, LENANAN ROAD, NAIROBI, KENYA</p>
                </div>
                <div className="border-t pt-3">
                  <p className="text-xs text-muted-foreground">
                    Response time may vary. We aim to respond to all inquiries within 24-48 hours during business days.
                  </p>
                </div>
              </div>
            </section>

            {/* Verification */}
            <section className="pt-4 border-t">
              <p className="text-xs text-muted-foreground text-center">
                Business Registration Number: BN-P7SAD8YK can be verified with the relevant Kenyan authorities.<br />
                © 2024 BLUEROCK PARTNERS. All rights reserved.
              </p>
            </section>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default About;
