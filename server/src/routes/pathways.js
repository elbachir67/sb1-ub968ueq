import express from "express";
import { Pathway } from "../models/Pathway.js";
import { Goal } from "../models/LearningGoal.js";
import { auth } from "../middleware/auth.js";
import { logger } from "../utils/logger.js";
import PathwayGenerationService from "../services/PathwayGenerationService.js";

const router = express.Router();

// Mettre à jour une recommandation
router.put("/:pathwayId/recommendations/:index", auth, async (req, res) => {
  try {
    const { pathwayId, index } = req.params;
    const { action } = req.body;

    if (!["start", "skip", "complete"].includes(action)) {
      return res.status(400).json({ error: "Action invalide" });
    }

    const pathway = await Pathway.findOne({
      _id: pathwayId,
      userId: req.user.id,
    });

    if (!pathway) {
      return res.status(404).json({ error: "Parcours non trouvé" });
    }

    const recommendationIndex = parseInt(index);
    if (
      recommendationIndex < 0 ||
      recommendationIndex >= pathway.adaptiveRecommendations.length
    ) {
      return res
        .status(400)
        .json({ error: "Index de recommandation invalide" });
    }

    // Mettre à jour le statut de la recommandation
    pathway.adaptiveRecommendations[recommendationIndex].status =
      action === "start"
        ? "pending"
        : action === "skip"
        ? "skipped"
        : "completed";

    // Si la recommandation est complétée, générer de nouvelles recommandations
    if (action === "complete") {
      const newRecommendations =
        await PathwayGenerationService.generateAdaptiveRecommendations(
          pathway.goalId,
          pathway.moduleProgress,
          pathway.adaptiveRecommendations.filter(
            (_, i) => i !== recommendationIndex
          )
        );

      pathway.adaptiveRecommendations = [
        ...pathway.adaptiveRecommendations.filter(
          (_, i) => i !== recommendationIndex
        ),
        ...newRecommendations,
      ];
    }

    await pathway.save();
    res.json(pathway);
  } catch (error) {
    logger.error("Error updating recommendation:", error);
    res
      .status(500)
      .json({ error: "Erreur lors de la mise à jour de la recommandation" });
  }
});

// Récupérer les données du tableau de bord
router.get("/user/dashboard", auth, async (req, res) => {
  try {
    // Récupérer les parcours actifs de l'utilisateur
    const activePathways = await Pathway.find({
      userId: req.user.id,
      status: { $in: ["active", "paused"] },
    }).populate("goalId");

    // Récupérer les parcours complétés
    const completedPathways = await Pathway.find({
      userId: req.user.id,
      status: "completed",
    }).populate("goalId");

    // Calculer les statistiques d'apprentissage
    const learningStats = {
      totalHoursSpent: 0,
      completedResources: 0,
      averageQuizScore: 0,
      streakDays: 0,
    };

    // Calculer les statistiques à partir des parcours
    const allPathways = [...activePathways, ...completedPathways];
    let totalQuizzes = 0;
    let totalScore = 0;

    allPathways.forEach(pathway => {
      // Compter les ressources complétées
      pathway.moduleProgress.forEach(module => {
        learningStats.completedResources += module.resources.filter(
          r => r.completed
        ).length;

        if (module.quiz.completed && module.quiz.score) {
          totalQuizzes++;
          totalScore += module.quiz.score;
        }
      });
    });

    // Calculer la moyenne des scores aux quiz
    learningStats.averageQuizScore =
      totalQuizzes > 0 ? Math.round(totalScore / totalQuizzes) : 0;

    // Calculer le streak (à implémenter selon la logique métier)
    learningStats.streakDays = calculateStreak(allPathways);

    // Calculer les prochaines étapes
    const nextMilestones = calculateNextMilestones(activePathways);

    res.json({
      learningStats,
      activePathways,
      completedPathways,
      nextMilestones,
    });
  } catch (error) {
    logger.error("Error fetching dashboard data:", error);
    res.status(500).json({ error: "Error fetching dashboard data" });
  }
});

