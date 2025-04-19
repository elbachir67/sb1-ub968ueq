import React, { useState, useEffect } from "react";
import { Question } from "../types";
import { CheckCircle2, XCircle, ArrowRight, Clock } from "lucide-react";

interface QuizComponentProps {
  questions: Question[];
  onComplete: (score: number, responses: any[]) => void;
}

const QuizComponent: React.FC<QuizComponentProps> = ({
  questions,
  onComplete,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [responses, setResponses] = useState<any[]>([]);

  useEffect(() => {
    if (!questions || questions.length === 0) {
      onComplete(0, []);
      return;
    }
    setStartTime(Date.now());
  }, [currentQuestionIndex, questions, onComplete]);

  if (!questions || questions.length === 0) {
    return (
      <div className="text-center p-6 bg-gray-800/50 rounded-lg">
        <p className="text-gray-300">
          Aucune question disponible pour votre profil. Veuillez revenir à
          l'étape précédente.
        </p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleAnswerSelect = (optionId: string) => {
    if (showExplanation) return;

    const timeSpent = (Date.now() - startTime) / 1000;
    setSelectedAnswer(optionId);
    setShowExplanation(true);

    const isCorrect =
      currentQuestion.options.find(opt => opt.id === optionId)?.isCorrect ||
      false;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    setResponses(prev => [
      ...prev,
      {
        questionId: currentQuestion.id,
        selectedOption: optionId,
        timeSpent,
        category: currentQuestion.category,
        difficulty: currentQuestion.difficulty,
        isCorrect: isCorrect,
      },
    ]);
  };

  const handleNext = () => {
    if (isLastQuestion) {
      const finalScore = Math.round((score / questions.length) * 100);
      onComplete(finalScore, responses);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setStartTime(Date.now());
    }
  };

  const getOptionStyle = (optionId: string) => {
    if (!showExplanation) {
      return selectedAnswer === optionId
        ? "border-purple-500 bg-purple-500/10"
        : "border-gray-700 hover:border-purple-500/50";
    }

    const option = currentQuestion.options.find(opt => opt.id === optionId);
    if (option?.isCorrect) {
      return "border-green-500 bg-green-500/10";
    }
    return optionId === selectedAnswer
      ? "border-red-500 bg-red-500/10"
      : "border-gray-700 opacity-50";
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-gray-800/50 rounded-lg p-6">
      {/* Progress bar */}
      <div className="w-full bg-gray-700 rounded-full h-2 mb-6">
        <div
          className="bg-purple-500 h-2 rounded-full transition-all duration-300"
          style={{
            width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
          }}
        />
      </div>

      {/* Question header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xl font-semibold text-gray-100">
            Question {currentQuestionIndex + 1} sur {questions.length}
          </h3>
          <div className="flex items-center text-gray-400">
            <Clock className="w-4 h-4 mr-1" />
            <span className="text-sm">
              {currentQuestion.difficulty === "basic"
                ? "60s"
                : currentQuestion.difficulty === "intermediate"
                ? "90s"
                : "120s"}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2 mb-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              currentQuestion.difficulty === "basic"
                ? "bg-green-500/20 text-green-400"
                : currentQuestion.difficulty === "intermediate"
                ? "bg-blue-500/20 text-blue-400"
                : "bg-purple-500/20 text-purple-400"
            }`}
          >
            {currentQuestion.difficulty}
          </span>
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
            {currentQuestion.category}
          </span>
        </div>
        <p className="text-gray-300">{currentQuestion.text}</p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {currentQuestion.options.map(option => (
          <button
            key={option.id}
            onClick={() => handleAnswerSelect(option.id)}
            className={`w-full p-4 rounded-lg border text-left transition-all duration-200 ${getOptionStyle(
              option.id
            )}`}
            disabled={showExplanation}
          >
            <div className="flex items-center justify-between">
              <span className="text-gray-100">{option.text}</span>
              {showExplanation && option.isCorrect && (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              )}
              {showExplanation &&
                !option.isCorrect &&
                selectedAnswer === option.id && (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
            </div>
          </button>
        ))}
      </div>

      {/* Explanation */}
      {showExplanation && (
        <div className="mt-6 p-4 rounded-lg bg-gray-800/50 border border-gray-700">
          <p className="text-gray-300">{currentQuestion.explanation}</p>
        </div>
      )}

      {/* Next button */}
      {showExplanation && (
        <button
          onClick={handleNext}
          className="mt-6 w-full py-3 px-4 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors duration-200 flex items-center justify-center"
        >
          {isLastQuestion ? "Voir les résultats" : "Question suivante"}
          <ArrowRight className="ml-2 w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default QuizComponent;
