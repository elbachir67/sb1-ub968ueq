import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../config/api";
import {
  Clock,
  CheckCircle,
  Calendar,
  Award,
  Loader2,
  AlertCircle,
  BookOpen,
  Video,
  GraduationCap,
  Laptop,
  Bot,
  ChevronDown,
  Play,
  Pause,
  ArrowRight,
  RefreshCcw,
  Rocket,
  Brain,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { Pathway, ResourceType, PathwayResource } from "../types";
import AdaptiveRecommendations from "../components/AdaptiveRecommendations";
import LearningProgressChart from "../components/LearningProgressChart";
import AdaptiveContent from "../components/AdaptiveContent";

interface ResourceTypeConfig {
  icon: typeof BookOpen;
  color: string;
  bg: string;
}

const resourceTypeConfig: Record<ResourceType, ResourceTypeConfig> = {
  article: { icon: BookOpen, color: "text-blue-400", bg: "bg-blue-400/20" },
  video: { icon: Video, color: "text-red-400", bg: "bg-red-400/20" },
  course: {
    icon: GraduationCap,
    color: "text-green-400",
    bg: "bg-green-400/20",
  },
  book: { icon: BookOpen, color: "text-purple-400", bg: "bg-purple-400/20" },
  use_case: { icon: Laptop, color: "text-orange-400", bg: "bg-orange-400/20" },
};

function PathwayPage() {
  const { pathwayId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pathway, setPathway] = useState<Pathway | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progressData, setProgressData] = useState<any[]>([]);
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);

  useEffect(() => {
    const fetchPathway = async () => {
      if (!pathwayId || !user) return;

      try {
        const response = await fetch(`${api.pathways}/${pathwayId}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Erreur lors du chargement du parcours");
        }

        const data = await response.json();
        setPathway(data);

        // Fetch progress data for the chart
        const progressResponse = await fetch(
          `${api.pathways}/${pathwayId}/progress`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (progressResponse.ok) {
          const progressData = await progressResponse.json();
          setProgressData(progressData);
        }

        setError(null);
      } catch (error) {
        console.error("Error:", error);
        setError(
          error instanceof Error ? error.message : "Erreur lors du chargement"
        );
        toast.error("Erreur lors du chargement du parcours");
      } finally {
        setLoading(false);
      }
    };

    fetchPathway();
  }, [pathwayId, user]);

  const handleResourceComplete = async (
    moduleIndex: number,
    resourceId: string
  ) => {
    if (!pathway || !user || !pathwayId) return;

    try {
      const response = await fetch(
        `${api.pathways}/${pathwayId}/modules/${moduleIndex}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resourceId,
            completed: true,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour");
      }

      const updatedPathway = await response.json();
      setPathway(updatedPathway);
      toast.success("Progression mise à jour");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Erreur lors de la mise à jour de la progression");
    }
  };

  const handleRecommendationAction = async (
    index: number,
    action: "start" | "skip" | "complete"
  ) => {
    if (!pathway || !user || !pathwayId) return;

    try {
      const response = await fetch(
        `${api.pathways}/${pathwayId}/recommendations/${index}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour de la recommandation");
      }

      const updatedPathway = await response.json();
      setPathway(updatedPathway);

      if (action === "start") {
        toast.success("Recommandation démarrée");
      } else if (action === "skip") {
        toast.success("Recommandation ignorée");
      } else {
        toast.success("Recommandation complétée");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Erreur lors de la mise à jour de la recommandation");
    }
  };

  const handleRetakeQuiz = async (moduleIndex: number) => {
    if (!pathway || !user || !pathwayId) return;

    try {
      const response = await fetch(
        `${api.pathways}/${pathwayId}/modules/${moduleIndex}/quiz/reset`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la réinitialisation du quiz");
      }

      const updatedPathway = await response.json();
      setPathway(updatedPathway.pathway);

      navigate(`/pathways/${pathwayId}/modules/${moduleIndex}/quiz`);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Erreur lors de la réinitialisation du quiz");
    }
  };

  const WelcomeModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Rocket className="w-8 h-8 text-purple-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-100 mb-2">
            Bienvenue dans votre parcours !
          </h3>
          <p className="text-gray-400 mb-6">
            Voici comment progresser dans votre apprentissage :
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-start space-x-3 p-4 bg-gray-800/50 rounded-lg">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <BookOpen className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h4 className="font-medium text-gray-200">
                1. Consultez les ressources
              </h4>
              <p className="text-sm text-gray-400">
                Étudiez le contenu de chaque module dans l'ordre
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 bg-gray-800/50 rounded-lg">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h4 className="font-medium text-gray-200">
                2. Marquez votre progression
              </h4>
              <p className="text-sm text-gray-400">
                Indiquez les ressources terminées pour suivre votre avancement
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 bg-gray-800/50 rounded-lg">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Brain className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h4 className="font-medium text-gray-200">3. Passez les quiz</h4>
              <p className="text-sm text-gray-400">
                Validez vos connaissances à la fin de chaque module
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowWelcomeModal(false)}
          className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center justify-center"
        >
          Commencer l'apprentissage
          <ArrowRight className="w-5 h-5 ml-2" />
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="flex items-center space-x-2 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Chargement du parcours...</span>
        </div>
      </div>
    );
  }

  if (error || !pathway) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="text-center text-gray-400">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" />
          <p className="mb-4">{error || "Parcours non trouvé"}</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="glass-card rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-100">
              {pathway.goalId.title}
            </h1>
            <div className="flex items-center space-x-2">
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  pathway.status === "active"
                    ? "bg-green-500/20 text-green-400"
                    : pathway.status === "completed"
                    ? "bg-blue-500/20 text-blue-400"
                    : "bg-yellow-500/20 text-yellow-400"
                }`}
              >
                {pathway.status === "active"
                  ? "En cours"
                  : pathway.status === "completed"
                  ? "Terminé"
                  : "En pause"}
              </span>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Progression globale</span>
              <span>{pathway.progress}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${pathway.progress}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm text-gray-400">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              <span>
                Début : {new Date(pathway.startedAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              <span>
                Fin estimée :{" "}
                {new Date(pathway.estimatedCompletionDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Graphique de progression */}
        {progressData.length > 0 && (
          <div className="glass-card rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-100 mb-4">
              Progression d'apprentissage
            </h2>
            <LearningProgressChart data={progressData} height={250} />
          </div>
        )}

        {/* Modules */}
        <div className="space-y-6">
          {pathway.moduleProgress.map((module, index) => (
            <div key={index} className="glass-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-200">
                  Module {index + 1}
                </h2>
                {module.completed ? (
                  <div className="flex items-center text-green-400">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span>Complété</span>
                  </div>
                ) : (
                  <div className="flex items-center text-gray-400">
                    <Clock className="w-5 h-5 mr-2" />
                    <span>En cours</span>
                  </div>
                )}
              </div>

              {/* Ressources */}
              <div className="space-y-4 mb-6">
                <h3 className="text-md font-medium text-gray-300">
                  Ressources
                </h3>
                {module.resources.map(
                  (resource: PathwayResource, resourceIndex: number) => {
                    const resourceType =
                      (resource.type as ResourceType) || "article";
                    const config =
                      resourceTypeConfig[resourceType] ||
                      resourceTypeConfig.article;
                    const ResourceIcon = config.icon;

                    return (
                      <div
                        key={resourceIndex}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50"
                      >
                        <div className="flex items-center">
                          <ResourceIcon className="w-5 h-5 text-gray-400 mr-3" />
                          <span className="text-gray-300">
                            Ressource {resourceIndex + 1}
                          </span>
                        </div>
                        {resource.completed ? (
                          <div className="flex items-center text-green-400">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            <span>Terminé</span>
                          </div>
                        ) : (
                          <button
                            onClick={() =>
                              handleResourceComplete(index, resource.resourceId)
                            }
                            className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                          >
                            Marquer comme terminé
                          </button>
                        )}
                      </div>
                    );
                  }
                )}
              </div>

              {/* Contenu Personnalisé */}
              <div className="mt-8">
                <h3 className="text-md font-medium text-gray-300 mb-4">
                  Contenu Personnalisé
                </h3>
                <AdaptiveContent
                  topic={pathway.goalId.modules[index].title}
                  moduleId={module._id}
                  userProfile={{
                    learningStyle: "visual",
                    preferences: {
                      mathLevel: "intermediate",
                      programmingLevel: "intermediate",
                    },
                  }}
                  previousPerformance={module.quiz.score || 0}
                />
              </div>

              {/* Quiz */}
              <div>
                <h3 className="text-md font-medium text-gray-300 mb-4">
                  Quiz de validation
                </h3>
                {module.quiz.completed ? (
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50">
                    <div className="flex items-center">
                      <Award className="w-5 h-5 text-yellow-400 mr-2" />
                      <span className="text-gray-300">
                        Score : {module.quiz.score}%
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-sm text-gray-400">
                        Complété le{" "}
                        {module.quiz.completedAt &&
                          new Date(
                            module.quiz.completedAt
                          ).toLocaleDateString()}
                      </div>
                      <button
                        onClick={() => handleRetakeQuiz(index)}
                        className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                      >
                        <RefreshCcw className="w-4 h-4 mr-1" />
                        Refaire
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() =>
                      navigate(`/pathways/${pathwayId}/modules/${index}/quiz`)
                    }
                    className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Commencer le quiz
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Recommandations adaptatives */}
        {pathway.adaptiveRecommendations?.length > 0 && (
          <div className="mt-8">
            <AdaptiveRecommendations
              recommendations={pathway.adaptiveRecommendations}
              onRecommendationAction={handleRecommendationAction}
            />
          </div>
        )}
      </div>

      {showWelcomeModal && pathway && <WelcomeModal />}
    </div>
  );
}

export default PathwayPage;
