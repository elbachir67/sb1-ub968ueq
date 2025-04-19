import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../config/api";
import { Question } from "../types";
import {
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Loader2,
  Brain,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import QuizComponent from "../components/QuizComponent";

function ConceptAssessmentPage() {
  const { conceptId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [concept, setConcept] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchConceptAndQuestions = async () => {
      if (!conceptId || !user) return;

      try {
        // Fetch concept details
        const conceptResponse = await fetch(`${api.concepts}/${conceptId}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
        });

        if (!conceptResponse.ok) {
          throw new Error("Erreur lors du chargement du concept");
        }

        const conceptData = await conceptResponse.json();
        setConcept(conceptData);

        // Fetch assessment questions for this concept
        const questionsResponse = await fetch(
          `${api.concepts}/${conceptId}/assessment`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!questionsResponse.ok) {
          throw new Error("Erreur lors du chargement des questions");
        }

        const questionsData = await questionsResponse.json();
        setQuestions(questionsData.questions);
        setLoading(false);
      } catch (error) {
        console.error("Error:", error);
        toast.error("Erreur lors du chargement de l'évaluation");
        navigate("/dashboard");
      }
    };

    fetchConceptAndQuestions();
  }, [conceptId, user, navigate]);

  const handleQuizComplete = async (score: number, responses: any[]) => {
    if (!conceptId || !user || submitting) return;

    setSubmitting(true);

    try {
      const response = await fetch(
        `${api.concepts}/${conceptId}/assessment/submit`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            score,
            responses,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la soumission de l'évaluation");
      }

      const data = await response.json();

      toast.success("Évaluation complétée avec succès !");

      // Navigate to the concept assessment results page
      navigate(`/concepts/${conceptId}/assessment/results`, {
        state: {
          result: {
            score,
            responses,
            recommendations: data.recommendations,
            adaptations: data.adaptations,
          },
        },
      });
    } catch (error) {
      console.error("Error:", error);
      toast.error("Erreur lors de la soumission de l'évaluation");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="flex items-center space-x-2 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Chargement de l'évaluation...</span>
        </div>
      </div>
    );
  }

  if (!concept || questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="text-center text-gray-400">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" />
          <p className="mb-4">Aucune évaluation disponible pour ce concept</p>
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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card rounded-xl p-6 mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 rounded-lg bg-purple-500/20">
              <Brain className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-100">
                {concept.name}
              </h1>
              <p className="text-gray-400">{concept.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                concept.level === "basic"
                  ? "bg-green-500/20 text-green-400"
                  : concept.level === "intermediate"
                  ? "bg-blue-500/20 text-blue-400"
                  : "bg-purple-500/20 text-purple-400"
              }`}
            >
              {concept.level === "basic"
                ? "Débutant"
                : concept.level === "intermediate"
                ? "Intermédiaire"
                : "Avancé"}
            </span>
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-700 text-gray-300">
              {concept.category}
            </span>
          </div>
        </div>

        <div className="glass-card rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-100 mb-4">
            Évaluation du concept
          </h2>
          <p className="text-gray-400 mb-6">
            Cette évaluation vous permettra de mesurer votre compréhension du
            concept et d'adapter votre parcours d'apprentissage en conséquence.
          </p>
          <QuizComponent
            questions={questions}
            onComplete={handleQuizComplete}
          />
        </div>
      </div>
    </div>
  );
}

export default ConceptAssessmentPage;
