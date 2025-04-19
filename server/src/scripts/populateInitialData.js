import mongoose from "mongoose";
import dotenv from "dotenv";
import { logger } from "../utils/logger.js";
import { Goal } from "../models/LearningGoal.js";
import { Assessment } from "../models/Assessment.js";
import { User } from "../models/User.js";
import { LearnerProfile } from "../models/LearnerProfile.js";
import { Concept } from "../models/Concept.js";
import { Quiz } from "../models/Quiz.js";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/ucad_ia";

const users = [
  {
    email: "student@ucad.edu.sn",
    password: "Student123!",
    role: "user",
    isActive: true,
  },
  {
    email: "admin@ucad.edu.sn",
    password: "Admin123!",
    role: "admin",
    isActive: true,
  },
];

const concepts = [
  {
    name: "Algèbre Linéaire pour l'IA",
    description: "Fondamentaux d'algèbre linéaire essentiels pour l'IA",
    category: "math",
    level: "basic",
    prerequisites: [],
  },
  {
    name: "Calcul Différentiel",
    description: "Bases du calcul différentiel pour l'optimisation",
    category: "math",
    level: "intermediate",
    prerequisites: [],
  },
  {
    name: "Python pour l'IA",
    description: "Programmation Python orientée data science",
    category: "programming",
    level: "basic",
    prerequisites: [],
  },
];

const goals = [
  {
    title: "Machine Learning Engineer",
    description:
      "Maîtrisez les fondamentaux du ML et développez des compétences pratiques",
    category: "ml",
    level: "intermediate",
    estimatedDuration: 12,
    prerequisites: [
      {
        category: "math",
        skills: [
          { name: "Algèbre linéaire", level: "intermediate" },
          { name: "Calcul différentiel", level: "basic" },
        ],
      },
      {
        category: "programming",
        skills: [
          { name: "Python", level: "intermediate" },
          { name: "SQL", level: "basic" },
        ],
      },
    ],
    modules: [
      {
        title: "Introduction au ML",
        description: "Fondamentaux du machine learning",
        duration: 20,
        skills: [
          { name: "Python", level: "basic" },
          { name: "Scikit-learn", level: "basic" },
        ],
        resources: [
          {
            title: "Cours ML Stanford",
            type: "video",
            url: "https://www.coursera.org/learn/machine-learning",
            duration: 120,
          },
          {
            title: "Hands-On Machine Learning",
            type: "book",
            url: "https://www.oreilly.com/library/view/hands-on-machine-learning/9781492032632/",
            duration: 180,
          },
        ],
        validationCriteria: [
          "Comprendre les types d'apprentissage",
          "Implémenter un modèle simple",
        ],
      },
    ],
    careerOpportunities: [
      {
        title: "ML Engineer",
        description: "Développement de modèles ML",
        averageSalary: "45-75k€/an",
        companies: ["Google", "Amazon", "Meta"],
      },
    ],
    certification: {
      available: true,
      name: "ML Professional Certificate",
      provider: "UCAD AI Center",
      url: "https://ucad.sn/certifications/ml-pro",
    },
  },
];

const quizzes = [
  {
    title: "Quiz Introduction au ML",
    description: "Validez vos connaissances sur les fondamentaux du ML",
    timeLimit: 1800,
    passingScore: 70,
    questions: [
      {
        text: "Quelle métrique est appropriée pour un problème de classification binaire déséquilibré ?",
        options: [
          {
            text: "F1-Score",
            isCorrect: true,
          },
          {
            text: "Accuracy",
            isCorrect: false,
          },
          {
            text: "Mean Squared Error",
            isCorrect: false,
          },
        ],
        explanation:
          "Le F1-Score est plus approprié car il prend en compte à la fois la précision et le rappel.",
      },
      {
        text: "Quel algorithme est un exemple d'apprentissage non supervisé ?",
        options: [
          {
            text: "K-means clustering",
            isCorrect: true,
          },
          {
            text: "Random Forest",
            isCorrect: false,
          },
          {
            text: "Régression logistique",
            isCorrect: false,
          },
        ],
        explanation:
          "K-means est un algorithme de clustering qui ne nécessite pas de données étiquetées.",
      },
    ],
  },
];

const assessments = [
  {
    title: "Évaluation ML Fondamentaux",
    category: "ml",
    difficulty: "basic",
    questions: [
      {
        text: "Quelle est la différence entre l'apprentissage supervisé et non supervisé ?",
        options: [
          {
            text: "L'apprentissage supervisé utilise des données étiquetées, l'apprentissage non supervisé non",
            isCorrect: true,
          },
          {
            text: "L'apprentissage supervisé est plus rapide",
            isCorrect: false,
          },
        ],
        explanation:
          "L'apprentissage supervisé nécessite des données étiquetées pour entraîner le modèle.",
      },
    ],
  },
];

async function populateDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    logger.info("Connected to MongoDB");

    await Promise.all([
      User.deleteMany({}),
      Goal.deleteMany({}),
      Assessment.deleteMany({}),
      Concept.deleteMany({}),
      Quiz.deleteMany({}),
      LearnerProfile.deleteMany({}),
    ]);
    logger.info("Database cleaned");

    const createdUsers = await User.create(users);
    logger.info(`Created ${createdUsers.length} users`);

    const createdConcepts = await Concept.create(concepts);
    logger.info(`Created ${createdConcepts.length} concepts`);

    const createdGoals = await Goal.create(goals);
    logger.info(`Created ${createdGoals.length} goals`);

    // Créer les quiz avec les bons IDs de modules
    const quizzesWithModuleIds = [];

    for (const goal of createdGoals) {
      for (const module of goal.modules) {
        // Pour chaque module, créer un quiz correspondant
        const quiz = {
          ...quizzes[0], // Utiliser le quiz template
          moduleId: module._id.toString(),
          title: `Quiz - ${module.title}`,
          description: `Évaluation des connaissances - ${module.title}`,
        };
        quizzesWithModuleIds.push(quiz);
      }
    }

    const createdQuizzes = await Quiz.create(quizzesWithModuleIds);
    logger.info(`Created ${createdQuizzes.length} quizzes`);

    const createdAssessments = await Assessment.create(assessments);
    logger.info(`Created ${createdAssessments.length} assessments`);

    const userProfiles = createdUsers
      .filter(user => user.role === "user")
      .map(user => ({
        userId: user._id,
        learningStyle: "visual",
        preferences: {
          mathLevel: "intermediate",
          programmingLevel: "intermediate",
          preferredDomain: "ml",
        },
        assessments: [],
      }));

    await LearnerProfile.create(userProfiles);
    logger.info(`Created ${userProfiles.length} learner profiles`);

    logger.info("Database population completed successfully");
  } catch (error) {
    logger.error("Error populating database:", error);
    throw error;
  } finally {
    await mongoose.disconnect();
    logger.info("Disconnected from MongoDB");
  }
}

populateDatabase().catch(error => {
  logger.error("Fatal error during database population:", error);
  process.exit(1);
});
