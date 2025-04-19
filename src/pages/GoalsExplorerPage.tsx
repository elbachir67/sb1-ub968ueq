import React, { useState, useEffect } from "react";
import { Search, Filter, Lock, AlertCircle, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import GoalCard from "../components/GoalCard";
import { Goal, GoalCategory, GoalDifficulty } from "../types";
import { api } from "../config/api";
import { toast } from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import {
  filterGoalsByUserProfile,
  filterGoalsBySearch,
} from "../utils/goalFilters";

function GoalsExplorerPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, hasCompletedAssessment } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    GoalCategory | "all"
  >("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    GoalDifficulty | "all"
  >("all");
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem("redirectAfterLogin", "/goals");
      navigate("/login");
      return;
    }

    if (!hasCompletedAssessment) {
      navigate("/assessment", {
        state: {
          returnPath: "/goals",
          message:
            "Pour accéder aux objectifs personnalisés, une courte évaluation est nécessaire.",
        },
      });
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Récupérer le profil utilisateur
        const profileResponse = await fetch(api.profiles, {
          headers: {
            Authorization: `Bearer ${user?.token}`,
            "Content-Type": "application/json",
          },
        });

        if (!profileResponse.ok) {
          throw new Error("Erreur lors du chargement du profil");
        }

        const profileData = await profileResponse.json();
        setUserProfile(profileData);

        // Récupérer les objectifs avec les paramètres du profil
        const goalsResponse = await fetch(
          `${api.goals}?${new URLSearchParams({
            mathLevel: profileData.preferences.mathLevel,
            programmingLevel: profileData.preferences.programmingLevel,
            preferredDomain: profileData.preferences.preferredDomain,
          })}`,
          {
            headers: {
              Authorization: `Bearer ${user?.token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!goalsResponse.ok) {
          throw new Error("Erreur lors du chargement des objectifs");
        }

        const goalsData = await goalsResponse.json();

        // Filtrer et marquer les objectifs recommandés
        const { recommended, others } = filterGoalsByUserProfile(
          goalsData,
          profileData
        );
        setGoals([...recommended, ...others]);
      } catch (error) {
        console.error("Erreur:", error);
        setError(
          error instanceof Error ? error.message : "Erreur lors du chargement"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, user, hasCompletedAssessment, navigate]);

  // Filtrer les objectifs selon la recherche et les filtres
  const filteredGoals = filterGoalsBySearch(
    goals,
    searchQuery,
    selectedCategory === "all" ? undefined : selectedCategory,
    selectedDifficulty === "all" ? undefined : selectedDifficulty
  );

  // Séparer les objectifs recommandés des autres
  const recommendedGoals = filteredGoals.filter(goal => goal.isRecommended);
  const otherGoals = filteredGoals.filter(goal => !goal.isRecommended);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="text-gray-400">Chargement des objectifs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="text-center text-gray-400">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-100">
            Objectifs d'Apprentissage
          </h1>
          <div className="flex items-center space-x-4">
            {/* Barre de recherche */}
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher un objectif..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-64 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <Search className="absolute right-3 top-2.5 text-gray-400 w-5 h-5" />
            </div>

            {/* Filtres */}
            <div className="flex items-center space-x-2">
              <select
                value={selectedCategory}
                onChange={e =>
                  setSelectedCategory(e.target.value as GoalCategory | "all")
                }
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Toutes les catégories</option>
                <option value="ml">Machine Learning</option>
                <option value="dl">Deep Learning</option>
                <option value="data_science">Data Science</option>
                <option value="mlops">MLOps</option>
                <option value="computer_vision">Computer Vision</option>
                <option value="nlp">NLP</option>
              </select>

              <select
                value={selectedDifficulty}
                onChange={e =>
                  setSelectedDifficulty(
                    e.target.value as GoalDifficulty | "all"
                  )
                }
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Tous les niveaux</option>
                <option value="beginner">Débutant</option>
                <option value="intermediate">Intermédiaire</option>
                <option value="advanced">Avancé</option>
              </select>
            </div>
          </div>
        </div>

        {/* Objectifs recommandés */}
        {recommendedGoals.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-gray-100 mb-6 flex items-center">
              <Sparkles className="w-5 h-5 text-yellow-400 mr-2" />
              Recommandés pour vous
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedGoals.map(goal => (
                <GoalCard key={goal._id} goal={goal} isRecommended={true} />
              ))}
            </div>
          </div>
        )}

        {/* Autres objectifs */}
        <div>
          <h2 className="text-xl font-semibold text-gray-100 mb-6">
            Tous les objectifs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherGoals.map(goal => (
              <GoalCard key={goal._id} goal={goal} />
            ))}
          </div>
        </div>

        {/* Message si aucun résultat */}
        {filteredGoals.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">
              Aucun objectif ne correspond à vos critères de recherche.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default GoalsExplorerPage;
