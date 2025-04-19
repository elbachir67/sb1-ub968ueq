import express from "express";
import { Quiz } from "../models/Quiz.js";
import { QuizAttempt } from "../models/QuizAttempt.js";
import { Pathway } from "../models/Pathway.js";
import { auth } from "../middleware/auth.js";
import { logger } from "../utils/logger.js";

const router = express.Router();

// Get quiz for a specific module
router.get(
  "/pathways/:pathwayId/modules/:moduleId/quiz",
  auth,
  async (req, res) => {
    try {
      const { pathwayId, moduleId } = req.params;
      logger.info(
        `Fetching quiz for pathway ${pathwayId} and module ${moduleId}`
      );

      // Vérifier que l'utilisateur a accès à ce parcours
      const pathway = await Pathway.findOne({
        _id: pathwayId,
        userId: req.user.id,
      });

      if (!pathway) {
        logger.warn(`Pathway ${pathwayId} not found for user ${req.user.id}`);
        return res.status(404).json({ error: "Parcours non trouvé" });
      }

      // Récupérer le quiz
      const quiz = await Quiz.findOne({ moduleId });
      if (!quiz) {
        logger.warn(`Quiz not found for module ${moduleId}`);
        return res.status(404).json({ error: "Quiz non trouvé" });
      }

      // Formater les questions pour le client
      const formattedQuestions = quiz.questions.map(q => ({
        id: q._id.toString(),
        text: q.text,
        category: q.category || "general", // Catégorie par défaut si non définie
        difficulty: q.difficulty || "intermediate", // Difficulté par défaut si non définie
        options: q.options.map(opt => ({
          id: opt._id.toString(),
          text: opt.text,
          isCorrect: opt.isCorrect,
        })),
        explanation: q.explanation,
      }));

      res.json({
        id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        timeLimit: quiz.timeLimit,
        questions: formattedQuestions,
        passingScore: quiz.passingScore || 70, // Score de passage par défaut si non défini
      });
    } catch (error) {
      logger.error("Error fetching quiz:", error);
      res.status(500).json({ error: "Error fetching quiz" });
    }
  }
);

// Submit quiz attempt
router.post(
  "/pathways/:pathwayId/modules/:moduleId/quiz/submit",
  auth,
  async (req, res) => {
    try {
      const { pathwayId, moduleId } = req.params;
      const {
        score,
        answers,
        totalTimeSpent,
        categoryScores,
        recommendations,
      } = req.body;

      // Vérifier que l'utilisateur a accès à ce parcours
      const pathway = await Pathway.findOne({
        _id: pathwayId,
        userId: req.user.id,
      });

      if (!pathway) {
        return res.status(404).json({ error: "Parcours non trouvé" });
      }

      // Récupérer le quiz
      const quiz = await Quiz.findOne({ moduleId });
      if (!quiz) {
        return res.status(404).json({ error: "Quiz non trouvé" });
      }

      // Créer une nouvelle tentative
      const attempt = new QuizAttempt({
        userId: req.user.id,
        quizId: quiz._id,
        pathwayId,
        moduleId,
        score,
        answers,
        totalTimeSpent,
        completed: true,
        completedAt: new Date(),
      });

      await attempt.save();

      // Mettre à jour le statut du quiz dans le parcours
      const moduleIndex = pathway.moduleProgress.findIndex(
        m => m.moduleIndex.toString() === moduleId
      );

      if (moduleIndex > -1) {
        pathway.moduleProgress[moduleIndex].quiz = {
          completed: true,
          score,
          completedAt: new Date(),
        };

        // Vérifier si le module est complété
        const allResourcesCompleted = pathway.moduleProgress[
          moduleIndex
        ].resources.every(r => r.completed);

        if (allResourcesCompleted && score >= (quiz.passingScore || 70)) {
          pathway.moduleProgress[moduleIndex].completed = true;

          // Si c'est le dernier module, marquer le parcours comme complété
          if (moduleIndex === pathway.moduleProgress.length - 1) {
            pathway.status = "completed";
          } else {
            // Sinon, passer au module suivant
            pathway.currentModule = moduleIndex + 1;
          }
        }

        // Mettre à jour la progression globale
        pathway.progress = Math.round(
          (pathway.moduleProgress.filter(m => m.completed).length /
            pathway.moduleProgress.length) *
            100
        );

        await pathway.save();
      }

      res.json({
        success: true,
        attempt: {
          id: attempt._id,
          score,
          completedAt: attempt.completedAt,
          categoryScores,
          recommendations,
        },
        pathway: {
          progress: pathway.progress,
          currentModule: pathway.currentModule,
          status: pathway.status,
        },
      });
    } catch (error) {
      logger.error("Error submitting quiz:", error);
      res.status(500).json({ error: "Error submitting quiz" });
    }
  }
);

// Reset quiz attempt for a module
router.post(
  "/pathways/:pathwayId/modules/:moduleId/quiz/reset",
  auth,
  async (req, res) => {
    try {
      const { pathwayId, moduleId } = req.params;

      // Vérifier que l'utilisateur a accès à ce parcours
      const pathway = await Pathway.findOne({
        _id: pathwayId,
        userId: req.user.id,
      });

      if (!pathway) {
        return res.status(404).json({ error: "Parcours non trouvé" });
      }

      // Trouver le module
      const moduleIndex = pathway.moduleProgress.findIndex(
        m => m.moduleIndex.toString() === moduleId
      );

      if (moduleIndex === -1) {
        return res.status(404).json({ error: "Module non trouvé" });
      }

      // Réinitialiser le statut du quiz
      pathway.moduleProgress[moduleIndex].quiz = {
        completed: false,
        score: null,
        completedAt: null,
      };

      // Si le module était complété, le marquer comme non complété
      if (pathway.moduleProgress[moduleIndex].completed) {
        pathway.moduleProgress[moduleIndex].completed = false;
      }

      // Mettre à jour la progression globale
      pathway.progress = Math.round(
        (pathway.moduleProgress.filter(m => m.completed).length /
          pathway.moduleProgress.length) *
          100
      );

      await pathway.save();

      // Supprimer les anciennes tentatives pour ce module
      await QuizAttempt.deleteMany({
        userId: req.user.id,
        pathwayId,
        moduleId,
      });

      res.json({
        success: true,
        message: "Quiz réinitialisé avec succès",
        pathway,
      });
    } catch (error) {
      logger.error("Error resetting quiz:", error);
      res.status(500).json({ error: "Error resetting quiz" });
    }
  }
);

// Get quiz attempts history
router.get(
  "/pathways/:pathwayId/modules/:moduleId/quiz/attempts",
  auth,
  async (req, res) => {
    try {
      const { pathwayId, moduleId } = req.params;

      const attempts = await QuizAttempt.find({
        userId: req.user.id,
        pathwayId,
        moduleId,
      })
        .sort("-completedAt")
        .select("-answers"); // Ne pas renvoyer les réponses détaillées

      res.json(attempts);
    } catch (error) {
      logger.error("Error fetching quiz attempts:", error);
      res.status(500).json({ error: "Error fetching quiz attempts" });
    }
  }
);

export const quizRoutes = router;
