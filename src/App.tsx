import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import SurveyPlatform from "./pages/SurveyPlatform";
import Profile from "./pages/Profile";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Cookies from "./pages/Cookies";
import ScrollToTop from "./components/ScrollToTop";
import RouteSeo from "./components/RouteSeo";
import SignupBonusScreen from "./components/auth/SignupBonusScreen";

const queryClient = new QueryClient();

const AppContent = () => {
  const { showSignupBonus, setShowSignupBonus, profile } = useAuth();

  if (showSignupBonus) {
    return (
      <SignupBonusScreen
        onContinue={() => setShowSignupBonus(false)}
        userName={profile?.username || profile?.full_name}
      />
    );
  }

  return (
    <BrowserRouter>
      <ScrollToTop />
      <RouteSeo />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/survey" element={<SurveyPlatform />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/cookies" element={<Cookies />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
