import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../config/api";
import { Loader2 } from "lucide-react";

function EditGoalPage() {
  const { goalId } = useParams();
  const navigate = useNavigate();
  const { isAdmin, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "ml",
    estimatedDuration: "",
    difficulty: "beginner",
    careerOpportunities: [""],
  });

  useEffect(() => {
    if (!isAdmin) {
      navigate("/login");
      return;
    }

    const fetchGoal = async () => {
      try {
        const response = await fetch(`${api.goals}/${goalId}`, {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Erreur lors du chargement de l'objectif");
        }

        const data = await response.json();
        setFormData({
          title: data.title,
          description: data.description,
          category: data.category,
          estimatedDuration: data.estimatedDuration.toString(),
          difficulty: data.difficulty,
          careerOpportunities:
            data.careerOpportunities.length > 0
              ? data.careerOpportunities
              : [""],
        });
      } catch (error) {
        toast.error("Erreur lors du chargement de l'objectif");
        navigate("/goals");
      } finally {
        setLoading(false);
      }
    };

    fetchGoal();
  }, [isAdmin, navigate, goalId, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`${api.goals}/${goalId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour de l'objectif");
      }

      toast.success("Objectif mis à jour avec succès");
      navigate("/goals");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour de l'objectif");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCareerOpportunityChange = (index: number, value: string) => {
    setFormData(prev => {
      const newOpportunities = [...prev.careerOpportunities];
      newOpportunities[index] = value;
      return {
        ...prev,
        careerOpportunities: newOpportunities,
      };
    });
  };

  const addCareerOpportunity = () => {
    setFormData(prev => ({
      ...prev,
      careerOpportunities: [...prev.careerOpportunities, ""],
    }));
  };

  const removeCareerOpportunity = (index: number) => {
    setFormData(prev => ({
      ...prev,
      careerOpportunities: prev.careerOpportunities.filter(
        (_, i) => i !== index
      ),
    }));
  };

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

  return (
    <div className="min-h-screen bg-[#0A0A0F] py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card p-8 rounded-xl">
          <h1 className="text-3xl font-bold text-gray-100 mb-8">
            Modifier l'Objectif
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-300"
              >
                Titre
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 text-gray-100 px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-300"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 text-gray-100 px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-300"
              >
                Catégorie
              </label>
              <select
                id="category"
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 text-gray-100 px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="ml">Machine Learning</option>
                <option value="dl">Deep Learning</option>
                <option value="data_science">Data Science</option>
                <option value="mlops">MLOps</option>
                <option value="computer_vision">Computer Vision</option>
                <option value="nlp">NLP</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="estimatedDuration"
                className="block text-sm font-medium text-gray-300"
              >
                Durée estimée (en semaines)
              </label>
              <input
                type="number"
                id="estimatedDuration"
                name="estimatedDuration"
                required
                min="1"
                value={formData.estimatedDuration}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 text-gray-100 px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="difficulty"
                className="block text-sm font-medium text-gray-300"
              >
                Niveau de difficulté
              </label>
              <select
                id="difficulty"
                name="difficulty"
                required
                value={formData.difficulty}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 text-gray-100 px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="beginner">Débutant</option>
                <option value="intermediate">Intermédiaire</option>
                <option value="advanced">Avancé</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Opportunités de carrière
              </label>
              <div className="space-y-2">
                {formData.careerOpportunities.map((opportunity, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={opportunity}
                      onChange={e =>
                        handleCareerOpportunityChange(index, e.target.value)
                      }
                      className="flex-1 rounded-lg border border-gray-700 bg-gray-800 text-gray-100 px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Ex: Data Scientist"
                    />
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeCareerOpportunity(index)}
                        className="px-3 py-2 text-red-500 hover:text-red-400"
                      >
                        Supprimer
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addCareerOpportunity}
                  className="text-blue-500 hover:text-blue-400 text-sm"
                >
                  + Ajouter une opportunité
                </button>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={() => navigate("/goals")}
                className="px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{saving ? "Enregistrement..." : "Enregistrer"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditGoalPage;
