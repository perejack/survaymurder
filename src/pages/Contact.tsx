import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Phone, MapPin, Clock, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Contact = () => {
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
          <h1 className="text-3xl font-bold mb-8">Contact Us</h1>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Information */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Get in Touch</h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-semibold">Email</p>
                    <a href="mailto:info@earntasking.online" className="text-primary hover:underline">
                      info@earntasking.online
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-semibold">Phone</p>
                    <a href="tel:+2547122226787" className="text-primary hover:underline">
                      +254 712 222 6787
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-semibold">Support Hours</p>
                    <p className="text-muted-foreground">
                      Monday - Friday<br />
                      9:00 AM - 5:00 PM EAT
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-semibold">Office Address</p>
                    <p className="text-muted-foreground">
                      LENANA BUILDING<br />
                      LENANAN ROAD<br />
                      NAIROBI, KENYA
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Information */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Business Information</h2>
              
              <Card className="p-4 bg-muted">
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-semibold">Legal Entity</p>
                    <p className="text-muted-foreground">BLUEROCK PARTNERS</p>
                  </div>
                  <div>
                    <p className="font-semibold">Registration Number</p>
                    <p className="text-muted-foreground">BN-P7SAD8YK</p>
                  </div>
                  <div>
                    <p className="font-semibold">Trading As</p>
                    <p className="text-muted-foreground">EarnSpark / EarnTasking</p>
                  </div>
                  <div>
                    <p className="font-semibold">Owner</p>
                    <p className="text-muted-foreground">MOSES NDIEMA TENDET</p>
                  </div>
                </div>
              </Card>

              {/* Response Time Notice */}
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <MessageCircle className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-semibold text-primary mb-1">Response Time</p>
                    <p className="text-sm text-muted-foreground">
                      We aim to respond to all inquiries within 24-48 hours during business days. 
                      For urgent matters, please call during support hours.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Link */}
          <div className="mt-8 pt-6 border-t">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                Before contacting us, you might find your answer in our frequently asked questions.
              </p>
              <Button variant="outline" onClick={() => navigate('/about')}>
                View About Us
              </Button>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t">
            <p className="text-xs text-muted-foreground text-center">
              © 2024 BLUEROCK PARTNERS trading as EarnSpark. All rights reserved.<br />
              Business Registration: BN-P7SAD8YK
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Contact;
