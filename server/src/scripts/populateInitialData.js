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
    email: "student1@ucad.edu.sn", // Updated default student account
    password: "Student123!",
    role: "user",
    isActive: true,
  },
  {
    email: "student@ucad.edu.sn", // Keep original as backup
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
  {
    email: "alice@ucad.edu.sn",
    password: "Alice123!",
    role: "user",
    isActive: true,
  },
  {
    email: "bob@ucad.edu.sn",
    password: "Bob123!",
    role: "user",
    isActive: true,
  },
  {
    email: "charlie@ucad.edu.sn",
    password: "Charlie123!",
    role: "user",
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
    name: "Probabilités et Statistiques",
    description: "Concepts probabilistes pour le ML",
    category: "math",
    level: "intermediate",
    prerequisites: [],
  },
  {
    name: "Optimisation",
    description: "Méthodes d'optimisation pour le ML",
    category: "math",
    level: "advanced",
    prerequisites: [],
  },
  {
    name: "Python pour l'IA",
    description: "Programmation Python orientée data science",
    category: "programming",
    level: "basic",
    prerequisites: [],
  },
  {
    name: "Scikit-learn",
    description: "Utilisation de scikit-learn pour le ML",
    category: "ml",
    level: "intermediate",
    prerequisites: [],
  },
  {
    name: "TensorFlow",
    description: "Deep learning avec TensorFlow",
    category: "dl",
    level: "intermediate",
    prerequisites: [],
  },
  {
    name: "PyTorch",
    description: "Deep learning avec PyTorch",
    category: "dl",
    level: "intermediate",
    prerequisites: [],
  },
  {
    name: "Computer Vision Basics",
    description: "Fondamentaux du traitement d'images",
    category: "computer_vision",
    level: "basic",
    prerequisites: [],
  },
  {
    name: "NLP Fundamentals",
    description: "Bases du traitement du langage naturel",
    category: "nlp",
    level: "basic",
    prerequisites: [],
  },
  {
    name: "MLOps",
    description: "Déploiement et maintenance de modèles ML",
    category: "mlops",
    level: "advanced",
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
  {
    title: "Deep Learning Specialist",
    description: "Maîtrisez les architectures de réseaux de neurones avancées",
    category: "dl",
    level: "advanced",
    estimatedDuration: 16,
    prerequisites: [
      {
        category: "math",
        skills: [
          { name: "Algèbre linéaire", level: "advanced" },
          { name: "Calcul différentiel", level: "intermediate" },
        ],
      },
      {
        category: "programming",
        skills: [
          { name: "Python", level: "advanced" },
          { name: "PyTorch", level: "intermediate" },
        ],
      },
    ],
    modules: [
      {
        title: "Architectures CNN",
        description: "Réseaux de neurones convolutifs",
        duration: 25,
        skills: [
          { name: "PyTorch", level: "intermediate" },
          { name: "CNN", level: "advanced" },
        ],
        resources: [
          {
            title: "Deep Learning Book",
            type: "book",
            url: "https://www.deeplearningbook.org/",
            duration: 180,
          },
          {
            title: "CNN Architectures",
            type: "video",
            url: "https://www.coursera.org/learn/convolutional-neural-networks",
            duration: 120,
          },
        ],
        validationCriteria: [
          "Implémenter une architecture CNN",
          "Optimiser les hyperparamètres",
        ],
      },
    ],
    careerOpportunities: [
      {
        title: "DL Research Engineer",
        description: "R&D en deep learning",
        averageSalary: "60-90k€/an",
        companies: ["DeepMind", "OpenAI", "Google Brain"],
      },
    ],
  },
  {
    title: "Computer Vision Expert",
    description: "Spécialisez-vous en vision par ordinateur",
    category: "computer_vision",
    level: "advanced",
    estimatedDuration: 14,
    prerequisites: [
      {
        category: "math",
        skills: [
          { name: "Algèbre linéaire", level: "advanced" },
          { name: "Convolution", level: "intermediate" },
        ],
      },
      {
        category: "programming",
        skills: [
          { name: "Python", level: "advanced" },
          { name: "OpenCV", level: "intermediate" },
        ],
      },
    ],
    modules: [
      {
        title: "Détection d'objets",
        description: "Techniques modernes de détection d'objets",
        duration: 30,
        skills: [
          { name: "YOLO", level: "advanced" },
          { name: "PyTorch", level: "intermediate" },
        ],
        resources: [
          {
            title: "Object Detection Course",
            type: "course",
            url: "https://www.coursera.org/learn/object-detection",
            duration: 150,
          },
        ],
        validationCriteria: [
          "Implémenter YOLO",
          "Fine-tuner sur un dataset custom",
        ],
      },
    ],
    careerOpportunities: [
      {
        title: "Computer Vision Engineer",
        description: "Développement de solutions de vision par ordinateur",
        averageSalary: "55-85k€/an",
        companies: ["Tesla", "NVIDIA", "Intel"],
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
            text: "L'apprentissage supervisé est plus rapide que l'apprentissage non supervisé",
            isCorrect: false,
          },
        ],
        explanation:
          "L'apprentissage supervisé nécessite des données étiquetées pour entraîner le modèle, tandis que l'apprentissage non supervisé trouve des patterns dans des données non étiquetées.",
      },
      {
        text: "Qu'est-ce que le surapprentissage (overfitting) ?",
        options: [
          {
            text: "Le modèle apprend trop bien les données d'entraînement et généralise mal",
            isCorrect: true,
          },
          {
            text: "Le modèle n'apprend pas assez des données d'entraînement",
            isCorrect: false,
          },
        ],
        explanation:
          "Le surapprentissage se produit quand un modèle apprend trop spécifiquement les données d'entraînement et perd en capacité de généralisation.",
      },
    ],
  },
  {
    title: "Évaluation Deep Learning",
    category: "dl",
    difficulty: "intermediate",
    questions: [
      {
        text: "Quel est le rôle de la fonction d'activation dans un réseau de neurones ?",
        options: [
          {
            text: "Introduire de la non-linéarité dans le réseau",
            isCorrect: true,
          },
          {
            text: "Accélérer l'entraînement du modèle",
            isCorrect: false,
          },
        ],
        explanation:
          "Les fonctions d'activation introduisent des non-linéarités nécessaires pour que le réseau puisse apprendre des patterns complexes.",
      },
      {
        text: "Qu'est-ce que le dropout ?",
        options: [
          {
            text: "Une technique de régularisation qui désactive aléatoirement des neurones",
            isCorrect: true,
          },
          {
            text: "Une fonction d'activation",
            isCorrect: false,
          },
        ],
        explanation:
          "Le dropout est une technique de régularisation qui aide à prévenir le surapprentissage en désactivant aléatoirement des neurones pendant l'entraînement.",
      },
    ],
  },
  {
    title: "Évaluation Computer Vision",
    category: "computer_vision",
    difficulty: "advanced",
    questions: [
      {
        text: "Quel est le rôle principal des filtres de convolution ?",
        options: [
          {
            text: "Extraire des caractéristiques spécifiques des images",
            isCorrect: true,
          },
          {
            text: "Réduire la taille des images",
            isCorrect: false,
          },
        ],
        explanation:
          "Les filtres de convolution permettent d'extraire des caractéristiques spécifiques comme les bords, les textures, etc.",
      },
    ],
  },
  {
    title: "Évaluation NLP",
    category: "nlp",
    difficulty: "intermediate",
    questions: [
      {
        text: "Qu'est-ce que le word embedding ?",
        options: [
          {
            text: "Une représentation vectorielle des mots",
            isCorrect: true,
          },
          {
            text: "Une technique de compression de texte",
            isCorrect: false,
          },
        ],
        explanation:
          "Le word embedding transforme les mots en vecteurs denses qui capturent leur sens et leurs relations.",
      },
    ],
  },
];

