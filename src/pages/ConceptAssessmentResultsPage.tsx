import React, { useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Trophy,
  Brain,
  ArrowRight,
  CheckCircle,
  XCircle,
  Lightbulb,
  RefreshCw,
} from "lucide-react";

function ConceptAssessmentResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { conceptId } = useParams();
  const result = location.state?.result;

  useEffect(() => {
    if (!result) {
      navigate(`/concepts/${conceptId}`);
    }
  }, [result, navigate, conceptId]);

  if (!result) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Score Overview */}
        <div className="glass-card rounded-xl p-8 mb-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-purple-500/20 flex items-center justify-center">
            <Trophy className="w-10 h-10 text-purple-400" />
          </div>

          <h1 className="text-3xl font-bold text-gray-100 mb-2">
            Évaluation Terminée !
          </h1>

          <p className="text-4xl font-bold text-purple-400 mb-6">
            {result.score}%
          </p>

          <div className="p-4 rounded-lg bg-gray-800/50 mb-6">
            <p className="text-gray-300 mb-2">
              {result.score >= 80
                ? "Excellent niveau de maîtrise !"
                : result.score >= 60
                ? "Bon niveau de compréhension"
                : "Des révisions supplémentaires sont recommandées"}
            </p>
            <div className="w-full bg-gray-700 h-3 rounded-full">
              <div
                className={`h-3 rounded-full ${
                  result.score >= 80
                    ? "bg-green-500"
                    : result.score >= 60
                    ? "bg-blue-500"
                    : "bg-yellow-500"
                }`}
                style={{ width: `${result.score}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Adaptations to Pathway */}
        {result.adaptations && (
          <div className="glass-card rounded-xl p-8 mb-8">
            <div className="flex items-center mb-6">
              <RefreshCw className="w-6 h-6 text-blue-400 mr-3" />
              <h2 className="text-xl font-bold text-gray-100">
                Adaptations de votre parcours
              </h2>
            </div>

            <div className="space-y-4">
              {result.adaptations.map((adaptation: any, index: number) => (
                <div
                  key={index}
                  className="p-4 rounded-lg bg-gray-800/50 border-l-4 border-blue-500"
                >
                  <p className="text-gray-200 font-medium mb-2">
                    {adaptation.title}
                  </p>
                  <p className="text-gray-400">{adaptation.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {result.recommendations && (
          <div className="glass-card rounded-xl p-8 mb-8">
            <div className="flex items-center mb-6">
              <Lightbulb className="w-6 h-6 text-yellow-400 mr-3" />
              <h2 className="text-xl font-bold text-gray-100">
                Recommandations
              </h2>
            </div>

            <div className="space-y-4">
              {result.recommendations.map(
                (recommendation: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-start p-4 rounded-lg bg-gray-800/50"
                  >
                    <div className="p-2 rounded-full bg-yellow-500/20 mr-3">
                      <CheckCircle className="w-4 h-4 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-gray-200">{recommendation}</p>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate(`/concepts/${conceptId}`)}
            className="flex-1 py-3 px-4 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-medium transition-colors flex items-center justify-center"
          >
            <Brain className="w-5 h-5 mr-2" />
            Détails du concept
          </button>

          <button
            onClick={() => navigate("/dashboard")}
            className="flex-1 py-3 px-4 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors flex items-center justify-center"
          >
            Retour au tableau de bord
            <ArrowRight className="ml-2 w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConceptAssessmentResultsPage;
