import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { api } from "../config/api";
import { Goal, GoalDifficulty, ResourceType } from "../types";
import { useAuth } from "../contexts/AuthContext";
import {
  Clock,
  GraduationCap,
  Target,
  BookOpen,
  Video,
  Code,
  Laptop,
  ChevronDown,
  BrainCircuit,
  Trophy,
  Building,
  DollarSign,
  Loader2,
  Users,
  Star,
  ArrowRight,
  CheckCircle,
  Calendar,
  Award,
  AlertCircle,
  Play,
  LayoutDashboard,
} from "lucide-react";

interface ResourceTypeConfig {
  icon: typeof BookOpen;
  color: string;
  bg: string;
  label: string;
}

const resourceTypeConfig: Record<ResourceType, ResourceTypeConfig> = {
  article: {
    icon: BookOpen,
    color: "text-blue-500",
    bg: "bg-blue-500/20",
    label: "Article",
  },
  video: {
    icon: Video,
    color: "text-red-500",
    bg: "bg-red-500/20",
    label: "Vidéo",
  },
  course: {
    icon: GraduationCap,
    color: "text-green-500",
    bg: "bg-green-500/20",
    label: "Cours",
  },
  book: {
    icon: BookOpen,
    color: "text-purple-500",
    bg: "bg-purple-500/20",
    label: "Livre",
  },
  use_case: {
    icon: Laptop,
    color: "text-orange-500",
    bg: "bg-orange-500/20",
    label: "Cas pratique",
  },
};

interface LevelConfig {
  color: string;
  bg: string;
  border: string;
  label: string;
}

const levelConfig: Record<GoalDifficulty, LevelConfig> = {
  beginner: {
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/20",
    label: "Débutant",
  },
  intermediate: {
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/20",
    label: "Intermédiaire",
  },
  advanced: {
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    border: "border-purple-400/20",
    label: "Avancé",
  },
};

function GoalDetailPage() {
  const { goalId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingPathway, setGeneratingPathway] = useState(false);
  const [expandedModules, setExpandedModules] = useState<{
    [key: string]: boolean;
  }>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedPathwayId, setGeneratedPathwayId] = useState<string | null>(
    null
  );

  useEffect(() => {
    const fetchGoal = async () => {
      if (!goalId || !user) return;

      try {
        const response = await fetch(`${api.goals}/${goalId}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Erreur lors du chargement de l'objectif");
        }

        const data = await response.json();
        setGoal(data);

        const initialExpandedState =
          data.modules?.reduce((acc: any, _: any, index: number) => {
            acc[index] = index === 0;
            return acc;
          }, {}) || {};

        setExpandedModules(initialExpandedState);
        setError(null);
      } catch (error) {
        console.error("Error:", error);
        setError(
          error instanceof Error ? error.message : "Erreur lors du chargement"
        );
        toast.error("Erreur lors du chargement de l'objectif");
      } finally {
        setLoading(false);
      }
    };

    if (goalId && user) {
      fetchGoal();
    }
  }, [goalId, user]);

  const generatePathway = async () => {
    if (!goal || !user) return;

    setGeneratingPathway(true);
    try {
      const response = await fetch(`${api.pathways}/generate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ goalId: goal._id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Erreur lors de la génération du parcours"
        );
      }

      const pathway = await response.json();
      setGeneratedPathwayId(pathway._id);
      setShowSuccessModal(true);
      toast.success("Parcours personnalisé généré avec succès !");
    } catch (error) {
      console.error("Error:", error);

      if (error instanceof Error && error.message.includes("existe déjà")) {
        toast.error(
          "Un parcours pour cet objectif existe déjà. Consultez votre tableau de bord pour y accéder.",
          {
            duration: 5000,
            icon: <AlertCircle className="text-red-500" />,
          }
        );
        setTimeout(() => navigate("/dashboard"), 2000);
      } else {
        toast.error(
          "Impossible de générer le parcours. Veuillez réessayer plus tard.",
          {
            duration: 4000,
          }
        );
      }
    } finally {
      setGeneratingPathway(false);
    }
  };

  const toggleModule = (index: number) => {
    setExpandedModules(prev => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const SuccessModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-100 mb-2">
            Parcours généré avec succès !
          </h3>
          <p className="text-gray-400 mb-6">
            Votre parcours personnalisé a été créé. Que souhaitez-vous faire
            maintenant ?
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => navigate(`/pathways/${generatedPathwayId}`)}
            className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center justify-center"
          >
            <Play className="w-5 h-5 mr-2" />
            Commencer le parcours
          </button>

          <button
            onClick={() => navigate("/dashboard")}
            className="w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center justify-center"
          >
            <LayoutDashboard className="w-5 h-5 mr-2" />
            Voir mon tableau de bord
          </button>

          <button
            onClick={() => setShowSuccessModal(false)}
            className="w-full py-3 px-4 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
          >
            Rester sur cette page
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="flex items-center space-x-2 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Chargement...</span>
        </div>
      </div>
    );
  }

  if (error || !goal) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="text-center text-gray-400">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" />
          <p className="mb-4">{error || "Objectif non trouvé"}</p>
          <button
            onClick={() => navigate("/goals")}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Retour aux objectifs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card rounded-xl p-8 mb-8 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-purple-500/10">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-100 mb-4">
                {goal.title}
              </h1>
              <p className="text-xl text-gray-400 mb-6">{goal.description}</p>
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center text-gray-300 bg-gray-800/50 px-4 py-2 rounded-lg">
                  <Clock className="w-5 h-5 mr-2" />
                  <span>{goal.estimatedDuration} semaines</span>
                </div>
                <div className="flex items-center">
                  <span
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      levelConfig[goal.level].bg
                    } ${levelConfig[goal.level].color} border ${
                      levelConfig[goal.level].border
                    }`}
                  >
                    {levelConfig[goal.level].label}
                  </span>
                </div>
                <button
                  onClick={generatePathway}
                  disabled={generatingPathway}
                  className="ml-4 px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-300 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generatingPathway ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Génération en cours...
                    </>
                  ) : (
                    <>
                      <BrainCircuit className="w-5 h-5 mr-2" />
                      Générer mon parcours personnalisé
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {goal.prerequisites && goal.prerequisites.length > 0 && (
          <div className="glass-card rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-100 mb-4">Prérequis</h2>
            <div className="space-y-4">
              {goal.prerequisites.map((prereq, index) => (
                <div key={index} className="bg-gray-800/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-200 mb-2">
                    {prereq.category === "math"
                      ? "Mathématiques"
                      : prereq.category === "programming"
                      ? "Programmation"
                      : prereq.category}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {prereq.skills.map((skill, skillIndex) => (
                      <div
                        key={skillIndex}
                        className={`px-3 py-1 rounded-full text-sm ${
                          skill.level === "basic"
                            ? "bg-green-500/20 text-green-400"
                            : skill.level === "intermediate"
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-purple-500/20 text-purple-400"
                        }`}
                      >
                        {skill.name}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-6">
          {goal.modules?.map((module, index) => (
            <div key={index} className="glass-card rounded-xl p-6">
              <button
                onClick={() => toggleModule(index)}
                className="w-full flex items-center justify-between text-left"
              >
                <div>
                  <h3 className="text-xl font-semibold text-gray-200">
                    Module {index + 1}: {module.title}
                  </h3>
                  <p className="text-gray-400 mt-1">{module.description}</p>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transform transition-transform ${
                    expandedModules[index] ? "rotate-180" : ""
                  }`}
                />
              </button>

              {expandedModules[index] && (
                <div className="mt-6 space-y-6 animate-fadeIn">
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center text-gray-300">
                      <Clock className="w-5 h-5 mr-2" />
                      <span>{module.duration} heures</span>
                    </div>
                    {module.skills && (
                      <div className="flex items-center space-x-2">
                        {module.skills.map((skill, skillIndex) => (
                          <span
                            key={skillIndex}
                            className="px-3 py-1 bg-gray-800/50 rounded-full text-sm text-gray-300"
                          >
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-gray-300">
                      Ressources
                    </h4>
                    <div className="grid gap-4">
                      {module.resources?.map((resource, resourceIndex) => {
                        const typeConfig =
                          resourceTypeConfig[resource.type as ResourceType];
                        const Icon = typeConfig.icon;
                        return (
                          <a
                            key={resourceIndex}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors group"
                          >
                            <div
                              className={`p-2 rounded-lg ${typeConfig.bg} mr-4 group-hover:scale-110 transition-transform`}
                            >
                              <Icon className={`w-5 h-5 ${typeConfig.color}`} />
                            </div>
                            <div className="flex-1">
                              <h5 className="text-gray-200 font-medium mb-1">
                                {resource.title}
                              </h5>
                              <p className="text-sm text-gray-400">
                                {resource.duration} minutes
                              </p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                          </a>
                        );
                      })}
                    </div>
                  </div>

                  {module.validationCriteria && (
                    <div className="space-y-4">
                      <h4 className="text-lg font-medium text-gray-300">
                        Critères de validation
                      </h4>
                      <ul className="space-y-2">
                        {module.validationCriteria.map(
                          (criteria, criteriaIndex) => (
                            <li
                              key={criteriaIndex}
                              className="flex items-center text-gray-400"
                            >
                              <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
                              {criteria}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {goal.careerOpportunities && goal.careerOpportunities.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-100 mb-6">
              Opportunités de carrière
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {goal.careerOpportunities.map((opportunity, index) => (
                <div key={index} className="glass-card rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <Building className="w-6 h-6 text-purple-400 mr-3" />
                    <h3 className="text-xl font-semibold text-gray-200">
                      {opportunity.title}
                    </h3>
                  </div>
                  <p className="text-gray-400 mb-4">
                    {opportunity.description}
                  </p>
                  <div className="flex items-center text-gray-300 mb-4">
                    <DollarSign className="w-5 h-5 mr-2 text-green-400" />
                    <span>{opportunity.averageSalary}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {opportunity.companies.map((company, companyIndex) => (
                      <span
                        key={companyIndex}
                        className="px-3 py-1 bg-gray-800/50 rounded-full text-sm text-gray-300"
                      >
                        {company}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {showSuccessModal && <SuccessModal />}
    </div>
  );
}

export default GoalDetailPage;
