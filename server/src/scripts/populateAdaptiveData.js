import mongoose from "mongoose";
import { logger } from "../utils/logger.js";
import { User } from "../models/User.js";
import { LearnerProfile } from "../models/LearnerProfile.js";
import { Goal } from "../models/LearningGoal.js";
import { Assessment } from "../models/Assessment.js";
import { Pathway } from "../models/Pathway.js";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/ucad_ia";

// Profils d'apprenants avec différents styles d'apprentissage
const learnerProfiles = [
  {
    user: {
      email: "fast.learner@ucad.edu.sn",
      password: "FastLearner123!",
      role: "user",
      isActive: true,
    },
    profile: {
      learningStyle: "visual",
      preferences: {
        mathLevel: "advanced",
        programmingLevel: "intermediate",
        preferredDomain: "ml",
      },
      assessments: [
        {
          category: "math",
          score: 95,
          responses: generateResponses(10, "fast", true),
          completedAt: new Date("2024-01-01"),
        },
        {
          category: "math",
          score: 92,
          responses: generateResponses(10, "fast", true),
          completedAt: new Date("2024-01-15"),
        },
        {
          category: "programming",
          score: 88,
          responses: generateResponses(10, "fast", true),
          completedAt: new Date("2024-01-02"),
        },
      ],
    },
  },
  {
    user: {
      email: "steady.learner@ucad.edu.sn",
      password: "SteadyLearner123!",
      role: "user",
      isActive: true,
    },
    profile: {
      learningStyle: "reading",
      preferences: {
        mathLevel: "intermediate",
        programmingLevel: "intermediate",
        preferredDomain: "dl",
      },
      assessments: [
        {
          category: "math",
          score: 75,
          responses: generateResponses(10, "medium", true),
          completedAt: new Date("2024-01-01"),
        },
        {
          category: "math",
          score: 78,
          responses: generateResponses(10, "medium", true),
          completedAt: new Date("2024-01-15"),
        },
        {
          category: "programming",
          score: 72,
          responses: generateResponses(10, "medium", true),
          completedAt: new Date("2024-01-02"),
        },
      ],
    },
  },
  {
    user: {
      email: "struggling.learner@ucad.edu.sn",
      password: "StrugglingLearner123!",
      role: "user",
      isActive: true,
    },
    profile: {
      learningStyle: "kinesthetic",
      preferences: {
        mathLevel: "beginner",
        programmingLevel: "beginner",
        preferredDomain: "ml",
      },
      assessments: [
        {
          category: "math",
          score: 55,
          responses: generateResponses(10, "slow", false),
          completedAt: new Date("2024-01-01"),
        },
        {
          category: "math",
          score: 62,
          responses: generateResponses(10, "slow", true),
          completedAt: new Date("2024-01-15"),
        },
        {
          category: "programming",
          score: 58,
          responses: generateResponses(10, "slow", false),
          completedAt: new Date("2024-01-02"),
        },
      ],
    },
  },
];

// Fonction pour générer des réponses d'évaluation
function generateResponses(count, speed, mostlyCorrect) {
  const responses = [];
  const timeRanges = {
    fast: { min: 15, max: 30 },
    medium: { min: 30, max: 60 },
    slow: { min: 60, max: 120 },
  };
  const range = timeRanges[speed];

  for (let i = 0; i < count; i++) {
    const isCorrect = mostlyCorrect ? Math.random() > 0.2 : Math.random() > 0.6;
    responses.push({
      questionId: `q${i}`,
      selectedOption: `opt${i}`,
      timeSpent: Math.floor(
        Math.random() * (range.max - range.min) + range.min
      ),
      isCorrect,
      category: i % 2 === 0 ? "theory" : "practice",
      difficulty:
        i % 3 === 0 ? "basic" : i % 3 === 1 ? "intermediate" : "advanced",
    });
  }

  return responses;
}

