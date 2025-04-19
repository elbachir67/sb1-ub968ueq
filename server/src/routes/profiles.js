import express from "express";
import { body } from "express-validator";
import { UserProfile } from "../models/UserProfile.js";
import { auth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { logger } from "../utils/logger.js";

const router = express.Router();

// Create or update profile
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
      const profile = await UserProfile.findOneAndUpdate(
        { user: req.user._id },
        { ...req.body, user: req.user._id },
        { new: true, upsert: true }
      );

      logger.info(`Profile updated for user ${req.user._id}`);
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      res.json(profile);
    } catch (error) {
      logger.error("Profile update error:", error);
      res.status(400).json({ error: error.message });
    }
  }
);

// Add learning goal
router.post(
  "/goals",
  auth,
  [body("title").notEmpty(), body("targetDate").isISO8601()],
  validate,
  async (req, res) => {
    try {
      const profile = await UserProfile.findOneAndUpdate(
        { user: req.user._id },
        { $push: { goals: req.body } },
        { new: true }
      );

      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      res.json(profile);
    } catch (error) {
      logger.error("Goal addition error:", error);
      res.status(400).json({ error: error.message });
    }
  }
);

// Add certificate
router.post(
  "/certificates",
  auth,
  [
    body("title").notEmpty(),
    body("issuer").notEmpty(),
    body("date").isISO8601(),
    body("url").isURL(),
  ],
  validate,
  async (req, res) => {
    try {
      const profile = await UserProfile.findOneAndUpdate(
        { user: req.user._id },
        { $push: { certificates: req.body } },
        { new: true }
      );

      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      res.json(profile);
    } catch (error) {
      logger.error("Certificate addition error:", error);
      res.status(400).json({ error: error.message });
    }
  }
);

// Update skill
router.put(
  "/skills/:skillName",
  auth,
  [body("level").isInt({ min: 1, max: 5 })],
  validate,
  async (req, res) => {
    try {
      const profile = await UserProfile.findOneAndUpdate(
        {
          user: req.user._id,
          "skills.name": req.params.skillName,
        },
        {
          $set: {
            "skills.$.level": req.body.level,
          },
        },
        { new: true }
      );

      if (!profile) {
        // Skill doesn't exist, add it
        const newProfile = await UserProfile.findOneAndUpdate(
          { user: req.user._id },
          {
            $push: {
              skills: {
                name: req.params.skillName,
                level: req.body.level,
                endorsements: 0,
              },
            },
          },
          { new: true }
        );
        return res.json(newProfile);
      }

      res.json(profile);
    } catch (error) {
      logger.error("Skill update error:", error);
      res.status(400).json({ error: error.message });
    }
  }
);

// Get profile
router.get("/", auth, async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ user: req.user._id });

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json(profile);
  } catch (error) {
    logger.error("Profile fetch error:", error);
    res.status(400).json({ error: error.message });
  }
});

export const profileRoutes = router;
