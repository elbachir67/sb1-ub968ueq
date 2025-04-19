import express from "express";
import { Goal } from "../models/LearningGoal.js";
import { LearnerProfile } from "../models/LearnerProfile.js";
import { logger } from "../utils/logger.js";
import mongoose from "mongoose";

const router = express.Router();

// Get a single goal by ID - MUST be placed BEFORE the root route
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      logger.warn(`Invalid goal ID format: ${id}`);
      return res.status(400).json({ error: "Format d'ID invalide" });
    }

    logger.info(`Fetching goal with ID: ${id}`);
    const goal = await Goal.findById(id).populate("requiredConcepts").lean();

    if (!goal) {
      logger.warn(`Goal not found with ID: ${id}`);
      return res.status(404).json({ error: "Objectif non trouvé" });
    }

    // Disable caching
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    logger.info(`Successfully fetched goal: ${id}`);
    res.json(goal);
  } catch (error) {
    logger.error("Error fetching goal:", error);
    res.status(500).json({
      error: "Erreur lors du chargement de l'objectif",
      details: error.message,
    });
  }
});

// Get all goals with filters and recommendations
router.get("/", async (req, res) => {
  try {
    const {
      category,
      difficulty,
      userId,
      mathLevel,
      programmingLevel,
      preferredDomain,
    } = req.query;

    let query = {};

    // Filtres de base
    if (category && category !== "all") {
      query.category = category;
    }
    if (difficulty && difficulty !== "all") {
      query.level = difficulty;
    }

    // Récupérer le profil et les évaluations si userId est fourni
    let profile = null;
    let latestAssessment = null;

    if (userId) {
      profile = await LearnerProfile.findOne({ userId });
      if (profile && profile.assessments.length > 0) {
        latestAssessment = profile.assessments.sort(
          (a, b) => b.completedAt - a.completedAt
        )[0];
      }
    }

    // Appliquer les filtres basés sur le profil
    if (profile) {
      if (!query.level) {
        query.level = latestAssessment?.recommendedLevel || "beginner";
      }
      if (!query.category && profile.preferences?.preferredDomain) {
        query.category = profile.preferences.preferredDomain;
      }
    }

    logger.info("Executing goal search with query:", query);

    // Récupérer les objectifs
    const goals = await Goal.find(query)
      .populate("requiredConcepts")
      .sort("category level")
      .lean();

    logger.info(`Found ${goals.length} goals matching criteria`);

    // Ajouter des métadonnées pour chaque objectif
    const goalsWithMetadata = goals.map(goal => {
      const isRecommended =
        profile &&
        latestAssessment &&
        goal.level === latestAssessment.recommendedLevel &&
        (!goal.category ||
          goal.category === profile.preferences?.preferredDomain);

      return {
        ...goal,
        isRecommended,
        matchScore: calculateMatchScore(goal, profile, latestAssessment),
      };
    });

    // Trier par score de correspondance
    goalsWithMetadata.sort((a, b) => b.matchScore - a.matchScore);

    // Disable caching
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    res.json(goalsWithMetadata);
  } catch (error) {
    logger.error("Error fetching goals:", error);
    res.status(500).json({
      error: "Error fetching goals",
      details: error.message,
    });
  }
});

// Fonction utilitaire pour calculer le score de correspondance
function calculateMatchScore(goal, profile, assessment) {
  if (!profile || !assessment) return 0;

  let score = 0;

  // Correspondance de niveau
  if (goal.level === assessment.recommendedLevel) {
    score += 40;
  }

  // Correspondance de domaine
  if (goal.category === profile.preferences?.preferredDomain) {
    score += 30;
  }

  // Correspondance des prérequis
  const prereqMatch = goal.prerequisites?.every(prereq => {
    if (prereq.category === "math" && profile.preferences?.mathLevel) {
      return isLevelSufficient(profile.preferences.mathLevel, prereq.level);
    }
    if (
      prereq.category === "programming" &&
      profile.preferences?.programmingLevel
    ) {
      return isLevelSufficient(
        profile.preferences.programmingLevel,
        prereq.level
      );
    }
    return true;
  });

  if (prereqMatch) {
    score += 30;
  }

  return score;
}

// Fonction utilitaire pour comparer les niveaux
function isLevelSufficient(userLevel, requiredLevel) {
  const levels = ["beginner", "intermediate", "advanced", "expert"];
  const userLevelIndex = levels.indexOf(userLevel);
  const requiredLevelIndex = levels.indexOf(requiredLevel);
  return userLevelIndex >= requiredLevelIndex;
}

export const goalRoutes = router;
