import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../config/api";
import {
  BarChart,
  LineChart,
  PieChart,
  Download,
  Calendar,
  Clock,
  Award,
  Brain,
  Loader2,
  AlertCircle,
} from "lucide-react";

function AnalyticsPage() {
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user) return;

      try {
        const endpoint = isAdmin
          ? `${api.analytics}/admin`
          : `${api.analytics}/user`;

        const response = await fetch(endpoint, {
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Erreur lors du chargement des données analytiques");
        }

        const data = await response.json();
        setAnalyticsData(data);
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

    fetchAnalytics();
  }, [user, isAdmin]);

  const handleExportData = async (format: "csv" | "excel") => {
    if (!user) return;

    setExportLoading(true);

    try {
      const response = await fetch(`${api.analytics}/export?format=${format}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Erreur lors de l'export en format ${format.toUpperCase()}`
        );
      }

      // Create a download link for the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `learning_analytics_${
        new Date().toISOString().split("T")[0]
      }.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error:", error);
      setError(
        error instanceof Error
          ? error.message
          : `Erreur lors de l'export en ${format.toUpperCase()}`
      );
    } finally {
      setExportLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="flex items-center space-x-2 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Chargement des données analytiques...</span>
        </div>
      </div>
    );
  }

  if (error || !analyticsData) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="text-center text-gray-400">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" />
          <p className="mb-4">
            {error || "Données analytiques non disponibles"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-100">
            Tableau de Bord Analytique
          </h1>

          <div className="flex space-x-4">
            <button
              onClick={() => handleExportData("csv")}
              disabled={exportLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
            >
              {exportLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Exporter CSV
            </button>

            <button
              onClick={() => handleExportData("excel")}
              disabled={exportLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
            >
              {exportLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Exporter Excel
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold text-gray-100">
                {analyticsData.totalLearningTime}h
              </span>
            </div>
            <p className="text-gray-400">Temps d'apprentissage total</p>
          </div>

          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <Award className="w-8 h-8 text-green-400" />
              <span className="text-2xl font-bold text-gray-100">
                {analyticsData.completionRate}%
              </span>
            </div>
            <p className="text-gray-400">Taux de complétion</p>
          </div>

          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <Brain className="w-8 h-8 text-purple-400" />
              <span className="text-2xl font-bold text-gray-100">
                {analyticsData.averageScore}%
              </span>
            </div>
            <p className="text-gray-400">Score moyen aux évaluations</p>
          </div>

          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="w-8 h-8 text-yellow-400" />
              <span className="text-2xl font-bold text-gray-100">
                {analyticsData.activeDays} jours
              </span>
            </div>
            <p className="text-gray-400">Jours d'activité</p>
          </div>
        </div>

        {/* Learning Progress Chart */}
        <div className="glass-card p-6 rounded-xl mb-8">
          <div className="flex items-center mb-6">
            <LineChart className="w-6 h-6 text-blue-400 mr-3" />
            <h2 className="text-xl font-bold text-gray-100">
              Progression d'Apprentissage
            </h2>
          </div>

          <div className="h-80 bg-gray-800/50 rounded-lg flex items-center justify-center">
            <p className="text-gray-400">
              Graphique de progression d'apprentissage
            </p>
            {/* Ici, vous intégreriez une bibliothèque de graphiques comme Chart.js ou Recharts */}
          </div>
        </div>

        {/* Concept Mastery and Time Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center mb-6">
              <BarChart className="w-6 h-6 text-green-400 mr-3" />
              <h2 className="text-xl font-bold text-gray-100">
                Maîtrise des Concepts
              </h2>
            </div>

            <div className="h-64 bg-gray-800/50 rounded-lg flex items-center justify-center">
              <p className="text-gray-400">
                Graphique de maîtrise des concepts
              </p>
              {/* Ici, vous intégreriez une bibliothèque de graphiques */}
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center mb-6">
              <PieChart className="w-6 h-6 text-purple-400 mr-3" />
              <h2 className="text-xl font-bold text-gray-100">
                Distribution du Temps
              </h2>
            </div>

            <div className="h-64 bg-gray-800/50 rounded-lg flex items-center justify-center">
              <p className="text-gray-400">
                Graphique de distribution du temps
              </p>
              {/* Ici, vous intégreriez une bibliothèque de graphiques */}
            </div>
          </div>
        </div>

        {/* Learning Recommendations */}
        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center mb-6">
            <Brain className="w-6 h-6 text-yellow-400 mr-3" />
            <h2 className="text-xl font-bold text-gray-100">
              Recommandations d'Apprentissage
            </h2>
          </div>

          <div className="space-y-4">
            {analyticsData.recommendations.map(
              (recommendation: any, index: number) => (
                <div
                  key={index}
                  className="p-4 rounded-lg bg-gray-800/50 border-l-4 border-yellow-500"
                >
                  <p className="text-gray-200 font-medium mb-2">
                    {recommendation.title}
                  </p>
                  <p className="text-gray-400">{recommendation.description}</p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsPage;
