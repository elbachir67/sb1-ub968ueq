import { Goal } from "../models/LearningGoal.js";
import { Concept } from "../models/Concept.js";
import { LearnerProfile } from "../models/LearnerProfile.js";
import { logger } from "../utils/logger.js";

class PathwayGenerationService {
  /**
   * Génère un parcours personnalisé pour un apprenant
   */
  static async generatePathway(userId, goalId) {
    try {
      // Récupérer le profil de l'apprenant et l'objectif
      const [profile, goal] = await Promise.all([
        LearnerProfile.findOne({ userId }),
        Goal.findById(goalId).populate("requiredConcepts"),
      ]);

      if (!profile || !goal) {
        throw new Error("Profil ou objectif non trouvé");
      }

      // Vérifier les prérequis
      const prerequisites = await this.checkPrerequisites(profile, goal);

      // Adapter les modules selon le profil
      const adaptedModules = this.adaptModules(
        goal.modules,
        profile,
        prerequisites
      );

      // Générer les recommandations initiales
      const recommendations = this.generateInitialRecommendations(
        profile,
        goal
      );

      return {
        userId,
        goalId,
        adaptedModules,
        recommendations,
        prerequisites,
      };
    } catch (error) {
      logger.error("Error generating pathway:", error);
      throw error;
    }
  }

  /**
   * Vérifie les prérequis et identifie les lacunes
   */
  static async checkPrerequisites(profile, goal) {
    const prerequisites = {
      met: [],
      missing: [],
      recommended: [],
    };

    // Vérifier chaque concept requis
    for (const concept of goal.requiredConcepts) {
      const hasPrerequisite = await this.checkConceptPrerequisite(
        profile,
        concept
      );

      if (hasPrerequisite) {
        prerequisites.met.push(concept);
      } else {
        prerequisites.missing.push(concept);
      }
    }

    // Générer des recommandations pour les prérequis manquants
    prerequisites.recommended = this.generatePrerequisiteRecommendations(
      prerequisites.missing,
      profile
    );

    return prerequisites;
  }

  /**
   * Vérifie si un concept prérequis est maîtrisé
   */
  static async checkConceptPrerequisite(profile, concept) {
    // Vérifier les évaluations passées
    const relevantAssessments = profile.assessments.filter(
      assessment => assessment.category === concept.category
    );

    if (relevantAssessments.length === 0) {
      return false;
    }

    // Calculer le score moyen pour la catégorie
    const averageScore =
      relevantAssessments.reduce((acc, curr) => acc + curr.score, 0) /
      relevantAssessments.length;

    // Vérifier le niveau requis
    const requiredScore = {
      basic: 60,
      intermediate: 75,
      advanced: 85,
    }[concept.level];

    return averageScore >= requiredScore;
  }

  /**
   * Adapte les modules selon le profil de l'apprenant
   */
  static adaptModules(modules, profile, prerequisites) {
    return modules.map(module => {
      // Adapter la durée selon le niveau
      const durationMultiplier = this.calculateDurationMultiplier(
        profile,
        module.skills
      );

      // Filtrer et ordonner les ressources
      const adaptedResources = this.adaptResources(
        module.resources,
        profile,
        prerequisites
      );

      return {
        ...module,
        duration: Math.round(module.duration * durationMultiplier),
        resources: adaptedResources,
        isOptional: this.isModuleOptional(module, prerequisites),
      };
    });
  }

  /**
   * Calcule le multiplicateur de durée selon le niveau
   */
  static calculateDurationMultiplier(profile, moduleSkills) {
    const skillLevels = {
      beginner: 1.3,
      intermediate: 1,
      advanced: 0.8,
      expert: 0.7,
    };

    // Vérifier le niveau pour chaque compétence
    const relevantSkills = moduleSkills.filter(
      skill =>
        skill.name.toLowerCase().includes("math") ||
        skill.name.toLowerCase().includes("programming")
    );

    if (relevantSkills.length === 0) {
      return 1;
    }

    // Calculer le multiplicateur moyen
    const multipliers = relevantSkills.map(skill => {
      const userLevel = skill.name.toLowerCase().includes("math")
        ? profile.preferences.mathLevel
        : profile.preferences.programmingLevel;

      return skillLevels[userLevel] || 1;
    });

    return multipliers.reduce((a, b) => a + b) / multipliers.length;
  }

