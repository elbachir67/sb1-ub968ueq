import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../config/api";
import {
  Settings,
  Save,
  RefreshCw,
  Brain,
  Target,
  Clock,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface SystemConfig {
  adaptationThresholds: {
    performance: number;
    engagement: number;
    retention: number;
  };
  progressionRules: {
    minScoreToProgress: number;
    maxAttemptsBeforeAdapt: number;
    adaptationCooldown: number;
  };
  cognitiveModel: {
    baselineLoad: number;
    maxLoadPerSession: number;
    recoveryRate: number;
  };
  recommendationWeights: {
    performance: number;
    preference: number;
    difficulty: number;
  };
}

function AdminSystemConfigPage() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) {
      navigate("/login");
      return;
    }

    fetchConfig();
  }, [isAdmin, navigate]);

  const fetchConfig = async () => {
    try {
      const response = await fetch(`${api.analytics}/admin/system-config`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      if (!response.ok)
        throw new Error("Erreur lors du chargement de la configuration");

      const data = await response.json();
      setConfig(data);
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

  const handleSave = async () => {
    if (!config) return;

    setSaving(true);
    try {
      const response = await fetch(`${api.analytics}/admin/system-config`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${user?.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) throw new Error("Erreur lors de la sauvegarde");

      setError(null);
    } catch (error) {
      console.error("Error:", error);
      setError(
        error instanceof Error ? error.message : "Erreur lors de la sauvegarde"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (
      window.confirm("Réinitialiser la configuration aux valeurs par défaut ?")
    ) {
      fetchConfig();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="flex items-center space-x-2 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Chargement de la configuration...</span>
        </div>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="text-center text-gray-400">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" />
          <p className="mb-4">{error || "Configuration non disponible"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-100">
            Configuration du Système
          </h1>
          <div className="flex space-x-4">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Réinitialiser
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center disabled:opacity-50"
            >
              <Save className="w-5 h-5 mr-2" />
              {saving ? "Sauvegarde..." : "Sauvegarder"}
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {/* Seuils d'Adaptation */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center mb-6">
              <Brain className="w-6 h-6 text-blue-400 mr-3" />
              <h2 className="text-xl font-bold text-gray-100">
                Seuils d'Adaptation
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Performance (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={config.adaptationThresholds.performance}
                  onChange={e =>
                    setConfig({
                      ...config,
                      adaptationThresholds: {
                        ...config.adaptationThresholds,
                        performance: parseInt(e.target.value),
                      },
                    })
                  }
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Engagement (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={config.adaptationThresholds.engagement}
                  onChange={e =>
                    setConfig({
                      ...config,
                      adaptationThresholds: {
                        ...config.adaptationThresholds,
                        engagement: parseInt(e.target.value),
                      },
                    })
                  }
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Rétention (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={config.adaptationThresholds.retention}
                  onChange={e =>
                    setConfig({
                      ...config,
                      adaptationThresholds: {
                        ...config.adaptationThresholds,
                        retention: parseInt(e.target.value),
                      },
                    })
                  }
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300"
                />
              </div>
            </div>
          </div>

          {/* Règles de Progression */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center mb-6">
              <Target className="w-6 h-6 text-green-400 mr-3" />
              <h2 className="text-xl font-bold text-gray-100">
                Règles de Progression
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Score minimum (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={config.progressionRules.minScoreToProgress}
                  onChange={e =>
                    setConfig({
                      ...config,
                      progressionRules: {
                        ...config.progressionRules,
                        minScoreToProgress: parseInt(e.target.value),
                      },
                    })
                  }
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Tentatives max.
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={config.progressionRules.maxAttemptsBeforeAdapt}
                  onChange={e =>
                    setConfig({
                      ...config,
                      progressionRules: {
                        ...config.progressionRules,
                        maxAttemptsBeforeAdapt: parseInt(e.target.value),
                      },
                    })
                  }
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Délai d'adaptation (h)
                </label>
                <input
                  type="number"
                  min="1"
                  max="72"
                  value={config.progressionRules.adaptationCooldown}
                  onChange={e =>
                    setConfig({
                      ...config,
                      progressionRules: {
                        ...config.progressionRules,
                        adaptationCooldown: parseInt(e.target.value),
                      },
                    })
                  }
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300"
                />
              </div>
            </div>
          </div>

          {/* Modèle Cognitif */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center mb-6">
              <Brain className="w-6 h-6 text-purple-400 mr-3" />
              <h2 className="text-xl font-bold text-gray-100">
                Modèle Cognitif
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Charge de base
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={config.cognitiveModel.baselineLoad}
                  onChange={e =>
                    setConfig({
                      ...config,
                      cognitiveModel: {
                        ...config.cognitiveModel,
                        baselineLoad: parseInt(e.target.value),
                      },
                    })
                  }
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Charge max/session
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={config.cognitiveModel.maxLoadPerSession}
                  onChange={e =>
                    setConfig({
                      ...config,
                      cognitiveModel: {
                        ...config.cognitiveModel,
                        maxLoadPerSession: parseInt(e.target.value),
                      },
                    })
                  }
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Taux de récupération
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={config.cognitiveModel.recoveryRate}
                  onChange={e =>
                    setConfig({
                      ...config,
                      cognitiveModel: {
                        ...config.cognitiveModel,
                        recoveryRate: parseInt(e.target.value),
                      },
                    })
                  }
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300"
                />
              </div>
            </div>
          </div>

          {/* Poids des Recommandations */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center mb-6">
              <Settings className="w-6 h-6 text-yellow-400 mr-3" />
              <h2 className="text-xl font-bold text-gray-100">
                Poids des Recommandations
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Performance
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={config.recommendationWeights.performance}
                  onChange={e =>
                    setConfig({
                      ...config,
                      recommendationWeights: {
                        ...config.recommendationWeights,
                        performance: parseInt(e.target.value),
                      },
                    })
                  }
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Préférence
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={config.recommendationWeights.preference}
                  onChange={e =>
                    setConfig({
                      ...config,
                      recommendationWeights: {
                        ...config.recommendationWeights,
                        preference: parseInt(e.target.value),
                      },
                    })
                  }
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Difficulté
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={config.recommendationWeights.difficulty}
                  onChange={e =>
                    setConfig({
                      ...config,
                      recommendationWeights: {
                        ...config.recommendationWeights,
                        difficulty: parseInt(e.target.value),
                      },
                    })
                  }
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminSystemConfigPage;