const quizzes = [
  {
    moduleId: "0",
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
          {
            text: "R-squared",
            isCorrect: false,
          },
        ],
        explanation:
          "Le F1-Score est plus approprié car il prend en compte à la fois la précision et le rappel, particulièrement important pour les datasets déséquilibrés.",
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
          {
            text: "Support Vector Machine",
            isCorrect: false,
          },
        ],
        explanation:
          "K-means est un algorithme de clustering qui ne nécessite pas de données étiquetées, ce qui en fait un exemple d'apprentissage non supervisé.",
      },
      {
        text: "Quelle est la principale différence entre la validation croisée et le hold-out set ?",
        options: [
          {
            text: "La validation croisée utilise plusieurs partitions des données pour une évaluation plus robuste",
            isCorrect: true,
          },
          {
            text: "La validation croisée est plus rapide que le hold-out set",
            isCorrect: false,
          },
          {
            text: "Le hold-out set donne toujours de meilleurs résultats",
            isCorrect: false,
          },
          {
            text: "Il n'y a pas de différence significative",
            isCorrect: false,
          },
        ],
        explanation:
          "La validation croisée divise les données en k partitions et utilise chaque partition comme ensemble de test, offrant une évaluation plus robuste du modèle.",
      },
    ],
  },
  {
    moduleId: "0",
    title: "Quiz Architectures CNN",
    description:
      "Évaluez votre compréhension des réseaux de neurones convolutifs",
    timeLimit: 2400,
    passingScore: 75,
    questions: [
      {
        text: "Quel est le rôle principal des couches de convolution dans un CNN ?",
        options: [
          {
            text: "Extraire des caractéristiques hiérarchiques des images",
            isCorrect: true,
          },
          {
            text: "Réduire la taille des images",
            isCorrect: false,
          },
          {
            text: "Normaliser les valeurs des pixels",
            isCorrect: false,
          },
          {
            text: "Augmenter la résolution des images",
            isCorrect: false,
          },
        ],
        explanation:
          "Les couches de convolution permettent d'extraire des caractéristiques de plus en plus complexes et abstraites à mesure qu'on avance dans le réseau.",
      },
      {
        text: "Pourquoi utilise-t-on le pooling dans les CNN ?",
        options: [
          {
            text: "Réduire la dimensionnalité et rendre le modèle plus robuste",
            isCorrect: true,
          },
          {
            text: "Augmenter la taille des feature maps",
            isCorrect: false,
          },
          {
            text: "Remplacer les couches de convolution",
            isCorrect: false,
          },
          {
            text: "Ajouter plus de paramètres au modèle",
            isCorrect: false,
          },
        ],
        explanation:
          "Le pooling réduit la taille des feature maps tout en préservant les informations importantes, ce qui aide à réduire le surapprentissage.",
      },
    ],
  },
  {
    moduleId: "0",
    title: "Quiz Détection d'Objets",
    description:
      "Testez vos connaissances sur les techniques de détection d'objets",
    timeLimit: 1800,
    passingScore: 70,
    questions: [
      {
        text: "Quelle est la principale innovation de YOLO par rapport aux méthodes traditionnelles ?",
        options: [
          {
            text: "La détection en une seule passe sur l'image",
            isCorrect: true,
          },
          {
            text: "Une meilleure précision que tous les autres modèles",
            isCorrect: false,
          },
          {
            text: "L'utilisation exclusive de CNN",
            isCorrect: false,
          },
          {
            text: "La suppression des anchor boxes",
            isCorrect: false,
          },
        ],
        explanation:
          "YOLO (You Only Look Once) traite l'image en une seule passe, ce qui le rend beaucoup plus rapide que les approches à deux étapes comme R-CNN.",
      },
    ],
  },
  {
    moduleId: "0",
    title: "Quiz NLP Avancé",
    description: "Testez vos connaissances en NLP",
    timeLimit: 1800,
    passingScore: 70,
    questions: [
      {
        text: "Quelle est la principale innovation des transformers ?",
        options: [
          {
            text: "Le mécanisme d'attention",
            isCorrect: true,
          },
          {
            text: "Les réseaux récurrents",
            isCorrect: false,
          },
          {
            text: "Le word2vec",
            isCorrect: false,
          },
        ],
        explanation:
          "Le mécanisme d'attention permet aux transformers de traiter efficacement les dépendances à long terme dans les séquences.",
      },
    ],
  },
  {
    moduleId: "0",
    title: "Quiz MLOps",
    description: "Évaluez vos connaissances en MLOps",
    timeLimit: 1800,
    passingScore: 75,
    questions: [
      {
        text: "Quel est l'intérêt principal du versioning des données ?",
        options: [
          {
            text: "Assurer la reproductibilité des expériences",
            isCorrect: true,
          },
          {
            text: "Réduire l'espace de stockage",
            isCorrect: false,
          },
          {
            text: "Accélérer l'entraînement",
            isCorrect: false,
          },
        ],
        explanation:
          "Le versioning des données permet de reproduire exactement les conditions d'entraînement d'un modèle.",
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

    // Map quizzes to modules more accurately
    const quizzesWithModuleIds = [];

    createdGoals.forEach(goal => {
      goal.modules.forEach((module, moduleIndex) => {
        // Find matching quiz for this module based on title/content
        const matchingQuiz = quizzes.find(quiz => {
          if (goal.category === "ml" && quiz.title.includes("ML")) {
            return true;
          } else if (goal.category === "dl" && quiz.title.includes("CNN")) {
            return true;
          } else if (
            goal.category === "computer_vision" &&
            quiz.title.includes("Détection")
          ) {
            return true;
          }
          return false;
        });

        if (matchingQuiz) {
          quizzesWithModuleIds.push({
            ...matchingQuiz,
            moduleId: module._id.toString(), // Use actual module ID
          });
        }
      });
    });

    const createdQuizzes = await Quiz.create(quizzesWithModuleIds);
    logger.info(`Created ${createdQuizzes.length} quizzes`);

    const createdAssessments = await Assessment.create(assessments);
    logger.info(`Created ${createdAssessments.length} assessments`);

    // Create profiles for all users
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