  /**
   * Adapte les ressources selon le profil
   */
  static adaptResources(resources, profile, prerequisites) {
    // Filtrer les ressources selon le niveau
    let adaptedResources = resources.filter(resource =>
      this.isResourceAppropriate(resource, profile)
    );

    // Ajouter des ressources de rattrapage si nécessaire
    if (prerequisites.missing.length > 0) {
      adaptedResources = [
        ...this.generateCatchUpResources(prerequisites.missing),
        ...adaptedResources,
      ];
    }

    // Trier par pertinence
    return this.sortResourcesByRelevance(adaptedResources, profile);
  }

  /**
   * Vérifie si une ressource est appropriée pour le niveau
   */
  static isResourceAppropriate(resource, profile) {
    const levelMapping = {
      beginner: ["basic"],
      intermediate: ["basic", "intermediate"],
      advanced: ["intermediate", "advanced"],
      expert: ["advanced"],
    };

    const appropriateLevels =
      levelMapping[profile.preferences.mathLevel] ||
      levelMapping["intermediate"];

    return appropriateLevels.includes(resource.level);
  }

  /**
   * Génère des ressources de rattrapage
   */
  static generateCatchUpResources(missingPrerequisites) {
    return missingPrerequisites.map(prerequisite => ({
      title: `Introduction à ${prerequisite.name}`,
      type: "tutorial",
      level: "basic",
      duration: 60,
      isCatchUp: true,
    }));
  }

  /**
   * Trie les ressources par pertinence
   */
  static sortResourcesByRelevance(resources, profile) {
    return resources.sort((a, b) => {
      // Priorité aux ressources de rattrapage
      if (a.isCatchUp && !b.isCatchUp) return -1;
      if (!a.isCatchUp && b.isCatchUp) return 1;

      // Ensuite par niveau
      const levelOrder = { basic: 0, intermediate: 1, advanced: 2 };
      return levelOrder[a.level] - levelOrder[b.level];
    });
  }

  /**
   * Détermine si un module est optionnel
   */
  static isModuleOptional(module, prerequisites) {
    // Un module est optionnel si tous ses prérequis sont déjà maîtrisés
    const modulePrerequisites = module.skills.map(skill => skill.name);
    const metPrerequisites = prerequisites.met.map(p => p.name);

    return modulePrerequisites.every(prereq =>
      metPrerequisites.includes(prereq)
    );
  }

  /**
   * Génère les recommandations initiales
   */
  static generateInitialRecommendations(profile, goal) {
    const recommendations = [];

    // Recommandations basées sur les prérequis
    if (profile.preferences.mathLevel === "beginner") {
      recommendations.push({
        type: "resource",
        description: "Renforcer les bases mathématiques",
        priority: "high",
        status: "pending",
      });
    }

    // Recommandations basées sur le domaine
    if (goal.category === profile.preferences.preferredDomain) {
      recommendations.push({
        type: "practice",
        description:
          "Projet pratique recommandé dans votre domaine de prédilection",
        priority: "medium",
        status: "pending",
      });
    }

    return recommendations;
  }

  /**
   * Génère des recommandations pour les prérequis manquants
   */
  static generatePrerequisiteRecommendations(missingPrerequisites, profile) {
    return missingPrerequisites.map(prerequisite => ({
      conceptId: prerequisite._id,
      name: prerequisite.name,
      type: "prerequisite",
      resources: this.getPrerequisiteResources(prerequisite, profile),
      priority: "high",
    }));
  }

  /**
   * Récupère les ressources pour un prérequis
   */
  static getPrerequisiteResources(prerequisite, profile) {
    // Ici, vous pourriez avoir une base de données de ressources par concept
    // Pour l'exemple, on retourne des ressources fictives
    return [
      {
        title: `Introduction à ${prerequisite.name}`,
        type: "tutorial",
        duration: 60,
        level: "basic",
      },
      {
        title: `Exercices pratiques - ${prerequisite.name}`,
        type: "practice",
        duration: 90,
        level: "basic",
      },
    ];
  }
}

export default PathwayGenerationService;
