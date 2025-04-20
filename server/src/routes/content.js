import express from "express";
import { auth } from "../middleware/auth.js";
import ContentGenerationService from "../services/ContentGenerationService.js";
import { logger } from "../utils/logger.js";

const router = express.Router();

// Générer du contenu
router.post("/generate", auth, async (req, res) => {
  try {
    const content = await ContentGenerationService.generateContent(req.body);
    res.json(content);
  } catch (error) {
    logger.error("Error generating content:", error);
    res.status(500).json({ error: "Error generating content" });
  }
});

// Récupérer le contenu généré
router.get("/", auth, async (req, res) => {
  try {
    const content = await ContentGenerationService.getGeneratedContent(
      req.query
    );
    res.json(content);
  } catch (error) {
    logger.error("Error fetching content:", error);
    res.status(500).json({ error: "Error fetching content" });
  }
});

export const contentRoutes = router;
