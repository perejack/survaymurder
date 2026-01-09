import { useState, useEffect, useRef } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface SurveyInterfaceProps {
  category: string;
  onComplete: (earnings: number) => void;
  onBack: () => void;
}

const surveyQuestions = {
  lifestyle: [
    {
      id: 1,
      type: 'multiple',
      question: 'How often do you shop online?',
      options: ['Daily', 'Weekly', 'Monthly', 'Rarely', 'Never']
    },
    {
      id: 2,
      type: 'multiple',
      question: 'What influences your shopping decisions the most?',
      options: ['Price', 'Brand reputation', 'Reviews', 'Recommendations', 'Quality']
    },
    {
      id: 3,
      type: 'multiple',
      question: 'Which payment method do you prefer?',
      options: ['M-Pesa', 'Bank transfer', 'Cash', 'Credit card', 'Other mobile money']
    },
    {
      id: 4,
      type: 'multiple',
      question: 'Which improvement would you like most in online shopping in Kenya?',
      options: [
        'Lower delivery fees',
        'Faster delivery times',
        'Better product quality',
        'Easier returns/refunds',
        'More payment options'
      ]
    }
  ],
  technology: [
    {
      id: 1,
      type: 'multiple',
      question: 'How many hours do you spend on your smartphone daily?',
      options: ['Less than 1 hour', '1-3 hours', '3-5 hours', '5-8 hours', 'More than 8 hours']
    },
    {
      id: 2,
      type: 'multiple',
      question: 'What type of apps do you use most?',
      options: ['Social media', 'Entertainment', 'Productivity', 'Games', 'News']
    },
    {
      id: 3,
      type: 'multiple',
      question: 'How important is app security to you?',
      options: ['Very important', 'Important', 'Somewhat important', 'Not important']
    },
    {
      id: 4,
      type: 'multiple',
      question: 'Which new feature would you most like in mobile apps?',
      options: [
        'Dark mode everywhere',
        'Offline usage',
        'Smaller data usage',
        'Better privacy controls',
        'M-Pesa/native payments'
      ]
    }
  ]
};

const SurveyInterface = ({ category, onComplete, onBack }: SurveyInterfaceProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeSpent, setTimeSpent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const answersScrollRef = useRef<HTMLDivElement | null>(null);

  const questions = surveyQuestions[category as keyof typeof surveyQuestions] || surveyQuestions.lifestyle;
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Ensure we always reset scroll to top when question index changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (answersScrollRef.current) {
      answersScrollRef.current.scrollTop = 0;
    }
  }, [currentQuestion]);

  const handleNext = () => {
    if (!answers[questions[currentQuestion].id]) return;
    
    setIsAnimating(true);
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        onComplete(150);
      }
      setIsAnimating(false);
    }, 300);
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentQuestion(currentQuestion - 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setIsAnimating(false);
      }, 300);
    }
  };

  const handleAnswerChange = (value: string) => {
    setAnswers({
      ...answers,
      [questions[currentQuestion].id]: value
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 sm:px-6 space-y-4">
      {/* Mobile Header */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} className="gap-2 p-2 rounded-full touch-manipulation">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="text-center flex-1 min-w-0 mx-2">
            <h2 className="text-base sm:text-lg font-bold capitalize truncate">{category} Survey</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Question {currentQuestion + 1} of {questions.length}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-accent/10 text-accent px-2 sm:px-3 py-1.5 rounded-full">
            <Award className="w-4 h-4" />
            <span className="text-sm font-bold">150</span>
          </div>
        </div>

        {/* Progress Bar - Mobile */}
        <div className="space-y-1.5 sm:space-y-2">
          <Progress value={progress} className="h-2 sm:h-3 bg-muted/50" />
          <div className="flex justify-between items-center text-xs sm:text-sm text-muted-foreground">
            <span>{Math.round(progress)}% Complete</span>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{formatTime(timeSpent)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Question Card - Mobile Optimized */}
      <Card className={`p-4 sm:p-6 shadow-elevated transition-all duration-300 mx-2 sm:mx-0 ${isAnimating ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
        <div className="space-y-4 sm:space-y-5 pb-20">
          {/* Question Header */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 gradient-hero rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base flex-shrink-0">
                {currentQuestion + 1}
              </div>
              <h3 className="text-lg sm:text-xl font-semibold leading-tight flex-1">{questions[currentQuestion].question}</h3>
            </div>
          </div>

          {/* Answer Options */}
          <div ref={answersScrollRef} className="space-y-3 sm:space-y-4 max-h-[50vh] sm:max-h-none overflow-auto">
            {questions[currentQuestion].type === 'multiple' ? (
              <RadioGroup
                value={answers[questions[currentQuestion].id] || ''}
                onValueChange={handleAnswerChange}
                className="space-y-2 sm:space-y-3"
              >
                {questions[currentQuestion].options?.map((option, index) => (
                  <div 
                    key={index} 
                    className="p-4 border-2 border-border/50 rounded-xl hover:bg-accent/5 active:bg-accent/10 transition-colors cursor-pointer touch-manipulation"
                    onClick={() => handleAnswerChange(option)}
                  >
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value={option} id={`option-${index}`} className="touch-manipulation" />
                      <Label 
                        htmlFor={`option-${index}`} 
                        className="flex-1 cursor-pointer text-base sm:text-lg leading-relaxed touch-manipulation"
                      >
                        {option}
                      </Label>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                <Textarea
                  placeholder="Share your thoughts here..."
                  value={answers[questions[currentQuestion].id] || ''}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  className="min-h-32 sm:min-h-36 text-base sm:text-lg resize-none p-4 border-2 touch-manipulation"
                />
                <p className="text-sm sm:text-base text-muted-foreground px-1">
                  Please provide at least a few words to continue.
                </p>
              </div>
            )}
          </div>

          {/* Navigation - Mobile Friendly (Sticky above bottom nav) */}
          <div className="sticky bottom-[80px] sm:bottom-[88px] left-0 right-0 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 pt-3 pb-3 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 border-t border-border">
            <div className="flex gap-3 sm:gap-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="flex-1 h-12 sm:h-14 text-base sm:text-lg font-semibold touch-manipulation active:scale-95 transition-transform"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Previous
              </Button>

              <Button
                onClick={handleNext}
                disabled={!answers[questions[currentQuestion].id]}
                className="flex-1 h-12 sm:h-14 gradient-hero text-white hover:opacity-90 text-base sm:text-lg font-semibold touch-manipulation active:scale-95 transition-transform"
              >
                {currentQuestion === questions.length - 1 ? (
                  <>
                    Complete <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                  </>
                ) : (
                  <>
                    Next <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Progress indicator */}
      <div className="flex justify-center pb-4">
        <div className="flex gap-2 sm:gap-3">
          {questions.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all duration-300 ${
                index < currentQuestion ? 'bg-success' :
                index === currentQuestion ? 'bg-primary' :
                'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SurveyInterface;