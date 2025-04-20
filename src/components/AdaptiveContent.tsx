import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { contentGenerationService } from "../services/contentGenerationService";
import { toast } from "react-hot-toast";
import { Brain, Loader2, RefreshCw, BookOpen, Code, Award } from "lucide-react";

interface AdaptiveContentProps {
  topic: string;
  moduleId: string;
  userProfile: {
    learningStyle: string;
    preferences: {
      mathLevel: string;
      programmingLevel: string;
    };
  };
  previousPerformance: number;
}

const AdaptiveContent: React.FC<AdaptiveContentProps> = ({
  topic,
  moduleId,
  userProfile,
  previousPerformance,
}) => {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [contentType, setContentType] = useState<
    "explanation" | "exercise" | "summary"
  >("explanation");

  useEffect(() => {
    generateContent();
  }, [topic, contentType]);

  const generateContent = async () => {
    try {
      setGenerating(true);
      const response = await contentGenerationService.generateContent({
        topic,
        userLevel: determineUserLevel(),
        learningStyle: userProfile.learningStyle,
        previousPerformance,
        contentType,
      });

      setContent(response.content);
    } catch (error) {
      console.error("Error generating content:", error);
      toast.error("Erreur lors de la génération du contenu");
    } finally {
      setGenerating(false);
      setLoading(false);
    }
  };

  const determineUserLevel = () => {
    const levels = {
      mathLevel: userProfile.preferences.mathLevel,
      programmingLevel: userProfile.preferences.programmingLevel,
    };

    // Utiliser le niveau le plus bas pour s'assurer que le contenu est accessible
    return Object.values(levels).includes("beginner")
      ? "beginner"
      : Object.values(levels).includes("intermediate")
      ? "intermediate"
      : "advanced";
  };

  if (loading && !content) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sélecteur de type de contenu */}
      <div className="flex space-x-4">
        <button
          onClick={() => setContentType("explanation")}
          className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
            contentType === "explanation"
              ? "bg-purple-600 text-white"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700"
          }`}
        >
          <Brain className="w-4 h-4 mr-2" />
          Explication
        </button>
        <button
          onClick={() => setContentType("exercise")}
          className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
            contentType === "exercise"
              ? "bg-purple-600 text-white"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700"
          }`}
        >
          <Code className="w-4 h-4 mr-2" />
          Exercice
        </button>
        <button
          onClick={() => setContentType("summary")}
          className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
            contentType === "summary"
              ? "bg-purple-600 text-white"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700"
          }`}
        >
          <BookOpen className="w-4 h-4 mr-2" />
          Résumé
        </button>
      </div>

      {/* Contenu généré */}
      <div className="relative">
        <div
          className={`glass-card rounded-xl p-6 ${
            generating ? "opacity-50" : ""
          }`}
        >
          <div className="prose prose-invert max-w-none">
            {content && (
              <div
                dangerouslySetInnerHTML={{
                  __html: content.replace(/\n/g, "<br />"),
                }}
              />
            )}
          </div>
        </div>

        {/* Overlay de génération */}
        {generating && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 rounded-xl">
            <div className="flex items-center space-x-2 text-white">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Génération en cours...</span>
            </div>
          </div>
        )}
      </div>

      {/* Bouton de régénération */}
      <div className="flex justify-end">
        <button
          onClick={generateContent}
          disabled={generating}
          className="flex items-center px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Régénérer
        </button>
      </div>
    </div>
  );
};

export default AdaptiveContent;
