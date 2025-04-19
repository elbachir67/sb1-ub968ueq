import express from "express";
import { Assessment } from "../models/Assessment.js";
import { Goal } from "../models/LearningGoal.js";
import { LearnerProfile } from "../models/LearnerProfile.js";
import { auth } from "../middleware/auth.js";
import { logger } from "../utils/logger.js";

const router = express.Router();

// Get assessment questions by category
router.get("/questions", async (req, res) => {
  try {
    const { domain } = req.query;
    let query = {};

    if (domain) {
      query.category = domain.toLowerCase();
    }

    const assessments = await Assessment.find(query)
      .populate("recommendedGoals")
      .select("-createdAt -updatedAt -__v")
      .limit(4);

    const questions = assessments.flatMap(assessment =>
      assessment.questions.slice(0, 1).map(q => ({
        id: q._id.toString(),
        text: q.text,
        category: assessment.category,
        difficulty: assessment.difficulty,
        options: q.options.map(opt => ({
          id: opt._id.toString(),
          text: opt.text,
          isCorrect: opt.isCorrect,
        })),
        explanation: q.explanation,
        recommendedGoals: assessment.recommendedGoals,
      }))
    );

    res.json(questions);
  } catch (error) {
    logger.error("Error fetching assessment questions:", error);
    res.status(500).json({ error: "Error fetching questions" });
  }
});

// Submit assessment results
router.post("/submit", auth, async (req, res) => {
  try {
    const { category, score, responses, recommendations } = req.body;
    const userId = req.user.id;

    // Validate category
    const validCategories = [
      "math",
      "programming",
      "ml",
      "dl",
      "computer_vision",
      "nlp",
      "mlops",
    ];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        error: `Invalid category. Must be one of: ${validCategories.join(
          ", "
        )}`,
      });
    }

    // Format recommendations
    const formattedRecommendations = recommendations.map(rec => ({
      category: rec.category,
      score: rec.score,
      recommendations: rec.recommendations,
    }));

    // Find and update or create learner profile
    const learnerProfile = await LearnerProfile.findOneAndUpdate(
      { userId },
      {
        $setOnInsert: {
          userId,
          learningStyle: "visual",
          preferences: {
            mathLevel: "beginner",
            programmingLevel: "beginner",
            preferredDomain: category,
          },
        },
        $push: {
          assessments: {
            category,
            score,
            responses,
            recommendations: formattedRecommendations,
            completedAt: new Date(),
          },
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    // Update preferences based on score
    const recommendedLevel =
      score >= 80 ? "advanced" : score >= 50 ? "intermediate" : "beginner";

    // Update appropriate level
    let updateQuery = {};
    switch (category) {
      case "math":
        updateQuery = { "preferences.mathLevel": recommendedLevel };
        break;
      case "programming":
        updateQuery = { "preferences.programmingLevel": recommendedLevel };
        break;
      default:
        updateQuery = { "preferences.preferredDomain": category };
    }

    // Update preferences in a separate operation
    await LearnerProfile.findByIdAndUpdate(
      learnerProfile._id,
      { $set: updateQuery },
      { runValidators: true }
    );

    // Fetch updated profile
    const updatedProfile = await LearnerProfile.findById(learnerProfile._id);

    res.json({
      success: true,
      profile: updatedProfile,
    });
  } catch (error) {
    logger.error("Error submitting assessment:", error);
    if (error.code === 11000) {
      logger.error("Duplicate key error:", error);
      res.status(400).json({ error: "Profile already exists for this user" });
    } else {
      res.status(500).json({ error: "Error submitting assessment" });
    }
  }
});

// Get assessment history
router.get("/history", auth, async (req, res) => {
  try {
    const profile = await LearnerProfile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.json([]);
    }

    const assessments = profile.assessments.sort(
      (a, b) => b.completedAt - a.completedAt
    );

    res.json(assessments);
  } catch (error) {
    logger.error("Error fetching assessment history:", error);
    res.status(500).json({ error: "Error fetching assessment history" });
  }
});

export default router;
