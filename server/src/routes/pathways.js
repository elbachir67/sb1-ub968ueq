import express from "express";
import { Pathway } from "../models/Pathway.js";
import { Goal } from "../models/LearningGoal.js";
import { auth } from "../middleware/auth.js";
import { logger } from "../utils/logger.js";
import PathwayGenerationService from "../services/PathwayGenerationService.js";

const router = express.Router();

// Generate new pathway
router.post("/generate", auth, async (req, res) => {
  try {
    const { goalId } = req.body;
    const userId = req.user.id;

    // Check if goal exists
    const goal = await Goal.findById(goalId);
    if (!goal) {
      return res.status(404).json({ error: "Objectif non trouvé" });
    }

    // Check if pathway already exists for this user and goal
    const existingPathway = await Pathway.findOne({
      userId,
      goalId,
      status: { $ne: "completed" },
    });

    if (existingPathway) {
      return res
        .status(400)
        .json({ error: "Un parcours existe déjà pour cet objectif" });
    }

    // Generate pathway using the service
    const pathway = await PathwayGenerationService.generatePathway(
      userId,
      goalId
    );

    // Populate the goal details
    await pathway.populate("goalId");

    res.json(pathway);
  } catch (error) {
    logger.error("Error generating pathway:", error);
    res.status(500).json({ error: "Erreur lors de la génération du parcours" });
  }
});

// Get user's pathways
router.get("/user/dashboard", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const [activePathways, completedPathways] = await Promise.all([
      Pathway.find({
        userId,
        status: { $in: ["active", "paused"] },
      }).populate("goalId"),
      Pathway.find({
        userId,
        status: "completed",
      }).populate("goalId"),
    ]);

    // Calculate learning stats
    const learningStats = {
      totalHoursSpent: 0,
      completedResources: 0,
      averageQuizScore: 0,
      streakDays: 0,
    };

    let totalQuizzes = 0;
    let quizScoreSum = 0;

    [...activePathways, ...completedPathways].forEach(pathway => {
      // Calculate total time spent
      const startDate = new Date(pathway.startedAt);
      const lastDate = new Date(pathway.lastAccessedAt);
      const hoursSpent = Math.round(
        (lastDate.getTime() - startDate.getTime()) / (1000 * 60 * 60)
      );
      learningStats.totalHoursSpent += hoursSpent;

      // Count completed resources and calculate quiz scores
      pathway.moduleProgress.forEach(module => {
        learningStats.completedResources += module.resources.filter(
          r => r.completed
        ).length;

        if (module.quiz.completed && module.quiz.score) {
          quizScoreSum += module.quiz.score;
          totalQuizzes++;
        }
      });
    });

    // Calculate average quiz score
    learningStats.averageQuizScore =
      totalQuizzes > 0 ? Math.round(quizScoreSum / totalQuizzes) : 0;

    // Calculate streak days
    learningStats.streakDays = calculateStreakDays([
      ...activePathways,
      ...completedPathways,
    ]);

    // Get next milestones
    const nextMilestones = activePathways.map(pathway => {
      const currentModule = pathway.moduleProgress[pathway.currentModule];
      const estimatedCompletion = new Date(pathway.estimatedCompletionDate);

      return {
        goalTitle: pathway.goalId.title,
        moduleName: pathway.goalId.modules[pathway.currentModule].title,
        dueDate: estimatedCompletion,
      };
    });

    res.json({
      learningStats,
      activePathways,
      completedPathways,
      nextMilestones,
    });
  } catch (error) {
    logger.error("Error fetching dashboard:", error);
    res
      .status(500)
      .json({ error: "Erreur lors du chargement du tableau de bord" });
  }
});

// Get specific pathway
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
    res.status(500).json({ error: "Erreur lors du chargement du parcours" });
  }
});

// Update module progress
router.put("/:pathwayId/modules/:moduleIndex", auth, async (req, res) => {
  try {
    const { pathwayId, moduleIndex } = req.params;
    const { resourceId, completed } = req.body;

    const pathway = await Pathway.findOne({
      _id: pathwayId,
      userId: req.user.id,
    }).populate("goalId");

    if (!pathway) {
      return res.status(404).json({ error: "Parcours non trouvé" });
    }

    // Vérifier si le module est accessible
    if (!pathway.isModuleAccessible(parseInt(moduleIndex))) {
      return res.status(403).json({ error: "Module non accessible" });
    }

    // Update resource completion
    if (resourceId) {
      const moduleProgress = pathway.moduleProgress[moduleIndex];
      const resourceIndex = moduleProgress.resources.findIndex(
        r => r.resourceId === resourceId
      );

      if (resourceIndex === -1) {
        return res.status(404).json({ error: "Ressource non trouvée" });
      }

      moduleProgress.resources[resourceIndex].completed = completed;
      moduleProgress.resources[resourceIndex].completedAt = completed
        ? new Date()
        : null;

      // Check if all resources are completed
      const allResourcesCompleted = moduleProgress.resources.every(
        r => r.completed
      );

      // If all resources are completed and quiz is passed, mark module as completed
      if (
        allResourcesCompleted &&
        moduleProgress.quiz.completed &&
        moduleProgress.quiz.score >= 70
      ) {
        moduleProgress.completed = true;
      }
    }

    // Update progress and unlock next module if needed
    await pathway.updateProgress();

    // Populate goal details before sending response
    await pathway.populate("goalId");

    res.json(pathway);
  } catch (error) {
    logger.error("Error updating module progress:", error);
    res
      .status(500)
      .json({ error: "Erreur lors de la mise à jour de la progression" });
  }
});

// Helper function to calculate streak days
function calculateStreakDays(pathways) {
  const activityDates = new Set();

  pathways.forEach(pathway => {
    pathway.moduleProgress.forEach(module => {
      module.resources.forEach(resource => {
        if (resource.completedAt) {
          activityDates.add(resource.completedAt.toISOString().split("T")[0]);
        }
      });
      if (module.quiz.completedAt) {
        activityDates.add(module.quiz.completedAt.toISOString().split("T")[0]);
      }
    });
  });

  let streak = 0;
  let currentDate = new Date();

  while (activityDates.has(currentDate.toISOString().split("T")[0])) {
    streak++;
    currentDate.setDate(currentDate.getDate() - 1);
  }

  return streak;
}

export const pathwayRoutes = router;
