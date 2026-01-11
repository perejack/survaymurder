import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Cookies = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <Button variant="outline" onClick={() => navigate('/')} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <Card className="p-8 shadow-lg">
          <h1 className="text-3xl font-bold mb-8">Cookie Policy</h1>

          <div className="space-y-6 text-sm text-muted-foreground">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">1. What Are Cookies?</h2>
              <p>
                Cookies are small text files stored on your device that help websites function properly, remember preferences, and
                improve the user experience.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">2. How We Use Cookies</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>To support essential site functionality and security</li>
                <li>To keep you signed in where applicable</li>
                <li>To understand how the site is used so we can improve it</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">3. Third-Party Services</h2>
              <p>
                Some services we use (for example authentication or analytics) may set their own cookies or similar technologies.
                These services have their own policies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">4. Your Choices</h2>
              <p>
                You can control cookies through your browser settings. Disabling cookies may affect some features and how the site
                works.
              </p>
            </section>

            <section className="pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                © 2024 BLUEROCK PARTNERS trading as EarnSpark. All rights reserved.
              </p>
            </section>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Cookies;
