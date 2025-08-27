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
    <div className="max-w-lg mx-auto space-y-4">
      {/* Mobile Header */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} className="gap-2 p-2 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="text-center">
            <h2 className="text-base sm:text-lg font-bold capitalize">{category} Survey</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Question {currentQuestion + 1} of {questions.length}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-accent/10 text-accent px-3 py-1.5 rounded-full">
            <Award className="w-4 h-4" />
            <span className="text-sm font-bold">150</span>
          </div>
        </div>

        {/* Progress Bar - Mobile */}
        <div className="space-y-1.5 sm:space-y-2">
          <Progress value={progress} className="h-1.5 sm:h-2 bg-muted/50" />
          <div className="flex justify-between items-center text-[11px] sm:text-xs text-muted-foreground">
            <span>{Math.round(progress)}% Complete</span>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{formatTime(timeSpent)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Question Card - Mobile Optimized */}
      <Card className={`mobile-card p-3.5 sm:p-6 shadow-elevated transition-all duration-300 ${isAnimating ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
        <div className="space-y-3.5 sm:space-y-5 pb-20">
          {/* Question Header */}
          <div className="space-y-2.5 sm:space-y-3">
            <div className="flex items-start gap-2.5 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 gradient-hero rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0 mt-0.5 sm:mt-1">
                {currentQuestion + 1}
              </div>
              <h3 className="text-base sm:text-lg font-semibold leading-snug sm:leading-tight">{questions[currentQuestion].question}</h3>
            </div>
          </div>

          {/* Answer Options */}
          <div ref={answersScrollRef} className="space-y-2 sm:space-y-3 max-h-[52vh] sm:max-h-none overflow-auto pr-1">
            {questions[currentQuestion].type === 'multiple' ? (
              <RadioGroup
                value={answers[questions[currentQuestion].id] || ''}
                onValueChange={handleAnswerChange}
                className="space-y-1.5 sm:space-y-2"
              >
                {questions[currentQuestion].options?.map((option, index) => (
                  <div 
                    key={index} 
                    className="mobile-card px-3 py-2 border border-border/50 hover:bg-accent/5 active:bg-accent/10 transition-colors cursor-pointer"
                    onClick={() => handleAnswerChange(option)}
                  >
                    <div className="flex items-center space-x-2.5 sm:space-x-3">
                      <RadioGroupItem value={option} id={`option-${index}`} className="mt-0.5" />
                      <Label 
                        htmlFor={`option-${index}`} 
                        className="flex-1 cursor-pointer text-sm sm:text-base leading-snug sm:leading-relaxed"
                      >
                        {option}
                      </Label>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <div className="space-y-2.5 sm:space-y-3">
                <Textarea
                  placeholder="Share your thoughts here..."
                  value={answers[questions[currentQuestion].id] || ''}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  className="mobile-input min-h-28 sm:min-h-32 text-sm sm:text-base resize-none"
                />
                <p className="text-xs sm:text-sm text-muted-foreground px-1">
                  Please provide at least a few words to continue.
                </p>
              </div>
            )}
          </div>

          {/* Navigation - Mobile Friendly (Sticky above bottom nav) */}
          <div className="sticky bottom-[80px] sm:bottom-[88px] left-0 right-0 z-30 -mx-6 px-6 pt-2 pb-2 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 border-t border-border">
            <div className="flex gap-2.5 sm:gap-3">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="mobile-button flex-1 h-11 sm:h-12"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <Button
                onClick={handleNext}
                disabled={!answers[questions[currentQuestion].id]}
                className="mobile-button flex-1 h-11 sm:h-12 gradient-hero text-white hover:opacity-90"
              >
                {currentQuestion === questions.length - 1 ? (
                  <>
                    Complete <CheckCircle2 className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    Next <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Progress indicator */}
      <div className="flex justify-center">
        <div className="flex gap-2">
          {questions.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
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