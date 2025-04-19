import React from "react";
import { Book, Code, Brain, Lightbulb, ArrowRight } from "lucide-react";
import { toast } from "react-hot-toast";

interface Recommendation {
  type: "resource" | "practice" | "review";
  description: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "completed" | "skipped";
}

interface AdaptiveRecommendationsProps {
  recommendations: Recommendation[];
  onRecommendationAction: (
    index: number,
    action: "start" | "skip" | "complete"
  ) => void;
}

const AdaptiveRecommendations: React.FC<AdaptiveRecommendationsProps> = ({
  recommendations,
  onRecommendationAction,
}) => {
  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  const handleAction = async (
    index: number,
    action: "start" | "skip" | "complete"
  ) => {
    try {
      await onRecommendationAction(index, action);

      const actionMessages = {
        start: "Recommandation démarrée",
        skip: "Recommandation ignorée",
        complete: "Recommandation complétée",
      };

      toast.success(actionMessages[action]);
    } catch (error) {
      console.error("Error handling recommendation action:", error);
      toast.error("Erreur lors de la mise à jour de la recommandation");
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case "resource":
        return <Book className="w-5 h-5 text-blue-400" />;
      case "practice":
        return <Code className="w-5 h-5 text-green-400" />;
      case "review":
        return <Brain className="w-5 h-5 text-purple-400" />;
      default:
        return <Lightbulb className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-red-500";
      case "medium":
        return "border-yellow-500";
      case "low":
        return "border-blue-500";
      default:
        return "border-gray-500";
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-100 mb-4 flex items-center">
        <Lightbulb className="w-5 h-5 text-yellow-400 mr-2" />
        Recommandations personnalisées
      </h2>

      {recommendations.map((recommendation, index) => (
        <div
          key={index}
          className={`glass-card rounded-xl p-6 border-l-4 ${getPriorityStyles(
            recommendation.priority
          )}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {getRecommendationIcon(recommendation.type)}
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-200">
                  {recommendation.type === "resource"
                    ? "Ressource recommandée"
                    : recommendation.type === "practice"
                    ? "Exercice pratique"
                    : "Révision suggérée"}
                </h3>
                <p className="text-gray-400 mt-1">
                  {recommendation.description}
                </p>
              </div>
            </div>

            {recommendation.status === "pending" ? (
              <div className="flex space-x-2">
                <button
                  onClick={() => handleAction(index, "start")}
                  className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                >
                  Commencer
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
                <button
                  onClick={() => handleAction(index, "skip")}
                  className="px-3 py-1 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Ignorer
                </button>
              </div>
            ) : recommendation.status === "completed" ? (
              <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg">
                Complété
              </span>
            ) : (
              <span className="px-3 py-1 bg-gray-700 text-gray-400 rounded-lg">
                Ignoré
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdaptiveRecommendations;
