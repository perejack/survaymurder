import { Smartphone, Mail, MapPin, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 gradient-hero rounded-lg flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">EarnSpark</span>
            </div>
            <p className="text-background/70 text-sm leading-relaxed">
              Empowering Kenyans to earn extra income through verified tasks. 
              Your trusted platform for flexible work opportunities.
            </p>
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-background/10 rounded-lg flex items-center justify-center hover-bounce cursor-pointer">
                <span className="text-xs">📱</span>
              </div>
              <div className="w-8 h-8 bg-background/10 rounded-lg flex items-center justify-center hover-bounce cursor-pointer">
                <span className="text-xs">📧</span>
              </div>
              <div className="w-8 h-8 bg-background/10 rounded-lg flex items-center justify-center hover-bounce cursor-pointer">
                <span className="text-xs">📞</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#tasks" className="text-background/70 hover:text-background transition-colors">Browse Tasks</a></li>
              <li><a href="#earn" className="text-background/70 hover:text-background transition-colors">How to Earn</a></li>
              <li><a href="#withdraw" className="text-background/70 hover:text-background transition-colors">M-Pesa Withdrawal</a></li>
              <li><a href="#faq" className="text-background/70 hover:text-background transition-colors">FAQ</a></li>
              <li><a href="#support" className="text-background/70 hover:text-background transition-colors">Help Center</a></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Task Categories</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-background/70 hover:text-background transition-colors">Surveys</a></li>
              <li><a href="#" className="text-background/70 hover:text-background transition-colors">Delivery</a></li>
              <li><a href="#" className="text-background/70 hover:text-background transition-colors">Data Entry</a></li>
              <li><a href="#" className="text-background/70 hover:text-background transition-colors">Photography</a></li>
              <li><a href="#" className="text-background/70 hover:text-background transition-colors">Social Media</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Get in Touch</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-accent" />
                <span className="text-background/70">support@earnspark.co.ke</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-accent" />
                <span className="text-background/70">+254 700 123 456</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-accent" />
                <span className="text-background/70">Nairobi, Kenya</span>
              </div>
            </div>
            <div className="pt-4">
              <div className="bg-success/10 border border-success/20 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Smartphone className="w-4 h-4 text-success" />
                  <span className="text-sm font-medium text-success">M-Pesa Ready</span>
                </div>
                <p className="text-xs text-background/70">
                  Instant withdrawals to your mobile money account
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-background/10 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-background/70">
              © 2024 EarnSpark. All rights reserved. Made with ❤️ in Kenya.
            </div>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-background/70 hover:text-background transition-colors">Privacy Policy</a>
              <a href="#" className="text-background/70 hover:text-background transition-colors">Terms of Service</a>
              <a href="#" className="text-background/70 hover:text-background transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;