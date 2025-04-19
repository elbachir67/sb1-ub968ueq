import express from "express";
import { body } from "express-validator";
import { Concept } from "../models/Concept.js";
import { validate } from "../middleware/validate.js";
import { logger } from "../utils/logger.js";

const router = express.Router();

// Get all concepts with filters
router.get("/", async (req, res) => {
  try {
    const { category, level, search } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }
    if (level) {
      query.level = level;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const concepts = await Concept.find(query)
      .populate("prerequisites")
      .populate("resources")
      .sort("category level");

    res.json(concepts);
  } catch (error) {
    logger.error("Error fetching concepts:", error);
    res.status(500).json({ error: "Error fetching concepts" });
  }
});

// Get a specific concept
router.get("/:id", async (req, res) => {
  try {
    const concept = await Concept.findById(req.params.id)
      .populate("prerequisites")
      .populate("resources")
      .populate("assessmentTest");

    if (!concept) {
      return res.status(404).json({ error: "Concept not found" });
    }

    res.json(concept);
  } catch (error) {
    logger.error("Error fetching concept:", error);
    res.status(500).json({ error: "Error fetching concept" });
  }
});

// Create a new concept
router.post(
  "/",
  [
    body("name").notEmpty(),
    body("description").notEmpty(),
    body("category").notEmpty(),
    body("level").isIn(["basic", "intermediate", "advanced"]),
  ],
  validate,
  async (req, res) => {
    try {
      const concept = new Concept(req.body);
      await concept.save();

      logger.info(`New concept created: ${concept.name}`);
      res.status(201).json(concept);
    } catch (error) {
      logger.error("Error creating concept:", error);
      res.status(400).json({ error: error.message });
    }
  }
);

// Update a concept
router.put(
  "/:id",
  [
    body("name").notEmpty(),
    body("description").notEmpty(),
    body("category").notEmpty(),
    body("level").isIn(["basic", "intermediate", "advanced"]),
  ],
  validate,
  async (req, res) => {
    try {
      const concept = await Concept.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });

      if (!concept) {
        return res.status(404).json({ error: "Concept not found" });
      }

      logger.info(`Concept updated: ${concept.name}`);
      res.json(concept);
    } catch (error) {
      logger.error("Error updating concept:", error);
      res.status(400).json({ error: error.message });
    }
  }
);

export const conceptRoutes = router;
