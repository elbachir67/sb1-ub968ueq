import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../config/api";
import {
  Plus,
  Edit,
  Trash2,
  BookOpen,
  Video,
  Code,
  Lock,
  Unlock,
  Settings,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface Resource {
  id: string;
  title: string;
  type: string;
  url: string;
  difficulty: string;
  cognitiveLoad: number;
  isPremium: boolean;
  prerequisites: string[];
}

function AdminResourceManagementPage() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      navigate("/login");
      return;
    }

    fetchResources();
  }, [isAdmin, navigate]);

  const fetchResources = async () => {
    try {
      const response = await fetch(`${api.resources}/admin`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      if (!response.ok)
        throw new Error("Erreur lors du chargement des ressources");

      const data = await response.json();
      setResources(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResourceUpdate = async (resource: Resource) => {
    try {
      const response = await fetch(`${api.resources}/${resource.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${user?.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(resource),
      });

      if (!response.ok) throw new Error("Erreur lors de la mise à jour");

      fetchResources();
      setEditingResource(null);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleResourceDelete = async (id: string) => {
    if (
      !window.confirm("Êtes-vous sûr de vouloir supprimer cette ressource ?")
    ) {
      return;
    }

    try {
      const response = await fetch(`${api.resources}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      if (!response.ok) throw new Error("Erreur lors de la suppression");

      fetchResources();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const togglePremiumStatus = async (resource: Resource) => {
    try {
      const response = await fetch(`${api.resources}/${resource.id}/premium`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${user?.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isPremium: !resource.isPremium }),
      });

      if (!response.ok)
        throw new Error("Erreur lors de la mise à jour du statut premium");

      fetchResources();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleCognitiveLoadUpdate = async (
    resource: Resource,
    newLoad: number
  ) => {
    try {
      const response = await fetch(
        `${api.resources}/${resource.id}/cognitive-load`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${user?.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ cognitiveLoad: newLoad }),
        }
      );

      if (!response.ok)
        throw new Error("Erreur lors de la mise à jour de la charge cognitive");

      fetchResources();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="flex items-center space-x-2 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Chargement des ressources...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-100">
            Gestion des Ressources
          </h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Ajouter une ressource
          </button>
        </div>

        <div className="grid gap-6">
          {resources.map(resource => (
            <div key={resource.id} className="glass-card p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {resource.type === "video" ? (
                    <Video className="w-6 h-6 text-blue-400" />
                  ) : resource.type === "code" ? (
                    <Code className="w-6 h-6 text-green-400" />
                  ) : (
                    <BookOpen className="w-6 h-6 text-purple-400" />
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-200">
                      {resource.title}
                    </h3>
                    <p className="text-sm text-gray-400">{resource.url}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => togglePremiumStatus(resource)}
                    className={`p-2 rounded-lg ${
                      resource.isPremium
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-gray-700 text-gray-400"
                    }`}
                  >
                    {resource.isPremium ? (
                      <Lock className="w-5 h-5" />
                    ) : (
                      <Unlock className="w-5 h-5" />
                    )}
                  </button>

                  <button
                    onClick={() => setEditingResource(resource)}
                    className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30"
                  >
                    <Edit className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => handleResourceDelete(resource.id)}
                    className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Difficulté
                  </label>
                  <select
                    value={resource.difficulty}
                    onChange={e =>
                      handleResourceUpdate({
                        ...resource,
                        difficulty: e.target.value,
                      })
                    }
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300"
                  >
                    <option value="basic">Débutant</option>
                    <option value="intermediate">Intermédiaire</option>
                    <option value="advanced">Avancé</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Charge Cognitive (1-10)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={resource.cognitiveLoad}
                    onChange={e =>
                      handleCognitiveLoadUpdate(
                        resource,
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Prérequis
                </label>
                <div className="flex flex-wrap gap-2">
                  {resource.prerequisites.map((prereq, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm"
                    >
                      {prereq}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminResourceManagementPage;
