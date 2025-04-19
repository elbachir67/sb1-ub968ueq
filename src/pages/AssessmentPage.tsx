import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../config/api";
import { Question, Message, UserProfile } from "../types";
import { toast } from "react-hot-toast";
import ChatInterface from "../components/ChatInterface";
import QuizComponent from "../components/QuizComponent";
import {
  calculateDetailedScore,
  generateRecommendations,
} from "../utils/scoringSystem";

function AssessmentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, checkAssessmentStatus } = useAuth();
  const [currentStep, setCurrentStep] = useState<
    "intro" | "math" | "programming" | "domain" | "quiz" | "results"
  >("intro");
  const [messages, setMessages] = useState<Message[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    mathLevel: "intermediate",
    programmingLevel: "intermediate",
    domain: "ml",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur doit être connecté
    const returnPath = location.state?.returnPath;
    if (returnPath && !isAuthenticated) {
      localStorage.setItem("redirectAfterLogin", returnPath);
      navigate("/login", { replace: true });
      return;
    }

    // Ajouter le message initial
    const initialMessage =
      location.state?.message ||
      "Bonjour ! Je suis votre assistant d'évaluation. Je vais vous aider à déterminer votre niveau actuel et vous recommander un parcours d'apprentissage personnalisé.";

    setMessages([
      {
        id: Date.now().toString(),
        type: "bot",
        content: initialMessage,
        options: ["Commencer l'évaluation"],
      },
    ]);
  }, [isAuthenticated, navigate, location.state]);

  const addBotMessage = (content: string, options?: string[]) => {
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        type: "bot",
        content,
        options,
      },
    ]);
  };

  const addUserMessage = (content: string) => {
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        type: "user",
        content,
      },
    ]);
  };

  const handleUserInput = async (message: string) => {
    addUserMessage(message);
    handleStepTransition(message);
  };

  const handleOptionSelect = async (option: string) => {
    addUserMessage(option);
    handleStepTransition(option);
  };

  const handleStepTransition = async (input: string) => {
    switch (currentStep) {
      case "intro":
        if (input.toLowerCase().includes("commencer")) {
          setCurrentStep("math");
          setTimeout(() => {
            addBotMessage(
              "Pour commencer, j'aimerais en savoir plus sur votre niveau en mathématiques. Quel est votre niveau ?",
              ["Débutant", "Intermédiaire", "Avancé"]
            );
          }, 1000);
        }
        break;

      case "math":
        const mathLevel = input.toLowerCase().includes("débutant")
          ? "beginner"
          : input.toLowerCase().includes("avancé")
          ? "advanced"
          : "intermediate";
        setUserProfile(prev => ({ ...prev, mathLevel }));
        setCurrentStep("programming");
        setTimeout(() => {
          addBotMessage("Et quel est votre niveau en programmation ?", [
            "Débutant",
            "Intermédiaire",
            "Avancé",
          ]);
        }, 1000);
        break;

      case "programming":
        const progLevel = input.toLowerCase().includes("débutant")
          ? "beginner"
          : input.toLowerCase().includes("avancé")
          ? "advanced"
          : "intermediate";
        setUserProfile(prev => ({ ...prev, programmingLevel: progLevel }));
        setCurrentStep("domain");
        setTimeout(() => {
          addBotMessage("Quel domaine de l'IA vous intéresse le plus ?", [
            "Machine Learning",
            "Deep Learning",
            "Computer Vision",
            "NLP",
            "MLOps",
          ]);
        }, 1000);
        break;

      case "domain":
        const domainMap: { [key: string]: string } = {
          "Machine Learning": "ml",
          "Deep Learning": "dl",
          "Computer Vision": "computer_vision",
          NLP: "nlp",
          MLOps: "mlops",
        };

        const selectedDomain =
          Object.entries(domainMap).find(([key]) => input.includes(key))?.[1] ||
          "ml";

        setUserProfile(prev => ({ ...prev, domain: selectedDomain }));
        await loadQuestions(selectedDomain);
        break;

      default:
        break;
    }
  };

  const loadQuestions = async (domain: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${api.assessments}/questions?domain=${domain}`,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des questions");
      }

      const data = await response.json();
      setQuestions(data);
      setCurrentStep("quiz");
      addBotMessage(
        "Super ! Je vais maintenant vous poser quelques questions pour évaluer vos connaissances. Prenez votre temps pour répondre."
      );
    } catch (error) {
      console.error("Error:", error);
      toast.error("Erreur lors du chargement des questions");
    } finally {
      setLoading(false);
    }
  };

  const handleQuizComplete = async (score: number, responses: any[]) => {
    setCurrentStep("results");

    const categoryScores = calculateDetailedScore(questions, responses);
    const recommendations = generateRecommendations(
      categoryScores,
      userProfile
    );

    if (isAuthenticated && user) {
      try {
        // Sauvegarder les résultats de l'évaluation
        const assessmentResponse = await fetch(`${api.assessments}/submit`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            category: userProfile.domain,
            score,
            responses,
            recommendations,
          }),
        });

        if (!assessmentResponse.ok) {
          throw new Error("Erreur lors de la sauvegarde des résultats");
        }

        // Mettre à jour le profil utilisateur
        const profileResponse = await fetch(`${api.profiles}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            learningStyle: "visual",
            preferences: {
              mathLevel: userProfile.mathLevel,
              programmingLevel: userProfile.programmingLevel,
              preferredDomain: userProfile.domain,
            },
          }),
        });

        if (!profileResponse.ok) {
          throw new Error("Erreur lors de la mise à jour du profil");
        }

        // Mettre à jour le statut de l'évaluation
        await checkAssessmentStatus();

        // Afficher les résultats et les recommandations
        addBotMessage(
          "Voici les résultats de votre évaluation :\n\n" +
            recommendations
              .map(
                rec =>
                  `${rec.category}: ${rec.score}% - Niveau ${
                    rec.level
                  }\n${rec.recommendations.join("\n")}`
              )
              .join("\n\n") +
            "\n\nJe vous recommande de commencer par explorer les objectifs adaptés à votre profil.",
          ["Explorer les objectifs recommandés", "Revenir à l'accueil"]
        );
      } catch (error) {
        console.error("Error saving assessment results:", error);
        toast.error("Erreur lors de la sauvegarde des résultats");
      }
    } else {
      // Pour les utilisateurs non connectés
      addBotMessage(
        "Pour accéder à des recommandations personnalisées et suivre votre progression, vous devez vous connecter.",
        ["Se connecter", "Revenir à l'accueil"]
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-100">
            Évaluation Personnalisée
          </h1>
          <p className="mt-2 text-gray-400">
            Découvrez votre niveau et obtenez des recommandations sur mesure
          </p>
        </div>

        <div className="relative">
          {currentStep === "quiz" ? (
            <QuizComponent
              questions={questions}
              onComplete={handleQuizComplete}
            />
          ) : (
            <ChatInterface
              messages={messages}
              onSend={handleUserInput}
              onOptionSelect={handleOptionSelect}
              isTyping={loading}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default AssessmentPage;
