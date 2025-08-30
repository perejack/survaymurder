import { 
  ShoppingCart, 
  Smartphone, 
  Heart, 
  Car, 
  Home, 
  Briefcase,
  Globe,
  Users
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SurveyCategoriesProps {
  onStartSurvey: (category: string) => void;
}

const categories = [
  {
    id: 'lifestyle',
    title: 'Lifestyle & Shopping',
    description: 'Share your shopping habits and lifestyle preferences',
    icon: ShoppingCart,
    earning: 150,
    time: '3-5 mins',
    questions: 12,
    difficulty: 'Easy',
    gradient: 'from-purple-500 to-pink-500',
    available: 47
  },
  {
    id: 'technology',
    title: 'Technology & Apps',
    description: 'Give feedback on apps, gadgets, and digital services',
    icon: Smartphone,
    earning: 150,
    time: '4-6 mins',
    questions: 15,
    difficulty: 'Easy',
    gradient: 'from-blue-500 to-cyan-500',
    available: 34
  },
  {
    id: 'health',
    title: 'Health & Wellness',
    description: 'Share insights about health products and wellness trends',
    icon: Heart,
    earning: 150,
    time: '5-7 mins',
    questions: 18,
    difficulty: 'Medium',
    gradient: 'from-green-500 to-emerald-500',
    available: 28
  },
  {
    id: 'transport',
    title: 'Transport & Travel',
    description: 'Tell us about your travel experiences and transport preferences',
    icon: Car,
    earning: 150,
    time: '3-4 mins',
    questions: 10,
    difficulty: 'Easy',
    gradient: 'from-orange-500 to-red-500',
    available: 41
  },
  {
    id: 'housing',
    title: 'Housing & Real Estate',
    description: 'Share your opinions on housing, rent, and property matters',
    icon: Home,
    earning: 150,
    time: '4-5 mins',
    questions: 14,
    difficulty: 'Medium',
    gradient: 'from-indigo-500 to-purple-500',
    available: 22
  },
  {
    id: 'business',
    title: 'Business & Finance',
    description: 'Provide insights on business services and financial products',
    icon: Briefcase,
    earning: 150,
    time: '6-8 mins',
    questions: 20,
    difficulty: 'Medium',
    gradient: 'from-yellow-500 to-orange-500',
    available: 19
  },
  {
    id: 'social',
    title: 'Social & Entertainment',
    description: 'Share your thoughts on entertainment, social media, and events',
    icon: Users,
    earning: 150,
    time: '3-5 mins',
    questions: 12,
    difficulty: 'Easy',
    gradient: 'from-pink-500 to-rose-500',
    available: 36
  },
  {
    id: 'environment',
    title: 'Environment & Society',
    description: 'Voice your opinions on environmental and social issues',
    icon: Globe,
    earning: 150,
    time: '5-6 mins',
    questions: 16,
    difficulty: 'Medium',
    gradient: 'from-teal-500 to-green-500',
    available: 25
  }
];

const SurveyCategories = ({ onStartSurvey }: SurveyCategoriesProps) => {
  return (
    <div className="w-full px-4 sm:px-6 space-y-4 sm:space-y-6">
      {/* Mobile Header */}
      <div className="text-center space-y-3 sm:space-y-4">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight">
          Choose Your
          <span className="block gradient-earning bg-clip-text text-transparent">
            Survey Category
          </span>
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground px-2">
          Each survey earns you KSh 150! Pick a category that interests you.
        </p>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <Badge variant="secondary" className="text-xs py-1.5 px-2 sm:px-3 rounded-full">
            ⭐ KSh 150 per survey
          </Badge>
          <Badge variant="outline" className="text-xs py-1.5 px-2 sm:px-3 rounded-full">
            🎯 {categories.reduce((sum, cat) => sum + cat.available, 0)} available
          </Badge>
        </div>
      </div>

      {/* Categories Grid - Mobile First */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {categories.map((category, index) => (
          <Card 
            key={category.id}
            className="group relative overflow-hidden bg-card hover-lift border-border/30 animate-slide-up hover:shadow-elevated active:scale-95 transition-all duration-200 touch-manipulation"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
            
            <div className="relative p-4 sm:p-5 space-y-3 sm:space-y-4">
              {/* Header - Mobile Optimized */}
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${category.gradient} rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg`}>
                  <category.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <div className="text-right">
                  <Badge className="bg-success/10 text-success border-success/20 text-xs px-2 py-1 rounded-full">
                    {category.available} left
                  </Badge>
                  <p className="text-xl sm:text-2xl font-bold gradient-earning bg-clip-text text-transparent mt-1">
                    KSh {category.earning}
                  </p>
                </div>
              </div>

              {/* Content - Condensed for Mobile */}
              <div className="space-y-2">
                <h3 className="text-base sm:text-lg font-bold group-hover:text-primary transition-colors leading-tight">
                  {category.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {category.description}
                </p>
              </div>

              {/* Stats - Mobile Grid */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 py-2 sm:py-3 border-t border-border/50">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Time</p>
                  <p className="text-xs sm:text-sm font-medium">{category.time}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Questions</p>
                  <p className="text-xs sm:text-sm font-medium">{category.questions}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Level</p>
                  <Badge 
                    variant={category.difficulty === 'Easy' ? 'secondary' : 'outline'}
                    className="text-xs px-1.5 sm:px-2 py-0.5"
                  >
                    {category.difficulty}
                  </Badge>
                </div>
              </div>

              {/* Action Button - Mobile Friendly */}
              <Button 
                onClick={() => onStartSurvey(category.id)}
                className={`w-full h-10 sm:h-12 bg-gradient-to-r ${category.gradient} text-white border-0 hover:opacity-90 active:scale-95 transition-all duration-200 shadow-lg font-semibold text-sm sm:text-base touch-manipulation`}
              >
                Open Survey
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="text-center pt-4 sm:pt-8 pb-4">
        <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 sm:px-6 py-2 sm:py-3 rounded-full">
          <span className="text-base sm:text-lg">💰</span>
          <span className="font-semibold text-sm sm:text-base">
            Complete all surveys to earn KSh {categories.length * 150}!
          </span>
        </div>
      </div>
    </div>
  );
};

export default SurveyCategories;