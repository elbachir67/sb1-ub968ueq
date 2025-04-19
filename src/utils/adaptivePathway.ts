import { Question, UserProfile } from "../types";

interface UserResponse {
  questionId: string;
  selectedOption: string;
  isCorrect: boolean;
  timeSpent: number;
  category: string;
  difficulty: string;
}

interface ConceptMastery {
  conceptId: string;
  conceptName: string;
  masteryLevel: number; // 0-100
  confidence: number; // 0-100
  lastAssessed: Date;
  weakPoints: string[];
  strongPoints: string[];
}

interface AdaptiveRecommendation {
  type: "resource" | "practice" | "review";
  description: string;
  priority: "high" | "medium" | "low";
  resourceId?: string;
  conceptId?: string;
  moduleId?: string;
}

interface PathwayAdaptation {
  title: string;
  description: string;
  type:
    | "add_resource"
    | "remove_resource"
    | "change_order"
    | "add_module"
    | "simplify";
  resourceId?: string;
  moduleId?: string;
}

/**
 * Analyzes assessment results and updates the concept mastery model
 */
export function updateConceptMastery(
  existingMastery: ConceptMastery | null,
  questions: Question[],
  responses: UserResponse[],
  conceptId: string,
  conceptName: string
): ConceptMastery {
  // Calculate overall score
  const correctAnswers = responses.filter(r => r.isCorrect).length;
  const totalQuestions = responses.length;
  const masteryLevel = Math.round((correctAnswers / totalQuestions) * 100);

  // Calculate confidence based on response times
  const avgTimePerQuestion =
    responses.reduce((sum, r) => sum + r.timeSpent, 0) / responses.length;
  const normalizedTime = Math.min(avgTimePerQuestion / 60, 1); // Normalize to 0-1 range (60 seconds as max)
  const confidence = Math.round((1 - normalizedTime) * 100);

  // Identify weak and strong points
  const weakPoints: string[] = [];
  const strongPoints: string[] = [];

  // Group responses by category/topic
  const topicResponses = responses.reduce((acc, response) => {
    const question = questions.find(q => q.id === response.questionId);
    if (question) {
      const topic = question.category;
      if (!acc[topic]) {
        acc[topic] = { correct: 0, total: 0 };
      }
      acc[topic].total += 1;
      if (response.isCorrect) {
        acc[topic].correct += 1;
      }
    }
    return acc;
  }, {} as Record<string, { correct: number; total: number }>);

  // Determine weak and strong points
  Object.entries(topicResponses).forEach(([topic, { correct, total }]) => {
    const score = (correct / total) * 100;
    if (score < 60) {
      weakPoints.push(topic);
    } else if (score > 80) {
      strongPoints.push(topic);
    }
  });

  // Merge with existing mastery data if available
  if (existingMastery) {
    return {
      conceptId,
      conceptName,
      masteryLevel: Math.round(
        existingMastery.masteryLevel * 0.3 + masteryLevel * 0.7
      ), // Weight new results more
      confidence: Math.round(
        existingMastery.confidence * 0.3 + confidence * 0.7
      ),
      lastAssessed: new Date(),
      weakPoints: [...new Set([...weakPoints, ...existingMastery.weakPoints])],
      strongPoints: [
        ...new Set([...strongPoints, ...existingMastery.strongPoints]),
      ],
    };
  }

  return {
    conceptId,
    conceptName,
    masteryLevel,
    confidence,
    lastAssessed: new Date(),
    weakPoints,
    strongPoints,
  };
}

/**
 * Generates adaptive recommendations based on concept mastery
 */
export function generateAdaptiveRecommendations(
  conceptMastery: ConceptMastery,
  userProfile: UserProfile
): AdaptiveRecommendation[] {
  const recommendations: AdaptiveRecommendation[] = [];

  // Recommendations based on mastery level
  if (conceptMastery.masteryLevel < 50) {
    recommendations.push({
      type: "review",
      description: `Réviser les concepts fondamentaux de ${conceptMastery.conceptName}`,
      priority: "high",
      conceptId: conceptMastery.conceptId,
    });

    recommendations.push({
      type: "resource",
      description: `Ressources supplémentaires pour ${conceptMastery.conceptName}`,
      priority: "high",
      conceptId: conceptMastery.conceptId,
    });
  } else if (conceptMastery.masteryLevel < 80) {
    recommendations.push({
      type: "practice",
      description: `Exercices pratiques pour renforcer ${conceptMastery.conceptName}`,
      priority: "medium",
      conceptId: conceptMastery.conceptId,
    });
  }

  // Recommendations based on weak points
  conceptMastery.weakPoints.forEach(weakPoint => {
    recommendations.push({
      type: "review",
      description: `Renforcer vos connaissances en ${weakPoint}`,
      priority: "high",
      conceptId: conceptMastery.conceptId,
    });
  });

  // Recommendations based on confidence
  if (conceptMastery.confidence < 60) {
    recommendations.push({
      type: "practice",
      description: `Exercices pour gagner en confiance sur ${conceptMastery.conceptName}`,
      priority: "medium",
      conceptId: conceptMastery.conceptId,
    });
  }

  return recommendations;
}

/**
 * Generates pathway adaptations based on concept mastery
 */
export function generatePathwayAdaptations(
  conceptMastery: ConceptMastery,
  userProfile: UserProfile
): PathwayAdaptation[] {
  const adaptations: PathwayAdaptation[] = [];

  // Adaptations based on mastery level
  if (conceptMastery.masteryLevel < 40) {
    adaptations.push({
      title: "Simplification du parcours",
      description: `Ajout de ressources plus accessibles pour ${conceptMastery.conceptName}`,
      type: "simplify",
    });

    adaptations.push({
      title: "Ressources supplémentaires",
      description: `Ajout de ressources fondamentales pour ${conceptMastery.conceptName}`,
      type: "add_resource",
    });
  } else if (conceptMastery.masteryLevel > 85) {
    adaptations.push({
      title: "Parcours avancé",
      description: `Remplacement par des ressources plus avancées pour ${conceptMastery.conceptName}`,
      type: "change_order",
    });
  }

  // Adaptations based on weak points
  if (conceptMastery.weakPoints.length > 0) {
    adaptations.push({
      title: "Module de renforcement",
      description: `Ajout d'un module de renforcement pour ${conceptMastery.weakPoints.join(
        ", "
      )}`,
      type: "add_module",
    });
  }

  return adaptations;
}
