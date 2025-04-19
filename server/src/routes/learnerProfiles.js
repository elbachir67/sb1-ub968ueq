import express from "express";
import { body } from "express-validator";
import { LearnerProfile } from "../models/LearnerProfile.js";
import { auth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { logger } from "../utils/logger.js";

const router = express.Router();

// Get learner profile
router.get("/", auth, async (req, res) => {
  try {
    let profile = await LearnerProfile.findOne({
      userId: req.user.id,
    }).populate("goal");

    if (!profile) {
      // Créer un profil par défaut si aucun n'existe
      profile = new LearnerProfile({
        userId: req.user.id,
        learningStyle: "visual",
        preferences: {
          mathLevel: "beginner",
          programmingLevel: "beginner",
          preferredDomain: "ml",
        },
      });
      await profile.save();
    }

    res.json(profile);
  } catch (error) {
    logger.error("Error fetching learner profile:", error);
    res.status(500).json({ error: "Error fetching profile" });
  }
});

// Create or update learner profile
router.put(
  "/",
  auth,
  [
    body("learningStyle").isIn([
      "visual",
      "auditory",
      "reading",
      "kinesthetic",
    ]),
    body("preferences.mathLevel").isIn([
      "beginner",
      "intermediate",
      "advanced",
      "expert",
    ]),
    body("preferences.programmingLevel").isIn([
      "beginner",
      "intermediate",
      "advanced",
      "expert",
    ]),
    body("preferences.preferredDomain").isIn([
      "ml",
      "dl",
      "computer_vision",
      "nlp",
      "mlops",
    ]),
  ],
  validate,
  async (req, res) => {
    try {
      const profile = await LearnerProfile.findOneAndUpdate(
        { userId: req.user.id },
        {
          $set: {
            learningStyle: req.body.learningStyle,
            preferences: req.body.preferences,
          },
        },
        { new: true, upsert: true }
      );

      logger.info(`Profile updated for user ${req.user.id}`);
      res.json(profile);
    } catch (error) {
      logger.error("Error updating learner profile:", error);
      res.status(400).json({ error: error.message });
    }
  }
);

// Update assessment results
router.post(
  "/assessments",
  auth,
  [
    body("category").isString(),
    body("score").isNumeric(),
    body("responses").isArray(),
    body("recommendations").isArray(),
  ],
  validate,
  async (req, res) => {
    try {
      const profile = await LearnerProfile.findOne({ userId: req.user.id });

      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      profile.assessments.push({
        category: req.body.category,
        score: req.body.score,
        responses: req.body.responses,
        recommendations: req.body.recommendations,
        completedAt: new Date(),
      });

      await profile.save();
      res.json(profile);
    } catch (error) {
      logger.error("Error updating assessment results:", error);
      res.status(400).json({ error: error.message });
    }
  }
);

// Get assessment history
router.get("/assessments", auth, async (req, res) => {
  try {
    const profile = await LearnerProfile.findOne({ userId: req.user.id });

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json(profile.assessments);
  } catch (error) {
    logger.error("Error fetching assessment history:", error);
    res.status(500).json({ error: error.message });
  }
});

// Update goal
router.put(
  "/goal",
  auth,
  [body("goalId").isMongoId()],
  validate,
  async (req, res) => {
    try {
      const profile = await LearnerProfile.findOneAndUpdate(
        { userId: req.user.id },
        { $set: { goal: req.body.goalId } },
        { new: true }
      ).populate("goal");

      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      res.json(profile);
    } catch (error) {
      logger.error("Error updating goal:", error);
      res.status(400).json({ error: error.message });
    }
  }
);

// Export le routeur comme export par défaut
export default router;
