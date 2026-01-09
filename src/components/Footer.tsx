import { Smartphone, Mail, MapPin, Phone, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

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
              A service by BLUEROCK PARTNERS (BN-P7SAD8YK).<br/>
              Task completion platform. Earnings vary significantly. 
              No guaranteed income. Terms and conditions apply.
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
              <li><Link to="/about" className="text-background/70 hover:text-background transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-background/70 hover:text-background transition-colors">Contact</Link></li>
              <li><a href="#tasks" className="text-background/70 hover:text-background transition-colors">Browse Tasks</a></li>
              <li><Link to="/terms" className="text-background/70 hover:text-background transition-colors">Terms</Link></li>
              <li><Link to="/privacy" className="text-background/70 hover:text-background transition-colors">Privacy</Link></li>
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
                <span className="text-background/70">info@earntasking.online</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-accent" />
                <span className="text-background/70">+254 712 222 6787</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-accent" />
                <span className="text-background/70">Lenana Building, Lenana Road, Nairobi</span>
              </div>
            </div>
            <div className="pt-4">
              <div className="bg-success/10 border border-success/20 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Smartphone className="w-4 h-4 text-success" />
                  <span className="text-sm font-medium text-success">M-Pesa Ready</span>
                </div>
                <p className="text-xs text-background/70">
                  Withdrawals subject to eligibility and fees
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Important Disclaimer */}
        <div className="border-t border-background/10 mt-8 pt-6">
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm font-semibold text-background">Important Disclaimer</p>
                <p className="text-xs text-background/70 leading-relaxed">
                  This is a task-based platform with no guaranteed income. Earnings vary significantly based on task availability, 
                  completion quality, location, and other factors. Many users may earn little or nothing. Account activation fees 
                  do not guarantee earnings or task availability. All examples of earnings are not typical. Withdrawals subject to 
                  eligibility requirements, minimum thresholds, and fees. Please read our Terms of Service for full details.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-background/10 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-background/70">
              © 2024 BLUEROCK PARTNERS | Business Registration: BN-P7SAD8YK | Trading as EarnSpark
            </div>
            <div className="flex gap-6 text-sm">
              <Link to="/privacy" className="text-background/70 hover:text-background transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="text-background/70 hover:text-background transition-colors font-semibold">Terms of Service</Link>
              <a href="#" className="text-background/70 hover:text-background transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;