// Générer un nouveau parcours
router.post("/generate", auth, async (req, res) => {
  try {
    const { goalId } = req.body;

    if (!goalId) {
      return res.status(400).json({ error: "goalId est requis" });
    }

    // Vérifier si un parcours existe déjà
    const existingPathway = await Pathway.findOne({
      userId: req.user.id,
      goalId,
      status: { $in: ["active", "paused"] },
    });

    if (existingPathway) {
      return res.status(400).json({
        error: "Un parcours pour cet objectif existe déjà",
      });
    }

    // Récupérer l'objectif
    const goal = await Goal.findById(goalId);
    if (!goal) {
      return res.status(404).json({ error: "Objectif non trouvé" });
    }

    // Générer le parcours personnalisé
    const pathwayData = await PathwayGenerationService.generatePathway(
      req.user.id,
      goalId
    );

    // Créer le parcours
    const pathway = new Pathway({
      userId: req.user.id,
      goalId,
      status: "active",
      progress: 0,
      currentModule: 0,
      moduleProgress: pathwayData.adaptedModules.map((module, index) => ({
        moduleIndex: index,
        completed: false,
        resources: module.resources.map(resource => ({
          resourceId:
            resource._id?.toString() || resource.id?.toString() || resource,
          completed: false,
        })),
        quiz: { completed: false },
      })),
      startedAt: new Date(),
      lastAccessedAt: new Date(),
      estimatedCompletionDate: new Date(
        Date.now() + goal.estimatedDuration * 7 * 24 * 60 * 60 * 1000
      ),
      adaptiveRecommendations: pathwayData.recommendations,
    });

    await pathway.save();

    // Récupérer le parcours avec les relations
    const populatedPathway = await Pathway.findById(pathway._id).populate(
      "goalId"
    );

    res.status(201).json(populatedPathway);
  } catch (error) {
    logger.error("Error generating pathway:", error);
    res.status(500).json({ error: "Error generating pathway" });
  }
});

// Obtenir un parcours spécifique
router.get("/:pathwayId", auth, async (req, res) => {
  try {
    const pathway = await Pathway.findOne({
      _id: req.params.pathwayId,
      userId: req.user.id,
    }).populate("goalId");

    if (!pathway) {
      return res.status(404).json({ error: "Parcours non trouvé" });
    }

    res.json(pathway);
  } catch (error) {
    logger.error("Error fetching pathway:", error);
    res.status(500).json({ error: "Error fetching pathway" });
  }
});

// Mettre à jour la progression d'un module
router.put("/:pathwayId/modules/:moduleIndex", auth, async (req, res) => {
  try {
    const { pathwayId, moduleIndex } = req.params;
    const { resourceId, completed } = req.body;

    const pathway = await Pathway.findOne({
      _id: pathwayId,
      userId: req.user.id,
    });

    if (!pathway) {
      return res.status(404).json({ error: "Parcours non trouvé" });
    }

    // Mettre à jour la ressource
    if (resourceId) {
      const module = pathway.moduleProgress[moduleIndex];
      if (!module) {
        return res.status(404).json({ error: "Module non trouvé" });
      }

      const resourceIndex = module.resources.findIndex(
        r => r.resourceId === resourceId
      );
      if (resourceIndex > -1) {
        module.resources[resourceIndex].completed = completed;
        module.resources[resourceIndex].completedAt = new Date();
      }

      // Vérifier si le module est complété
      module.completed =
        module.resources.every(r => r.completed) && module.quiz.completed;
    }

    // Mettre à jour la progression globale
    pathway.progress = Math.round(
      (pathway.moduleProgress.filter(m => m.completed).length /
        pathway.moduleProgress.length) *
        100
    );

    await pathway.save();
    res.json(pathway);
  } catch (error) {
    logger.error("Error updating module progress:", error);
    res.status(500).json({ error: "Error updating progress" });
  }
});

// Fonctions utilitaires
function calculateStreak(pathways) {
  // Implémentation simple du calcul de streak
  // À améliorer selon les besoins spécifiques
  let streak = 0;
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Vérifier si l'utilisateur a été actif aujourd'hui ou hier
  const recentActivity = pathways.some(pathway => {
    const lastAccess = new Date(pathway.lastAccessedAt);
    return (
      lastAccess.toDateString() === today.toDateString() ||
      lastAccess.toDateString() === yesterday.toDateString()
    );
  });

  if (recentActivity) {
    streak = 1;
    // Parcourir les jours précédents pour calculer le streak
    let currentDate = new Date(yesterday);
    pathways.forEach(pathway => {
      if (new Date(pathway.lastAccessedAt) >= currentDate) {
        streak++;
      }
    });
  }

  return streak;
}

function calculateNextMilestones(activePathways) {
  return activePathways.map(pathway => {
    const currentModule = pathway.moduleProgress[pathway.currentModule];
    const dueDate = new Date(pathway.startedAt);
    dueDate.setDate(dueDate.getDate() + 7); // Exemple: échéance d'une semaine

    return {
      goalTitle: pathway.goalId.title,
      moduleName: `Module ${pathway.currentModule + 1}`,
      dueDate,
    };
  });
}

export const pathwayRoutes = router;