// Parcours adaptés pour différents profils
const adaptivePathways = [
  {
    title: "Machine Learning Accéléré",
    description: "Parcours intensif pour apprenants rapides",
    modules: [
      {
        title: "Fondamentaux ML - Version Avancée",
        duration: 15,
        resources: [
          {
            title: "ML Theory Deep Dive",
            type: "article",
            url: "https://example.com/ml-theory",
            duration: 60,
            isPremium: true,
          },
          {
            title: "Advanced ML Workshop",
            type: "practice",
            url: "https://example.com/ml-workshop",
            duration: 120,
            isPremium: true,
          },
        ],
      },
    ],
    cognitiveLoad: {
      contentPerStep: 5,
      practiceFrequency: "low",
      breakFrequency: 45,
    },
  },
  {
    title: "Machine Learning Progressif",
    description: "Parcours équilibré avec pratique régulière",
    modules: [
      {
        title: "Fondamentaux ML - Version Standard",
        duration: 20,
        resources: [
          {
            title: "ML Basics",
            type: "video",
            url: "https://example.com/ml-basics",
            duration: 45,
            isPremium: false,
          },
          {
            title: "Guided Practice",
            type: "practice",
            url: "https://example.com/guided-practice",
            duration: 90,
            isPremium: false,
          },
        ],
      },
    ],
    cognitiveLoad: {
      contentPerStep: 3,
      practiceFrequency: "medium",
      breakFrequency: 30,
    },
  },
  {
    title: "Machine Learning Fondamental",
    description: "Parcours détaillé avec support supplémentaire",
    modules: [
      {
        title: "Fondamentaux ML - Version Progressive",
        duration: 30,
        resources: [
          {
            title: "ML Concepts Simplified",
            type: "video",
            url: "https://example.com/ml-simplified",
            duration: 30,
            isPremium: false,
          },
          {
            title: "Interactive Exercises",
            type: "practice",
            url: "https://example.com/interactive",
            duration: 60,
            isPremium: false,
          },
          {
            title: "Additional Support Materials",
            type: "article",
            url: "https://example.com/support",
            duration: 45,
            isPremium: false,
          },
        ],
      },
    ],
    cognitiveLoad: {
      contentPerStep: 2,
      practiceFrequency: "high",
      breakFrequency: 20,
    },
  },
];

async function populateAdaptiveData() {
  try {
    await mongoose.connect(MONGODB_URI);
    logger.info("Connected to MongoDB");

    // Créer les utilisateurs et leurs profils
    for (const learnerData of learnerProfiles) {
      // Créer l'utilisateur
      const user = new User(learnerData.user);
      await user.save();
      logger.info(`Created user: ${user.email}`);

      // Créer le profil d'apprenant
      const learnerProfile = new LearnerProfile({
        ...learnerData.profile,
        userId: user._id,
      });
      await learnerProfile.save();
      logger.info(`Created learner profile for ${user.email}`);

      // Créer un parcours adapté
      const pathwayTemplate =
        adaptivePathways[Math.floor(Math.random() * adaptivePathways.length)];
      const pathway = new Pathway({
        userId: user._id,
        goalId: (await Goal.findOne())._id,
        status: "active",
        progress: Math.random() * 100,
        currentModule: 0,
        moduleProgress: pathwayTemplate.modules.map(module => ({
          completed: false,
          locked: false,
          resources: module.resources.map(resource => ({
            resourceId: new mongoose.Types.ObjectId(),
            completed: Math.random() > 0.5,
          })),
          quiz: {
            completed: Math.random() > 0.5,
            score: Math.floor(Math.random() * 100),
            completedAt: new Date(),
          },
        })),
        startedAt: new Date(),
        lastAccessedAt: new Date(),
        estimatedCompletionDate: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ),
        adaptiveRecommendations: [
          {
            type: "resource",
            description: "Ressource recommandée basée sur vos performances",
            priority: "high",
            status: "pending",
          },
          {
            type: "practice",
            description: "Exercice pratique adapté à votre niveau",
            priority: "medium",
            status: "pending",
          },
        ],
      });

      await pathway.save();
      logger.info(`Created adaptive pathway for ${user.email}`);
    }

    logger.info("Database population completed successfully");
  } catch (error) {
    logger.error("Error populating database:", error);
    throw error;
  } finally {
    await mongoose.disconnect();
    logger.info("Disconnected from MongoDB");
  }
}

// Exécuter le script
populateAdaptiveData().catch(error => {
  logger.error("Fatal error during database population:", error);
  process.exit(1);
});
