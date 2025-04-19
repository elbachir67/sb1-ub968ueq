import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../config/api";

function AddGoalPage() {
  const navigate = useNavigate();
  const { isAdmin, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "ml",
    estimatedDuration: "",
    difficulty: "beginner",
    careerOpportunities: [""],
  });

  React.useEffect(() => {
    if (!isAdmin) {
      navigate("/login");
    }
  }, [isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${api.goals}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la création de l'objectif");
      }

      toast.success("Objectif créé avec succès");
      navigate("/goals");
    } catch (error) {
      toast.error("Erreur lors de la création de l'objectif");
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-[#0A0A0F] py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card p-8 rounded-xl">
          <h1 className="text-3xl font-bold text-gray-100 mb-8">
            Créer un Nouvel Objectif
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
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Création..." : "Créer l'objectif"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddGoalPage;
