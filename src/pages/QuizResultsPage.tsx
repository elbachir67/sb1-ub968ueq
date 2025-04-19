import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { QuizResult } from "../types";
import {
  Trophy,
  Clock,
  Target,
  ArrowRight,
  CheckCircle,
  XCircle,
  RefreshCcw,
} from "lucide-react";

function QuizResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { pathwayId } = useParams();
  const result = location.state?.result as QuizResult;

  if (!result) {
    navigate(`/pathways/${pathwayId}`);
    return null;
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  const handleRetakeQuiz = () => {
    // Retourner au parcours, d'où l'utilisateur pourra relancer le quiz
    navigate(`/pathways/${pathwayId}`);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Score Overview */}
        <div className="glass-card rounded-xl p-8 mb-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-purple-500/20 flex items-center justify-center">
            <Trophy className="w-10 h-10 text-purple-400" />
          </div>

          <h1 className="text-3xl font-bold text-gray-100 mb-2">
            Quiz Terminé !
          </h1>

          <p className="text-4xl font-bold text-purple-400 mb-6">
            {result.score}%
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-lg bg-gray-800/50">
              <Target className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <p className="text-gray-400">Précision</p>
              <p className="text-xl font-bold text-gray-200">
                {result.correctAnswers}/{result.totalQuestions}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-gray-800/50">
              <Clock className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <p className="text-gray-400">Temps Total</p>
              <p className="text-xl font-bold text-gray-200">
                {formatTime(result.timeSpent)}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-gray-800/50">
              <Clock className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
              <p className="text-gray-400">Temps Moyen/Question</p>
              <p className="text-xl font-bold text-gray-200">
                {formatTime(result.timeSpent / result.totalQuestions)}
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Results */}
        <div className="glass-card rounded-xl p-8">
          <h2 className="text-xl font-bold text-gray-100 mb-6">
            Détail des Réponses
          </h2>

          <div className="space-y-4">
            {result.answers.map((answer, index) => (
              <div
                key={answer.questionId}
                className={`p-4 rounded-lg ${
                  answer.isCorrect ? "bg-green-500/10" : "bg-red-500/10"
                } flex items-center justify-between`}
              >
                <div className="flex items-center">
                  {answer.isCorrect ? (
                    <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400 mr-3" />
                  )}
                  <div>
                    <p className="text-gray-200">Question {index + 1}</p>
                    <p className="text-sm text-gray-400">
                      {answer.isCorrect
                        ? "Réponse correcte"
                        : "Réponse incorrecte"}{" "}
                      • Temps: {formatTime(answer.timeSpent)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <button
              onClick={handleRetakeQuiz}
              className="flex-1 py-3 px-4 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-medium transition-colors flex items-center justify-center"
            >
              <RefreshCcw className="w-5 h-5 mr-2" />
              Refaire le quiz
            </button>

            <button
              onClick={() => navigate(`/pathways/${pathwayId}`)}
              className="flex-1 py-3 px-4 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors flex items-center justify-center"
            >
              Retour au parcours
              <ArrowRight className="ml-2 w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuizResultsPage;
