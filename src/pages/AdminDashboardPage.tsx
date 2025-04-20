import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../config/api";
import {
  Users,
  Brain,
  BarChart,
  Clock,
  Settings,
  Loader2,
  AlertCircle,
  BookOpen,
  Target,
  Zap,
} from "lucide-react";
import LearningProgressChart from "../components/LearningProgressChart";

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  averageProgress: number;
  resourceUtilization: {
    free: number;
    premium: number;
  };
  learningStyles: {
    [key: string]: number;
  };
  adaptationMetrics: {
    pathwaysGenerated: number;
    averageAdaptations: number;
    successRate: number;
  };
}

interface LearnerMetrics {
  userId: string;
  email: string;
  learningStyle: string;
  progress: number;
  cognitiveLoad: {
    contentPerStep: number;
    practiceFrequency: string;
    breakFrequency: number;
  };
  resourceUsage: {
    free: number;
    premium: number;
  };
  adaptationHistory: {
    date: string;
    type: string;
    reason: string;
    impact: number;
  }[];
}

function AdminDashboardPage() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [learnerMetrics, setLearnerMetrics] = useState<LearnerMetrics[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState<
    "week" | "month" | "all"
  >("week");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) {
      navigate("/login");
      return;
    }

    const fetchAdminData = async () => {
      try {
        const [statsResponse, metricsResponse] = await Promise.all([
          fetch(`${api.analytics}/admin/stats`, {
            headers: {
              Authorization: `Bearer ${user?.token}`,
              "Content-Type": "application/json",
            },
          }),
          fetch(`${api.analytics}/admin/learner-metrics`, {
            headers: {
              Authorization: `Bearer ${user?.token}`,
              "Content-Type": "application/json",
            },
          }),
        ]);

        if (!statsResponse.ok || !metricsResponse.ok) {
          throw new Error("Erreur lors du chargement des données");
        }

        const statsData = await statsResponse.json();
        const metricsData = await metricsResponse.json();

        setStats(statsData);
        setLearnerMetrics(metricsData);
        setError(null);
      } catch (error) {
        console.error("Error:", error);
        setError(
          error instanceof Error ? error.message : "Erreur lors du chargement"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [isAdmin, user, navigate, selectedTimeRange]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="flex items-center space-x-2 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Chargement des données administratives...</span>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="text-center text-gray-400">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" />
          <p className="mb-4">{error || "Données non disponibles"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-100">
            Tableau de Bord Administratif
          </h1>
          <div className="flex space-x-4">
            <select
              value={selectedTimeRange}
              onChange={e =>
                setSelectedTimeRange(e.target.value as "week" | "month" | "all")
              }
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="week">7 derniers jours</option>
              <option value="month">30 derniers jours</option>
              <option value="all">Toutes les données</option>
            </select>
          </div>
        </div>

        {/* Statistiques Globales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold text-gray-100">
                {stats.totalUsers}
              </span>
            </div>
            <p className="text-gray-400">Apprenants Total</p>
            <p className="text-sm text-gray-500 mt-1">
              {stats.activeUsers} actifs
            </p>
          </div>

          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <Target className="w-8 h-8 text-green-400" />
              <span className="text-2xl font-bold text-gray-100">
                {stats.averageProgress}%
              </span>
            </div>
            <p className="text-gray-400">Progression Moyenne</p>
          </div>

          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <BookOpen className="w-8 h-8 text-purple-400" />
              <span className="text-2xl font-bold text-gray-100">
                {stats.resourceUtilization.premium}%
              </span>
            </div>
            <p className="text-gray-400">Utilisation Premium</p>
            <p className="text-sm text-gray-500 mt-1">
              {stats.resourceUtilization.free}% ressources gratuites
            </p>
          </div>

          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <Zap className="w-8 h-8 text-yellow-400" />
              <span className="text-2xl font-bold text-gray-100">
                {stats.adaptationMetrics.successRate}%
              </span>
            </div>
            <p className="text-gray-400">Taux de Réussite</p>
            <p className="text-sm text-gray-500 mt-1">
              {stats.adaptationMetrics.pathwaysGenerated} parcours générés
            </p>
          </div>
        </div>

        {/* Graphiques d'Analyse */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center mb-6">
              <Brain className="w-6 h-6 text-blue-400 mr-3" />
              <h2 className="text-xl font-bold text-gray-100">
                Styles d'Apprentissage
              </h2>
            </div>
            <div className="h-64">
              {/* Graphique des styles d'apprentissage */}
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center mb-6">
              <Settings className="w-6 h-6 text-green-400 mr-3" />
              <h2 className="text-xl font-bold text-gray-100">
                Adaptations du Système
              </h2>
            </div>
            <div className="h-64">{/* Graphique des adaptations */}</div>
          </div>
        </div>

        {/* Métriques par Apprenant */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center mb-6">
            <BarChart className="w-6 h-6 text-purple-400 mr-3" />
            <h2 className="text-xl font-bold text-gray-100">
              Métriques par Apprenant
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-800">
                  <th className="pb-3">Apprenant</th>
                  <th className="pb-3">Style</th>
                  <th className="pb-3">Progression</th>
                  <th className="pb-3">Charge Cognitive</th>
                  <th className="pb-3">Ressources</th>
                  <th className="pb-3">Adaptations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {learnerMetrics.map(learner => (
                  <tr key={learner.userId} className="text-gray-300">
                    <td className="py-4">{learner.email}</td>
                    <td className="py-4">{learner.learningStyle}</td>
                    <td className="py-4">{learner.progress}%</td>
                    <td className="py-4">
                      {learner.cognitiveLoad.contentPerStep} unités/étape
                    </td>
                    <td className="py-4">
                      {learner.resourceUsage.premium} premium
                      <br />
                      {learner.resourceUsage.free} gratuit
                    </td>
                    <td className="py-4">
                      {learner.adaptationHistory.length} adaptations
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
