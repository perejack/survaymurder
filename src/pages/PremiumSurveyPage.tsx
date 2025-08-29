import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, CheckCircle, Star, Zap } from 'lucide-react';

const PremiumSurveyPage = () => {
  const navigate = useNavigate();
  const { user, completeSurvey, addEarning } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Premium survey questions
  const surveyQuestions = [
    {
      question: "Which social media platform do you use most frequently?",
      options: ["Facebook", "Instagram", "Twitter/X", "TikTok", "LinkedIn", "WhatsApp"]
    },
    {
      question: "How often do you shop online?",
      options: ["Daily", "Weekly", "Monthly", "Rarely", "Never"]
    },
    {
      question: "What is your preferred payment method for online purchases?",
      options: ["M-Pesa", "Credit/Debit Card", "Bank Transfer", "Cash on Delivery", "PayPal"]
    },
    {
      question: "Which type of content do you engage with most on social media?",
      options: ["News & Politics", "Entertainment", "Sports", "Business", "Lifestyle", "Education"]
    },
    {
      question: "How likely are you to recommend a product after a positive experience?",
      options: ["Very Likely", "Likely", "Neutral", "Unlikely", "Very Unlikely"]
    }
  ];

  const handleAnswer = (answer: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);

    if (currentQuestion < surveyQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSurveyComplete();
    }
  };

  const handleSurveyComplete = async () => {
    if (!user) return;
    
    setIsCompleting(true);
    
    try {
      // Complete survey in database
      await completeSurvey('premium');
      
      // Add earnings
      await addEarning(250, 'survey', 'Premium survey completion');
      
      setShowSuccess(true);
      
      // Redirect back to main platform after 3 seconds
      setTimeout(() => {
        navigate('/survey-platform');
      }, 3000);
      
    } catch (error) {
      console.error('Error completing premium survey:', error);
      setIsCompleting(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center bg-white shadow-2xl border-0">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Survey Complete! 🎉</h2>
            <p className="text-gray-600 mb-4">You've earned 250 KSH for completing this premium survey!</p>
            <Badge className="bg-green-100 text-green-800 border-green-300 px-4 py-2">
              +250 KSH Earned
            </Badge>
          </div>
          <p className="text-sm text-gray-500">Redirecting you back to the main platform...</p>
        </Card>
      </div>
    );
  }

  if (isCompleting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center bg-white shadow-2xl border-0">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Zap className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Processing Survey...</h2>
            <p className="text-gray-600">Please wait while we process your responses</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background p-4">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/survey-platform')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
            <Star className="w-3 h-3 mr-1" />
            Premium Survey
          </Badge>
        </div>
        
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Premium Survey</h1>
          <p className="text-gray-600 mb-4">Answer a few questions to earn 250 KSH</p>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / surveyQuestions.length) * 100}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500">
            Question {currentQuestion + 1} of {surveyQuestions.length}
          </p>
        </div>
      </div>

      {/* Survey Question */}
      <div className="max-w-2xl mx-auto">
        <Card className="p-8 bg-white shadow-xl border-0">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
            {surveyQuestions[currentQuestion].question}
          </h2>
          
          <div className="space-y-3">
            {surveyQuestions[currentQuestion].options.map((option, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full p-4 text-left justify-start hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                onClick={() => handleAnswer(option)}
              >
                <span className="w-6 h-6 rounded-full border-2 border-gray-300 mr-3 flex-shrink-0"></span>
                {option}
              </Button>
            ))}
          </div>
          
          {/* Navigation */}
          <div className="flex justify-between items-center mt-8">
            <Button 
              variant="ghost" 
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>
            
            <div className="text-sm text-gray-500">
              {answers[currentQuestion] && (
                <span className="text-green-600 font-medium">
                  ✓ Answer selected
                </span>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PremiumSurveyPage;
