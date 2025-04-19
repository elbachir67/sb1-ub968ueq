import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../config/api";
import { Question } from "../types";
import {
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowRight,
  Loader2,
  BookOpen,
  RefreshCcw,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  calculateDetailedScore,
  generateRecommendations,
} from "../utils/scoringSystem";

function QuizPage() {
  const { pathwayId, moduleId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [answers, setAnswers] = useState<
    {
      questionId: string;
      selectedOption: string;
      isCorrect: boolean;
      timeSpent: number;
      category: string;
      difficulty: string;
    }[]
  >([]);
  const [quizStartTime] = useState(Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [showRetryOptions, setShowRetryOptions] = useState(false);
  const [quiz, setQuiz] = useState<any>(null);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!pathwayId || !moduleId || !user) return;

      try {
        const response = await fetch(
          `${api.pathways}/${pathwayId}/modules/${moduleId}/quiz`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Erreur lors du chargement du quiz");
        }

        const data = await response.json();
        setQuiz(data);
        setQuestions(data.questions);
        setTimeLeft(data.timeLimit);
        setStartTime(Date.now());
        setLoading(false);
      } catch (error) {
        console.error("Error:", error);
        toast.error("Erreur lors du chargement du quiz");
        navigate(`/pathways/${pathwayId}`);
      }
    };

    fetchQuiz();
  }, [pathwayId, moduleId, user, navigate]);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleQuizComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleAnswerSelect = (optionId: string) => {
    if (showExplanation) return;

    const timeSpent = (Date.now() - startTime) / 1000;
    const currentQuestion = questions[currentQuestionIndex];

    // Trouver l'option sélectionnée
    const selectedOption = currentQuestion.options.find(
      opt => opt.id === optionId
    );

    // Vérifier si la réponse est correcte
    const isCorrect = selectedOption?.isCorrect || false;

    // Mettre à jour le compteur de réponses correctes
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
    }

    setSelectedAnswer(optionId);
    setShowExplanation(true);
    setAnswers(prev => [
      ...prev,
      {
        questionId: currentQuestion.id,
        selectedOption: optionId,
        isCorrect,
        timeSpent,
        category: currentQuestion.category,
        difficulty: currentQuestion.difficulty,
      },
    ]);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex === questions.length - 1) {
      handleQuizComplete();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setStartTime(Date.now());
    }
  };

  const handleQuizComplete = async () => {
    if (!pathwayId || !moduleId || !user || submitting || !quiz) return;

    setSubmitting(true);

    try {
      // Calculer le score basé sur les réponses correctes
      const score = Math.round((correctAnswers / questions.length) * 100);
      setFinalScore(score);

      const totalTimeSpent = Math.round((Date.now() - quizStartTime) / 1000);

      // Calculer les statistiques détaillées
      const categoryScores = calculateDetailedScore(questions, answers);
      const recommendations = generateRecommendations(categoryScores, {
        mathLevel: "intermediate",
        programmingLevel: "intermediate",
        domain: "ml",
      });

      // Log pour le débogage
      console.log("Quiz completed with score:", score);
      console.log(
        "Correct answers:",
        correctAnswers,
        "out of",
        questions.length
      );
      console.log("Answers:", answers);

      const response = await fetch(
        `${api.pathways}/${pathwayId}/modules/${moduleId}/quiz/submit`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            score,
            answers,
            totalTimeSpent,
            categoryScores,
            recommendations,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la soumission du quiz");
      }

      const data = await response.json();

      // Vérifier si le score est suffisant
      if (score < (quiz.passingScore || 70)) {
        setShowRetryOptions(true);
        toast.error(
          `Score insuffisant. Vous devez obtenir au moins ${
            quiz.passingScore || 70
          }% pour valider le quiz.`,
          {
            duration: 5000,
          }
        );
        setSubmitting(false);
        return;
      }

      toast.success("Quiz complété avec succès !");
      navigate(`/pathways/${pathwayId}/quiz-results`, {
        state: {
          result: {
            score,
            totalQuestions: questions.length,
            correctAnswers,
            timeSpent: totalTimeSpent,
            answers,
            categoryScores,
            recommendations,
          },
        },
      });
    } catch (error) {
      console.error("Error:", error);
      toast.error("Erreur lors de la soumission du quiz");
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setCorrectAnswers(0);
    setTimeLeft(quiz.timeLimit || 1800);
    setStartTime(Date.now());
    setShowRetryOptions(false);
    setFinalScore(null);
  };

  const handleReturnToResources = () => {
    navigate(`/pathways/${pathwayId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="flex items-center space-x-2 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Chargement du quiz...</span>
        </div>
      </div>
    );
  }

  if (showRetryOptions) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="glass-card rounded-xl p-8 max-w-lg w-full mx-4">
          <div className="text-center mb-8">
            <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-100 mb-2">
              Score insuffisant
            </h2>
            <p className="text-gray-400 mb-4">
              Vous devez obtenir au moins {quiz?.passingScore || 70}% pour
              valider ce quiz et progresser dans votre parcours.
            </p>
            <div className="bg-gray-800/50 p-4 rounded-lg mb-6">
              <p className="text-gray-300 text-lg mb-1">Votre score:</p>
              <p className="text-4xl font-bold text-purple-400">
                {finalScore}%
              </p>
              <p className="text-gray-400 mt-2">
                {correctAnswers} réponses correctes sur {questions.length}{" "}
                questions
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleRetry}
              className="w-full py-3 px-4 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors flex items-center justify-center"
            >
              <RefreshCcw className="w-5 h-5 mr-2" />
              Réessayer le quiz
            </button>

            <button
              onClick={handleReturnToResources}
              className="w-full py-3 px-4 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-medium transition-colors flex items-center justify-center"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Retourner aux ressources
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-[#0A0A0F] py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card rounded-xl p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-100">
                Question {currentQuestionIndex + 1} sur {questions.length}
              </h1>
              <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <div className="flex items-center text-gray-400">
              <Clock className="w-5 h-5 mr-2" />
              <span>
                {Math.floor(timeLeft / 60)}:
                {String(timeLeft % 60).padStart(2, "0")}
              </span>
            </div>
          </div>

          {/* Question */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
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
            <p className="text-xl text-gray-200">{currentQuestion.text}</p>
          </div>

          {/* Options */}
          <div className="space-y-4">
            {currentQuestion.options.map(option => {
              const isSelected = selectedAnswer === option.id;
              let optionStyle = "border-gray-700 hover:border-purple-500/50";
              let iconComponent = null;

              if (showExplanation) {
                if (option.isCorrect) {
                  optionStyle = "border-green-500 bg-green-500/10";
                  iconComponent = (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  );
                } else if (isSelected) {
                  optionStyle = "border-red-500 bg-red-500/10";
                  iconComponent = <XCircle className="w-5 h-5 text-red-500" />;
                }
              } else if (isSelected) {
                optionStyle = "border-purple-500 bg-purple-500/10";
              }

              return (
                <button
                  key={option.id}
                  onClick={() => handleAnswerSelect(option.id)}
                  disabled={showExplanation}
                  className={`w-full p-4 rounded-lg border text-left transition-all duration-200 ${optionStyle} flex items-center justify-between`}
                >
                  <span className="text-gray-100">{option.text}</span>
                  {iconComponent}
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {showExplanation && (
            <div className="mt-8 p-6 rounded-lg bg-gray-800/50 border border-gray-700">
              <p className="text-gray-300">{currentQuestion.explanation}</p>
            </div>
          )}

          {/* Next Button */}
          {showExplanation && (
            <button
              onClick={handleNextQuestion}
              disabled={submitting}
              className="mt-8 w-full py-3 px-4 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Traitement en cours...
                </>
              ) : currentQuestionIndex === questions.length - 1 ? (
                "Terminer le quiz"
              ) : (
                <>
                  Question suivante
                  <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuizPage;
