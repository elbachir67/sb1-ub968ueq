import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import {
  User,
  Goal,
  Assessment,
  Quiz,
  Pathway,
  Concept,
  LearnerProfile,
} from "../models/index.js";
import { logger } from "../utils/logger.js";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/ucad_ia";

const completeData = {
  users: [
    {
      email: "student1@ucad.edu.sn",
      password: "Student123!",
      role: "user",
      isActive: true,
      firstName: "Amadou",
      lastName: "Diop",
    },
    {
      email: "student2@ucad.edu.sn",
      password: "Student123!",
      role: "user",
      isActive: true,
      firstName: "Fatou",
      lastName: "Sow",
    },
    {
      email: "student3@ucad.edu.sn",
      password: "Student123!",
      role: "user",
      isActive: true,
      firstName: "Omar",
      lastName: "Ba",
    },
    {
      email: "student4@ucad.edu.sn",
      password: "Student123!",
      role: "user",
      isActive: true,
      firstName: "Mariama",
      lastName: "Ndiaye",
    },
    {
      email: "student5@ucad.edu.sn",
      password: "Student123!",
      role: "user",
      isActive: true,
      firstName: "Ibrahima",
      lastName: "Fall",
    },
    {
      email: "inactive@ucad.edu.sn",
      password: "Student123!",
      role: "user",
      isActive: false,
      firstName: "Unused",
      lastName: "Account",
    },
    {
      email: "teacher@ucad.edu.sn",
      password: "Teacher123!",
      role: "user",
      isActive: true,
      firstName: "Pierre",
      lastName: "Mendy",
    },
    {
      email: "admin@ucad.edu.sn",
      password: "Admin123!",
      role: "admin",
      isActive: true,
      firstName: "Admin",
      lastName: "System",
    },
  ],

  concepts: [
    // Mathématiques
    {
      name: "Algèbre Linéaire",
      description: "Fondements de l'algèbre linéaire pour l'IA",
      category: "mathematics",
      level: "basic",
      prerequisites: [],
    },
    {
      name: "Calcul Différentiel",
      description: "Bases du calcul différentiel et optimisation",
      category: "mathematics",
      level: "intermediate",
      prerequisites: ["Algèbre Linéaire"],
    },
    {
      name: "Probabilités et Statistiques",
      description: "Concepts fondamentaux des probabilités et statistiques",
      category: "mathematics",
      level: "intermediate",
      prerequisites: ["Algèbre Linéaire"],
    },
    {
      name: "Optimisation",
      description: "Techniques d'optimisation avancées pour l'IA",
      category: "mathematics",
      level: "advanced",
      prerequisites: ["Calcul Différentiel", "Probabilités et Statistiques"],
    },

    // Programmation
    {
      name: "Python Programming",
      description: "Programmation Python pour le ML",
      category: "programming",
      level: "basic",
      prerequisites: [],
    },
    {
      name: "Data Structures & Algorithms",
      description: "Structures de données et algorithmes essentiels",
      category: "programming",
      level: "intermediate",
      prerequisites: ["Python Programming"],
    },
    {
      name: "Software Engineering for ML",
      description:
        "Bonnes pratiques d'ingénierie logicielle pour les projets ML",
      category: "programming",
      level: "advanced",
      prerequisites: ["Python Programming", "Data Structures & Algorithms"],
    },

    // Machine Learning
    {
      name: "ML Fundamentals",
      description: "Concepts fondamentaux du Machine Learning",
      category: "ml",
      level: "basic",
      prerequisites: ["Algèbre Linéaire", "Python Programming"],
    },
    {
      name: "Supervised Learning",
      description: "Méthodes avancées d'apprentissage supervisé",
      category: "ml",
      level: "intermediate",
      prerequisites: ["ML Fundamentals", "Probabilités et Statistiques"],
    },
    {
      name: "Unsupervised Learning",
      description: "Méthodes d'apprentissage non supervisé",
      category: "ml",
      level: "intermediate",
      prerequisites: ["ML Fundamentals"],
    },
    {
      name: "Reinforcement Learning",
      description: "Apprentissage par renforcement",
      category: "ml",
      level: "advanced",
      prerequisites: ["Supervised Learning", "Optimisation"],
    },

    // Deep Learning
    {
      name: "Deep Learning Basics",
      description: "Introduction aux réseaux de neurones",
      category: "dl",
      level: "intermediate",
      prerequisites: ["ML Fundamentals", "Calcul Différentiel"],
    },
    {
      name: "Convolutional Neural Networks",
      description:
        "Réseaux de neurones convolutifs pour la vision par ordinateur",
      category: "dl",
      level: "advanced",
      prerequisites: ["Deep Learning Basics"],
    },
    {
      name: "Recurrent Neural Networks",
      description: "Réseaux de neurones récurrents pour les séquences",
      category: "dl",
      level: "advanced",
      prerequisites: ["Deep Learning Basics"],
    },

    // NLP
    {
      name: "NLP Fundamentals",
      description: "Bases du traitement du langage naturel",
      category: "nlp",
      level: "intermediate",
      prerequisites: ["ML Fundamentals"],
    },
    {
      name: "Transformers & Attention",
      description: "Architectures Transformer et mécanismes d'attention",
      category: "nlp",
      level: "advanced",
      prerequisites: ["NLP Fundamentals", "Deep Learning Basics"],
    },

    // Computer Vision
    {
      name: "Computer Vision Basics",
      description: "Fondamentaux de la vision par ordinateur",
      category: "computer_vision",
      level: "basic",
      prerequisites: [],
    },
    {
      name: "Advanced Computer Vision",
      description: "Techniques avancées de vision par ordinateur",
      category: "computer_vision",
      level: "advanced",
      prerequisites: [
        "Computer Vision Basics",
        "Convolutional Neural Networks",
      ],
    },
  ],

  goals: [
    // ML Track
    {
      title: "Machine Learning Engineer",
      description:
        "Maîtrisez les fondamentaux du ML et développez des compétences pratiques pour construire des systèmes prédictifs",
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
            { name: "NumPy", level: "basic" },
          ],
        },
      ],
      modules: [
        {
          title: "Introduction au ML",
          description:
            "Fondamentaux du Machine Learning et premiers algorithmes",
          duration: 20,
          skills: [
            { name: "Python", level: "intermediate" },
            { name: "Scikit-learn", level: "basic" },
          ],
          resources: [
            {
              title: "Machine Learning Foundations",
              type: "course",
              url: "https://example.com/ml-foundations",
              duration: 120,
            },
            {
              title: "Introduction to Statistical Learning",
              type: "book",
              url: "https://example.com/isl-book",
              duration: 240,
            },
            {
              title: "Supervised Learning Algorithms",
              type: "video",
              url: "https://example.com/supervised-learning",
              duration: 90,
            },
          ],
          validationCriteria: [
            "Comprendre les types d'apprentissage",
            "Implémenter des modèles de base",
            "Évaluer la performance des modèles",
          ],
        },
        {
          title: "Modèles de régression et classification",
          description: "Approfondissement des techniques supervisées",
          duration: 15,
          skills: [
            { name: "Modélisation statistique", level: "intermediate" },
            { name: "Pandas", level: "intermediate" },
          ],
          resources: [
            {
              title: "Regression Models Tutorial",
              type: "tutorial",
              url: "https://example.com/regression-tutorial",
              duration: 90,
            },
            {
              title: "Classification Hands-on",
              type: "practice",
              url: "https://example.com/classification-lab",
              duration: 120,
            },
          ],
          validationCriteria: [
            "Implémenter différents modèles de régression",
            "Construire des classifieurs performants",
            "Évaluer et comparer des modèles",
          ],
        },
        {
          title: "Feature Engineering et préparation des données",
          description: "Techniques pour transformer et préparer les données",
          duration: 18,
          skills: [
            { name: "Data Cleaning", level: "intermediate" },
            { name: "Feature Selection", level: "intermediate" },
          ],
          resources: [
            {
              title: "Feature Engineering for ML",
              type: "book",
              url: "https://example.com/feature-engineering",
              duration: 180,
            },
            {
              title: "Data Preprocessing Workshop",
              type: "tutorial",
              url: "https://example.com/data-preprocessing",
              duration: 120,
            },
          ],
          validationCriteria: [
            "Nettoyer efficacement des données brutes",
            "Créer des features pertinentes",
            "Gérer les valeurs manquantes et aberrantes",
          ],
        },
      ],
      careerOpportunities: [
        {
          title: "ML Engineer",
          description:
            "Développement de modèles ML pour applications industrielles",
          averageSalary: "45-75k€/an",
          companies: ["Google", "Amazon", "Meta", "IBM"],
        },
        {
          title: "Data Scientist",
          description: "Analyse de données et modélisation prédictive",
          averageSalary: "40-70k€/an",
          companies: ["Microsoft", "IBM", "Orange", "Société Générale"],
        },
      ],
    },
    {
      title: "Data Scientist",
      description:
        "Développez des compétences en analyse de données et modélisation statistique",
      category: "ml",
      level: "intermediate",
      estimatedDuration: 14,
      prerequisites: [
        {
          category: "math",
          skills: [
            { name: "Statistiques", level: "intermediate" },
            { name: "Algèbre linéaire", level: "basic" },
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
          title: "Analyse exploratoire des données",
          description: "Techniques pour explorer et visualiser des données",
          duration: 22,
          skills: [
            { name: "Pandas", level: "intermediate" },
            { name: "Data Visualization", level: "intermediate" },
          ],
          resources: [
            {
              title: "Exploratory Data Analysis",
              type: "course",
              url: "https://example.com/eda-course",
              duration: 150,
            },
            {
              title: "Data Visualization with Python",
              type: "tutorial",
              url: "https://example.com/dataviz-python",
              duration: 120,
            },
          ],
          validationCriteria: [
            "Effectuer une analyse exploratoire complète",
            "Créer des visualisations informatives",
            "Identifier des patterns dans les données",
          ],
        },
        {
          title: "Modélisation statistique",
          description: "Fondements de la modélisation statistique",
          duration: 25,
          skills: [
            { name: "Statistical Testing", level: "intermediate" },
            { name: "Regression Analysis", level: "intermediate" },
          ],
          resources: [
            {
              title: "Statistical Modeling in Python",
              type: "book",
              url: "https://example.com/statistical-modeling",
              duration: 200,
            },
            {
              title: "Hypothesis Testing Workshop",
              type: "tutorial",
              url: "https://example.com/hypothesis-testing",
              duration: 90,
            },
          ],
          validationCriteria: [
            "Effectuer des tests statistiques appropriés",
            "Construire et interpréter des modèles de régression",
            "Évaluer la significativité des résultats",
          ],
        },
      ],
      careerOpportunities: [
        {
          title: "Data Scientist",
          description:
            "Analyse de données et développement de modèles prédictifs",
          averageSalary: "40-75k€/an",
          companies: ["Amazon", "IBM", "Facebook", "Netflix"],
        },
        {
          title: "Analytics Consultant",
          description: "Conseil en analyse de données et business intelligence",
          averageSalary: "45-80k€/an",
          companies: ["McKinsey", "BCG", "Deloitte", "Accenture"],
        },
      ],
    },

    // Deep Learning Track
    {
      title: "Deep Learning Specialist",
      description:
        "Maîtrisez les réseaux de neurones et les architectures avancées pour l'IA",
      category: "dl",
      level: "advanced",
      estimatedDuration: 16,
      prerequisites: [
        {
          category: "math",
          skills: [
            { name: "Calcul différentiel", level: "advanced" },
            { name: "Algèbre linéaire", level: "advanced" },
          ],
        },
        {
          category: "programming",
          skills: [
            { name: "Python", level: "advanced" },
            { name: "PyTorch ou TensorFlow", level: "intermediate" },
          ],
        },
      ],
      modules: [
        {
          title: "Réseaux de Neurones Fondamentaux",
          description: "Principes et implémentation des réseaux de neurones",
          duration: 25,
          skills: [
            { name: "PyTorch", level: "intermediate" },
            { name: "Backpropagation", level: "intermediate" },
          ],
          resources: [
            {
              title: "Deep Learning Book",
              type: "book",
              url: "https://example.com/dl-book",
              duration: 180,
            },
            {
              title: "Neural Networks from Scratch",
              type: "tutorial",
              url: "https://example.com/nn-scratch",
              duration: 150,
            },
            {
              title: "PyTorch Fundamentals",
              type: "course",
              url: "https://example.com/pytorch-fundamentals",
              duration: 120,
            },
          ],
          validationCriteria: [
            "Comprendre l'architecture des réseaux de neurones",
            "Implémenter un MLP from scratch",
            "Utiliser PyTorch efficacement",
          ],
        },
        {
          title: "CNN et Vision par Ordinateur",
          description: "Réseaux convolutifs pour l'analyse d'images",
          duration: 30,
          skills: [
            { name: "CNN", level: "advanced" },
            { name: "Computer Vision", level: "intermediate" },
          ],
          resources: [
            {
              title: "CNN Architecture Guide",
              type: "tutorial",
              url: "https://example.com/cnn-guide",
              duration: 120,
            },
            {
              title: "Advanced Computer Vision Projects",
              type: "project",
              url: "https://example.com/cv-projects",
              duration: 200,
            },
          ],
          validationCriteria: [
            "Concevoir et entraîner des CNN",
            "Implémenter des applications de vision par ordinateur",
            "Utiliser les techniques de transfer learning",
          ],
        },
      ],
      careerOpportunities: [
        {
          title: "Deep Learning Engineer",
          description: "Conception de réseaux de neurones complexes",
          averageSalary: "60-95k€/an",
          companies: ["OpenAI", "DeepMind", "Google Brain", "NVIDIA"],
        },
        {
          title: "Computer Vision Specialist",
          description: "Développement de systèmes d'analyse d'images",
          averageSalary: "55-90k€/an",
          companies: ["Tesla", "NVIDIA", "Meta Reality Labs", "Apple"],
        },
      ],
    },

    // NLP Track
    {
      title: "NLP Specialist",
      description:
        "Devenez expert en traitement du langage naturel et modèles de langage",
      category: "nlp",
      level: "advanced",
      estimatedDuration: 14,
      prerequisites: [
        {
          category: "math",
          skills: [
            { name: "Probabilités", level: "advanced" },
            { name: "Algèbre linéaire", level: "intermediate" },
          ],
        },
        {
          category: "programming",
          skills: [
            { name: "Python", level: "advanced" },
            { name: "Deep Learning", level: "intermediate" },
          ],
        },
      ],
      modules: [
        {
          title: "Fondamentaux du NLP",
          description: "Concepts de base du traitement du langage",
          duration: 20,
          skills: [
            { name: "Text Processing", level: "intermediate" },
            { name: "Word Embeddings", level: "intermediate" },
          ],
          resources: [
            {
              title: "NLP Fundamentals",
              type: "course",
              url: "https://example.com/nlp-fundamentals",
              duration: 150,
            },
            {
              title: "Word Embeddings Tutorial",
              type: "tutorial",
              url: "https://example.com/word-embeddings",
              duration: 90,
            },
          ],
          validationCriteria: [
            "Implémenter des pipelines de traitement de texte",
            "Utiliser et comprendre les word embeddings",
            "Développer des classifieurs de texte",
          ],
        },
        {
          title: "Architectures Transformer",
          description: "Comprendre et utiliser les transformers",
          duration: 35,
          skills: [
            { name: "Transformers", level: "advanced" },
            { name: "Attention Mechanism", level: "advanced" },
          ],
          resources: [
            {
              title: "Transformer Architecture",
              type: "tutorial",
              url: "https://example.com/transformer-guide",
              duration: 120,
            },
            {
              title: "Implementing BERT",
              type: "course",
              url: "https://example.com/bert-implementation",
              duration: 180,
            },
          ],
          validationCriteria: [
            "Comprendre l'architecture Transformer",
            "Implémenter l'attention multi-têtes",
            "Utiliser les modèles pré-entraînés HuggingFace",
          ],
        },
      ],
      careerOpportunities: [
        {
          title: "NLP Engineer",
          description: "Développement de solutions de traitement du langage",
          averageSalary: "55-90k€/an",
          companies: ["Hugging Face", "OpenAI", "Anthropic", "Google"],
        },
        {
          title: "Conversational AI Developer",
          description: "Conception de systèmes conversationnels intelligents",
          averageSalary: "50-85k€/an",
          companies: [
            "Microsoft",
            "Google Assistant",
            "Amazon Alexa",
            "IBM Watson",
          ],
        },
      ],
    },

    // Computer Vision Track
    {
      title: "Computer Vision Expert",
      description:
        "Spécialisez-vous dans les systèmes de vision par ordinateur avancés",
      category: "computer_vision",
      level: "advanced",
      estimatedDuration: 15,
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
            { name: "Deep Learning", level: "intermediate" },
          ],
        },
      ],
      modules: [
        {
          title: "Traitement d'Image Fondamental",
          description: "Bases du traitement d'images numériques",
          duration: 18,
          skills: [
            { name: "Image Processing", level: "intermediate" },
            { name: "OpenCV", level: "intermediate" },
          ],
          resources: [
            {
              title: "Digital Image Processing",
              type: "course",
              url: "https://example.com/image-processing",
              duration: 140,
            },
            {
              title: "OpenCV Tutorials",
              type: "tutorial",
              url: "https://example.com/opencv-tutorials",
              duration: 100,
            },
          ],
          validationCriteria: [
            "Implémenter des algorithmes de traitement d'image",
            "Utiliser OpenCV efficacement",
            "Appliquer des filtres et transformations d'images",
          ],
        },
        {
          title: "Détection et Segmentation d'Objets",
          description: "Techniques avancées de détection et segmentation",
          duration: 25,
          skills: [
            { name: "Object Detection", level: "advanced" },
            { name: "Instance Segmentation", level: "advanced" },
          ],
          resources: [
            {
              title: "YOLO Object Detection",
              type: "tutorial",
              url: "https://example.com/yolo-tutorial",
              duration: 120,
            },
            {
              title: "Mask R-CNN Implementation",
              type: "tutorial",
              url: "https://example.com/mask-rcnn",
              duration: 150,
            },
          ],
          validationCriteria: [
            "Implémenter et entraîner des modèles de détection d'objets",
            "Développer des solutions de segmentation",
            "Évaluer les performances avec les métriques appropriées",
          ],
        },
      ],
      careerOpportunities: [
        {
          title: "Computer Vision Engineer",
          description: "Développement de systèmes de vision par ordinateur",
          averageSalary: "50-85k€/an",
          companies: ["NVIDIA", "Tesla", "Meta Reality Labs", "Google"],
        },
        {
          title: "AI Robotics Specialist",
          description:
            "Intégration de la vision par ordinateur dans la robotique",
          averageSalary: "55-95k€/an",
          companies: ["Boston Dynamics", "ABB", "Siemens", "Toyota Research"],
        },
      ],
    },
  ],

  assessments: [
    // Mathématiques
    {
      title: "Évaluation Mathématiques pour l'IA - Débutant",
      category: "math",
      difficulty: "basic",
      questions: [
        {
          text: "Quelle opération mathématique est fondamentale pour calculer la distance entre deux points ?",
          options: [
            {
              text: "La racine carrée de la somme des carrés des différences",
              isCorrect: true,
            },
            { text: "La somme des différences absolues", isCorrect: false },
            { text: "Le produit des coordonnées", isCorrect: false },
          ],
          explanation:
            "La distance euclidienne entre deux points est calculée comme la racine carrée de la somme des carrés des différences entre leurs coordonnées correspondantes.",
        },
        {
          text: "Quelle est la différence entre une matrice et un vecteur ?",
          options: [
            {
              text: "Un vecteur est unidimensionnel, une matrice est bidimensionnelle",
              isCorrect: true,
            },
            { text: "Il n'y a aucune différence", isCorrect: false },
            {
              text: "Une matrice ne peut contenir que des nombres entiers",
              isCorrect: false,
            },
          ],
          explanation:
            "Un vecteur est une structure unidimensionnelle (1D) tandis qu'une matrice est bidimensionnelle (2D), organisée en lignes et colonnes.",
        },
        {
          text: "Qu'est-ce que le produit scalaire de deux vecteurs ?",
          options: [
            {
              text: "La somme des produits des composantes correspondantes",
              isCorrect: true,
            },
            { text: "La différence des composantes", isCorrect: false },
            { text: "Le produit des longueurs des vecteurs", isCorrect: false },
          ],
          explanation:
            "Le produit scalaire est la somme des produits des composantes correspondantes des vecteurs, donnant un nombre scalaire.",
        },
      ],
    },
    {
      title: "Évaluation Mathématiques pour l'IA - Intermédiaire",
      category: "math",
      difficulty: "intermediate",
      questions: [
        {
          text: "Quelle est la dérivée de la fonction sigmoid σ(x) = 1/(1+e^(-x)) ?",
          options: [
            { text: "σ(x)(1-σ(x))", isCorrect: true },
            { text: "σ(x)²", isCorrect: false },
            { text: "1-σ(x)", isCorrect: false },
          ],
          explanation:
            "La dérivée de la fonction sigmoid est σ(x)(1-σ(x)), ce qui est important pour calculer les gradients dans les réseaux de neurones.",
        },
        {
          text: "Comment calcule-t-on le gradient d'une fonction f(x,y) ?",
          options: [
            {
              text: "Le vecteur des dérivées partielles (∂f/∂x, ∂f/∂y)",
              isCorrect: true,
            },
            {
              text: "La somme des dérivées partielles ∂f/∂x + ∂f/∂y",
              isCorrect: false,
            },
            {
              text: "Le produit des dérivées partielles ∂f/∂x × ∂f/∂y",
              isCorrect: false,
            },
          ],
          explanation:
            "Le gradient d'une fonction multivariable est le vecteur de ses dérivées partielles, indiquant la direction de la plus forte pente.",
        },
      ],
    },

    // ML
    {
      title: "Évaluation Machine Learning Fondamental",
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
            {
              text: "L'apprentissage non supervisé nécessite plus de données",
              isCorrect: false,
            },
          ],
          explanation:
            "L'apprentissage supervisé utilise des données étiquetées pour entraîner le modèle, tandis que l'apprentissage non supervisé trouve des patterns dans des données non étiquetées.",
        },
        {
          text: "Qu'est-ce que la validation croisée ?",
          options: [
            {
              text: "Une technique pour évaluer la performance d'un modèle sur différents sous-ensembles de données",
              isCorrect: true,
            },
            { text: "Une méthode pour nettoyer les données", isCorrect: false },
            { text: "Un algorithme d'optimisation", isCorrect: false },
          ],
          explanation:
            "La validation croisée divise les données en plusieurs sous-ensembles pour évaluer la performance du modèle de manière plus robuste.",
        },
        {
          text: "Quel algorithme est couramment utilisé pour la classification binaire ?",
          options: [
            { text: "Régression logistique", isCorrect: true },
            { text: "K-means", isCorrect: false },
            { text: "PCA", isCorrect: false },
          ],
          explanation:
            "La régression logistique est un algorithme couramment utilisé pour la classification binaire.",
        },
      ],
    },
    {
      title: "Évaluation ML Avancée",
      category: "ml",
      difficulty: "advanced",
      questions: [
        {
          text: "Quelle technique est efficace pour traiter le déséquilibre de classes ?",
          options: [
            {
              text: "SMOTE (Synthetic Minority Over-sampling Technique)",
              isCorrect: true,
            },
            { text: "Augmenter le taux d'apprentissage", isCorrect: false },
            { text: "Réduire la taille du batch", isCorrect: false },
          ],
          explanation:
            "SMOTE génère des exemples synthétiques de la classe minoritaire pour équilibrer le dataset, améliorant ainsi la performance sur des données déséquilibrées.",
        },
        {
          text: "Qu'est-ce que l'apprentissage par ensemble (ensemble learning) ?",
          options: [
            {
              text: "Combiner plusieurs modèles pour améliorer les performances et la robustesse",
              isCorrect: true,
            },
            {
              text: "Entraîner un seul modèle sur plusieurs jeux de données",
              isCorrect: false,
            },
            {
              text: "Utiliser un seul modèle avec plusieurs couches",
              isCorrect: false,
            },
          ],
          explanation:
            "L'apprentissage par ensemble combine les prédictions de plusieurs modèles pour obtenir de meilleures performances que n'importe quel modèle individuel.",
        },
      ],
    },

    // Deep Learning
    {
      title: "Évaluation Deep Learning Fondamental",
      category: "dl",
      difficulty: "intermediate",
      questions: [
        {
          text: "Qu'est-ce qu'une fonction d'activation dans un réseau de neurones ?",
          options: [
            {
              text: "Une fonction qui introduit de la non-linéarité dans le réseau",
              isCorrect: true,
            },
            { text: "Une fonction qui initialise les poids", isCorrect: false },
            {
              text: "Une fonction qui détermine la taille du réseau",
              isCorrect: false,
            },
          ],
          explanation:
            "La fonction d'activation introduit de la non-linéarité dans le réseau, permettant d'apprendre des patterns complexes.",
        },
        {
          text: "Quel est le rôle du dropout dans un réseau de neurones ?",
          options: [
            {
              text: "Prévenir le surapprentissage en désactivant aléatoirement des neurones",
              isCorrect: true,
            },
            { text: "Accélérer l'apprentissage", isCorrect: false },
            { text: "Réduire la taille du modèle", isCorrect: false },
          ],
          explanation:
            "Le dropout est une technique de régularisation qui prévient le surapprentissage en désactivant aléatoirement des neurones pendant l'entraînement.",
        },
        {
          text: "Quelle est la fonction de la couche de pooling dans un CNN ?",
          options: [
            {
              text: "Réduire la dimensionnalité et rendre le réseau plus robuste",
              isCorrect: true,
            },
            { text: "Augmenter la taille des feature maps", isCorrect: false },
            { text: "Ajouter des biais au modèle", isCorrect: false },
          ],
          explanation:
            "La couche de pooling réduit la dimensionnalité des feature maps et rend le réseau plus robuste aux petites variations dans l'entrée.",
        },
      ],
    },

    // NLP
    {
      title: "Évaluation NLP Fondamentale",
      category: "nlp",
      difficulty: "intermediate",
      questions: [
        {
          text: "Qu'est-ce qu'un word embedding ?",
          options: [
            {
              text: "Une représentation vectorielle de mots capturant la sémantique",
              isCorrect: true,
            },
            { text: "Un algorithme de traduction", isCorrect: false },
            { text: "Une technique de compression de texte", isCorrect: false },
          ],
          explanation:
            "Les word embeddings sont des représentations vectorielles denses qui capturent les relations sémantiques entre les mots.",
        },
        {
          text: "Quelle est la principale innovation des modèles Transformer ?",
          options: [
            {
              text: "Le mécanisme d'attention qui permet de capturer les dépendances à longue distance",
              isCorrect: true,
            },
            {
              text: "L'utilisation de convolutions pour traiter le texte",
              isCorrect: false,
            },
            { text: "Le traitement séquentiel du texte", isCorrect: false },
          ],
          explanation:
            "Le mécanisme d'attention des Transformers permet de modéliser efficacement les dépendances à longue distance dans le texte, sans recourir à une architecture récurrente.",
        },
      ],
    },

    // Computer Vision
    {
      title: "Évaluation Computer Vision Fondamentale",
      category: "computer_vision",
      difficulty: "intermediate",
      questions: [
        {
          text: "Quelle est la différence entre la classification d'images et la détection d'objets ?",
          options: [
            {
              text: "La classification identifie le contenu global de l'image, la détection localise et identifie des objets spécifiques",
              isCorrect: true,
            },
            {
              text: "La classification est plus précise que la détection",
              isCorrect: false,
            },
            {
              text: "La détection utilise uniquement des CNNs, pas la classification",
              isCorrect: false,
            },
          ],
          explanation:
            "La classification attribue une étiquette à l'image entière, tandis que la détection localise et identifie plusieurs objets dans une image avec leurs positions.",
        },
        {
          text: "Qu'est-ce que le transfer learning en vision par ordinateur ?",
          options: [
            {
              text: "Utiliser un modèle pré-entraîné sur un large dataset comme point de départ pour une nouvelle tâche",
              isCorrect: true,
            },
            {
              text: "Transférer des images d'un format à un autre",
              isCorrect: false,
            },
            { text: "Combiner plusieurs modèles de vision", isCorrect: false },
          ],
          explanation:
            "Le transfer learning réutilise les connaissances d'un modèle pré-entraîné (souvent sur ImageNet) pour accélérer l'apprentissage sur une nouvelle tâche avec moins de données.",
        },
      ],
    },
  ],

  quizzes: [
    // ML Quizzes
    {
      moduleId: "0", // Introduction au ML
      title: "Introduction au Machine Learning",
      description:
        "Testez vos connaissances sur les concepts fondamentaux du ML",
      timeLimit: 1800,
      passingScore: 70,
      questions: [
        {
          text: "Quelle est la différence principale entre l'apprentissage supervisé et non supervisé ?",
          options: [
            {
              text: "L'apprentissage supervisé utilise des données étiquetées, l'apprentissage non supervisé non",
              isCorrect: true,
            },
            {
              text: "L'apprentissage supervisé est plus rapide",
              isCorrect: false,
            },
            {
              text: "L'apprentissage non supervisé nécessite plus de données",
              isCorrect: false,
            },
          ],
          explanation:
            "L'apprentissage supervisé utilise des données étiquetées pour entraîner le modèle, tandis que l'apprentissage non supervisé trouve des patterns dans des données non étiquetées.",
        },
        {
          text: "Qu'est-ce que la validation croisée ?",
          options: [
            {
              text: "Une technique pour évaluer la performance d'un modèle sur différents sous-ensembles de données",
              isCorrect: true,
            },
            {
              text: "Une méthode pour nettoyer les données",
              isCorrect: false,
            },
            {
              text: "Un algorithme d'optimisation",
              isCorrect: false,
            },
          ],
          explanation:
            "La validation croisée divise les données en plusieurs sous-ensembles pour évaluer la performance du modèle de manière plus robuste.",
        },
        {
          text: "Quel algorithme est couramment utilisé pour la classification binaire ?",
          options: [
            {
              text: "Régression logistique",
              isCorrect: true,
            },
            {
              text: "K-means",
              isCorrect: false,
            },
            {
              text: "PCA",
              isCorrect: false,
            },
          ],
          explanation:
            "La régression logistique est un algorithme couramment utilisé pour la classification binaire.",
        },
      ],
    },
    {
      moduleId: "1", // Modèles de régression et classification
      title: "Modèles de Régression et Classification",
      description:
        "Évaluez votre compréhension des techniques de modélisation supervisée",
      timeLimit: 2100,
      passingScore: 75,
      questions: [
        {
          text: "Quelle est la différence entre la régression linéaire et la régression logistique ?",
          options: [
            {
              text: "La régression linéaire prédit une valeur continue, la régression logistique prédit une probabilité",
              isCorrect: true,
            },
            {
              text: "La régression linéaire est plus rapide à entraîner",
              isCorrect: false,
            },
            {
              text: "La régression logistique ne peut pas être utilisée pour la classification",
              isCorrect: false,
            },
          ],
          explanation:
            "La régression linéaire prédit une valeur numérique continue, tandis que la régression logistique produit une probabilité entre 0 et 1, souvent utilisée pour la classification binaire.",
        },
        {
          text: "Quelle métrique est la plus appropriée pour évaluer un modèle de régression ?",
          options: [
            {
              text: "RMSE (Root Mean Squared Error)",
              isCorrect: true,
            },
            {
              text: "Précision (Accuracy)",
              isCorrect: false,
            },
            {
              text: "F1-score",
              isCorrect: false,
            },
          ],
          explanation:
            "Le RMSE est une métrique standard pour évaluer les modèles de régression, mesurant l'écart quadratique moyen entre les prédictions et les valeurs réelles.",
        },
      ],
    },

    // DL Quizzes
    {
      moduleId: "2", // Fondamentaux des réseaux de neurones
      title: "Fondamentaux des Réseaux de Neurones",
      description:
        "Évaluez votre compréhension des concepts de base du deep learning",
      timeLimit: 2400,
      passingScore: 75,
      questions: [
        {
          text: "Qu'est-ce qu'une fonction d'activation dans un réseau de neurones ?",
          options: [
            {
              text: "Une fonction qui introduit de la non-linéarité dans le réseau",
              isCorrect: true,
            },
            {
              text: "Une fonction qui initialise les poids",
              isCorrect: false,
            },
            {
              text: "Une fonction qui détermine la taille du réseau",
              isCorrect: false,
            },
          ],
          explanation:
            "La fonction d'activation introduit de la non-linéarité dans le réseau, permettant d'apprendre des patterns complexes.",
        },
        {
          text: "Quel est le rôle du dropout dans un réseau de neurones ?",
          options: [
            {
              text: "Prévenir le surapprentissage en désactivant aléatoirement des neurones",
              isCorrect: true,
            },
            {
              text: "Accélérer l'apprentissage",
              isCorrect: false,
            },
            {
              text: "Réduire la taille du modèle",
              isCorrect: false,
            },
          ],
          explanation:
            "Le dropout est une technique de régularisation qui prévient le surapprentissage en désactivant aléatoirement des neurones pendant l'entraînement.",
        },
      ],
    },

    // NLP Quizzes
    {
      moduleId: "3", // Fondamentaux NLP
      title: "Introduction au Traitement du Langage Naturel",
      description: "Testez vos connaissances sur les bases du NLP",
      timeLimit: 2100,
      passingScore: 70,
      questions: [
        {
          text: "Qu'est-ce que la tokenization en NLP ?",
          options: [
            {
              text: "Le processus de découpage du texte en unités plus petites (mots, sous-mots, caractères)",
              isCorrect: true,
            },
            {
              text: "Le processus de traduction automatique",
              isCorrect: false,
            },
            {
              text: "L'analyse grammaticale du texte",
              isCorrect: false,
            },
          ],
          explanation:
            "La tokenization est le processus fondamental de découpage du texte en unités (tokens) qui seront traitées par les algorithmes de NLP.",
        },
        {
          text: "Qu'est-ce qu'un word embedding ?",
          options: [
            {
              text: "Une représentation vectorielle dense d'un mot",
              isCorrect: true,
            },
            {
              text: "Un dictionnaire de synonymes",
              isCorrect: false,
            },
            {
              text: "Une méthode de compression de texte",
              isCorrect: false,
            },
          ],
          explanation:
            "Un word embedding est une représentation vectorielle dense qui capture les relations sémantiques entre les mots dans un espace vectoriel continu.",
        },
      ],
    },

    // Computer Vision Quizzes
    {
      moduleId: "4", // Traitement d'image fondamental
      title: "Fondamentaux du Traitement d'Image",
      description:
        "Testez vos connaissances sur les techniques de base de traitement d'images",
      timeLimit: 1800,
      passingScore: 70,
      questions: [
        {
          text: "Quelle opération est utilisée pour détecter les contours dans une image ?",
          options: [
            {
              text: "Convolution avec des filtres de Sobel ou Canny",
              isCorrect: true,
            },
            {
              text: "Augmentation de la luminosité",
              isCorrect: false,
            },
            {
              text: "Compression JPEG",
              isCorrect: false,
            },
          ],
          explanation:
            "Les opérateurs de Sobel ou l'algorithme de Canny utilisent des convolutions pour détecter les changements brusques d'intensité qui représentent les contours dans une image.",
        },
        {
          text: "À quoi sert la transformation de Fourier en traitement d'image ?",
          options: [
            {
              text: "À analyser les composantes fréquentielles d'une image",
              isCorrect: true,
            },
            {
              text: "À redimensionner l'image",
              isCorrect: false,
            },
            {
              text: "À augmenter la résolution",
              isCorrect: false,
            },
          ],
          explanation:
            "La transformation de Fourier convertit une image du domaine spatial au domaine fréquentiel, permettant d'analyser et de manipuler les composantes fréquentielles de l'image.",
        },
      ],
    },
  ],

  learnerProfiles: [
    {
      userId: null, // Sera rempli dynamiquement avec student1
      learningStyle: "visual",
      preferences: {
        mathLevel: "intermediate",
        programmingLevel: "intermediate",
        preferredDomain: "ml",
      },
      assessments: [
        {
          category: "ml",
          score: 75,
          completedAt: new Date(),
          responses: [],
          recommendations: [
            {
              goalId: null, // Sera rempli dynamiquement
              category: "ml",
              score: 0.85,
              reason: "Bonne maîtrise des concepts de base du ML",
            },
          ],
        },
        {
          category: "math",
          score: 68,
          completedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          responses: [],
          recommendations: [],
        },
      ],
    },
    {
      userId: null, // Sera rempli dynamiquement avec student2
      learningStyle: "kinesthetic",
      preferences: {
        mathLevel: "beginner",
        programmingLevel: "advanced",
        preferredDomain: "dl",
      },
      assessments: [
        {
          category: "programming",
          score: 92,
          completedAt: new Date(),
          responses: [],
          recommendations: [],
        },
        {
          category: "dl",
          score: 65,
          completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          responses: [],
          recommendations: [
            {
              goalId: null, // Sera rempli dynamiquement
              category: "dl",
              score: 0.78,
              reason:
                "Bonnes compétences en programmation, mais nécessite plus de fondements mathématiques",
            },
          ],
        },
      ],
    },
    {
      userId: null, // Sera rempli dynamiquement avec student3
      learningStyle: "reading",
      preferences: {
        mathLevel: "advanced",
        programmingLevel: "intermediate",
        preferredDomain: "nlp",
      },
      assessments: [
        {
          category: "math",
          score: 88,
          completedAt: new Date(),
          responses: [],
          recommendations: [],
        },
        {
          category: "nlp",
          score: 72,
          completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          responses: [],
          recommendations: [
            {
              goalId: null, // Sera rempli dynamiquement
              category: "nlp",
              score: 0.82,
              reason:
                "Excellentes bases mathématiques, idéal pour l'approfondissement en NLP",
            },
          ],
        },
      ],
    },
    {
      userId: null, // Sera rempli dynamiquement avec student4
      learningStyle: "auditory",
      preferences: {
        mathLevel: "beginner",
        programmingLevel: "beginner",
        preferredDomain: "computer_vision",
      },
      assessments: [
        {
          category: "computer_vision",
          score: 62,
          completedAt: new Date(),
          responses: [],
          recommendations: [
            {
              goalId: null, // Sera rempli dynamiquement
              category: "computer_vision",
              score: 0.65,
              reason:
                "Intérêt pour la vision par ordinateur, nécessite des bases plus solides",
            },
          ],
        },
      ],
    },
    {
      userId: null, // Sera rempli dynamiquement avec student5
      learningStyle: "visual",
      preferences: {
        mathLevel: "expert",
        programmingLevel: "advanced",
        preferredDomain: "ml",
      },
      assessments: [
        {
          category: "ml",
          score: 95,
          completedAt: new Date(),
          responses: [],
          recommendations: [
            {
              goalId: null, // Sera rempli dynamiquement
              category: "ml",
              score: 0.95,
              reason:
                "Excellent niveau en ML, recommandé pour des parcours avancés",
            },
          ],
        },
      ],
    },
  ],
};

async function populateDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    logger.info("Connected to MongoDB");

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Goal.deleteMany({}),
      Assessment.deleteMany({}),
      Quiz.deleteMany({}),
      Pathway.deleteMany({}),
      Concept.deleteMany({}),
      LearnerProfile.deleteMany({}),
    ]);
    logger.info("Cleared existing data");

    // Create users
    const createdUsers = await Promise.all(
      completeData.users.map(async userData => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);

        const user = new User({
          ...userData,
          password: hashedPassword,
          lastLogin: new Date(),
        });

        const savedUser = await user.save();
        logger.info(`Created user: ${savedUser.email}`);
        return savedUser;
      })
    );

    // Create concepts
    const conceptMap = new Map();
    for (const conceptData of completeData.concepts) {
      const concept = new Concept({
        ...conceptData,
        prerequisites: [],
      });
      await concept.save();
      conceptMap.set(concept.name, concept._id);
      logger.info(`Created concept: ${concept.name}`);
    }

    // Update concept prerequisites
    for (const conceptData of completeData.concepts) {
      if (conceptData.prerequisites.length > 0) {
        const concept = await Concept.findOne({ name: conceptData.name });
        concept.prerequisites = conceptData.prerequisites.map(name =>
          conceptMap.get(name)
        );
        await concept.save();
        logger.info(`Updated prerequisites for concept: ${concept.name}`);
      }
    }

    // Create goals
    const createdGoals = await Promise.all(
      completeData.goals.map(async goalData => {
        const goal = new Goal({
          ...goalData,
          requiredConcepts: completeData.concepts
            .filter(c => c.category === goalData.category)
            .map(c => conceptMap.get(c.name))
            .filter(id => id), // Filter out undefined values
        });
        const savedGoal = await goal.save();
        logger.info(`Created goal: ${savedGoal.title}`);
        return savedGoal;
      })
    );

    // Create assessments
    const createdAssessments = await Promise.all(
      completeData.assessments.map(async assessmentData => {
        const assessment = new Assessment({
          ...assessmentData,
        });
        await assessment.save();
        logger.info(`Created assessment: ${assessment.title}`);
        return assessment;
      })
    );

    // Update assessments with recommended goals
    for (const assessment of createdAssessments) {
      const matchingGoals = createdGoals.filter(
        goal => goal.category === assessment.category
      );
      if (matchingGoals.length > 0) {
        assessment.recommendedGoals = matchingGoals.map(goal => goal._id);
        await assessment.save();
        logger.info(
          `Updated recommended goals for assessment: ${assessment.title}`
        );
      }
    }

    // Create quizzes
    await Promise.all(
      completeData.quizzes.map(async quizData => {
        const quiz = new Quiz(quizData);
        await quiz.save();
        logger.info(`Created quiz: ${quiz.title}`);
      })
    );

    // Create learner profiles
    const studentUsers = createdUsers.filter(
      u => u.role === "user" && u.isActive
    );

    await Promise.all(
      completeData.learnerProfiles.map(async (profileData, index) => {
        // Assign user ID
        if (index < studentUsers.length) {
          profileData.userId = studentUsers[index]._id;

          // Assign goal IDs to recommendations
          if (profileData.assessments) {
            profileData.assessments.forEach(assessment => {
              if (assessment.recommendations) {
                assessment.recommendations.forEach(rec => {
                  const matchingGoals = createdGoals.filter(
                    g => g.category === assessment.category
                  );
                  if (matchingGoals.length > 0) {
                    rec.goalId = matchingGoals[0]._id;
                  }
                });
              }
            });
          }

          const profile = new LearnerProfile(profileData);
          await profile.save();
          logger.info(
            `Created learner profile for user: ${studentUsers[index].email}`
          );
        }
      })
    );

    // Create pathways with progression relationships
    const pathwaySequences = [
      // Séquence ML -> DL pour student1
      {
        userId: studentUsers[0]._id,
        sequence: [
          {
            goalId: createdGoals.find(
              g => g.title === "Machine Learning Engineer"
            )._id,
            status: "completed",
            progress: 100,
            currentModule: 3, // Tous les modules complétés
            completedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // Complété il y a 60 jours
            nextGoal: "Deep Learning Specialist",
          },
          {
            goalId: createdGoals.find(
              g => g.title === "Deep Learning Specialist"
            )._id,
            status: "active",
            progress: 65,
            currentModule: 1,
            nextGoal: null,
          },
        ],
      },
      // Séquence CV -> DL pour student2
      {
        userId: studentUsers[1]._id,
        sequence: [
          {
            goalId: createdGoals.find(g => g.title === "Computer Vision Expert")
              ._id,
            status: "active",
            progress: 80,
            currentModule: 1,
            nextGoal: "Deep Learning Specialist",
          },
          {
            goalId: createdGoals.find(
              g => g.title === "Deep Learning Specialist"
            )._id,
            status: "paused",
            progress: 0,
            currentModule: 0,
            nextGoal: null,
          },
        ],
      },
      // Parcours unique ML pour student3
      {
        userId: studentUsers[2]._id,
        sequence: [
          {
            goalId: createdGoals.find(
              g => g.title === "Machine Learning Engineer"
            )._id,
            status: "active",
            progress: 30,
            currentModule: 0,
            nextGoal: null,
          },
        ],
      },
      // Parcours NLP pour student4
      {
        userId: studentUsers[3]._id,
        sequence: [
          {
            goalId: createdGoals.find(g => g.title === "NLP Specialist")._id,
            status: "active",
            progress: 45,
            currentModule: 0,
            nextGoal: null,
          },
        ],
      },
      // Parcours Data Scientist pour student5
      {
        userId: studentUsers[4]._id,
        sequence: [
          {
            goalId: createdGoals.find(g => g.title === "Data Scientist")._id,
            status: "active",
            progress: 75,
            currentModule: 1,
            nextGoal: null,
          },
        ],
      },
    ];

    // Création des parcours avec relations de prérequis
    for (const sequenceData of pathwaySequences) {
      const { userId, sequence } = sequenceData;

      for (let i = 0; i < sequence.length; i++) {
        const pathwayData = sequence[i];
        const goal = createdGoals.find(g => g._id.equals(pathwayData.goalId));

        const pathway = new Pathway({
          userId: userId,
          goalId: pathwayData.goalId,
          status: pathwayData.status,
          progress: pathwayData.progress,
          currentModule: pathwayData.currentModule,
          prerequisitePathway: i > 0 ? sequence[i - 1].pathwayId : null, // Lien vers le parcours prérequis
          nextPathwayGoal: pathwayData.nextGoal
            ? createdGoals.find(g => g.title === pathwayData.nextGoal)?._id
            : null,
          moduleProgress: goal.modules.map((module, moduleIndex) => ({
            moduleIndex,
            completed:
              moduleIndex < pathwayData.currentModule ||
              (moduleIndex === pathwayData.currentModule &&
                pathwayData.progress >= 80),
            resources: module.resources.map((resource, resIndex) => ({
              resourceId: `resource-${moduleIndex}-${resIndex}`,
              completed:
                moduleIndex < pathwayData.currentModule ||
                (moduleIndex === pathwayData.currentModule && resIndex === 0),
              completedAt:
                moduleIndex < pathwayData.currentModule
                  ? new Date(
                      Date.now() - (30 - moduleIndex * 10) * 24 * 60 * 60 * 1000
                    )
                  : null,
              type: resource.type,
            })),
            quiz: {
              completed: moduleIndex < pathwayData.currentModule,
              score:
                moduleIndex < pathwayData.currentModule
                  ? 75 + Math.floor(Math.random() * 15)
                  : null,
              completedAt:
                moduleIndex < pathwayData.currentModule
                  ? new Date(
                      Date.now() - (25 - moduleIndex * 10) * 24 * 60 * 60 * 1000
                    )
                  : null,
            },
          })),
          startedAt: new Date(
            Date.now() -
              Math.floor(30 + Math.random() * 30) * 24 * 60 * 60 * 1000
          ),
          completedAt:
            pathwayData.status === "completed" ? pathwayData.completedAt : null,
          lastAccessedAt: new Date(
            Date.now() - Math.floor(Math.random() * 5) * 24 * 60 * 60 * 1000
          ),
          estimatedCompletionDate:
            pathwayData.status === "completed"
              ? pathwayData.completedAt
              : new Date(
                  Date.now() +
                    Math.floor(30 + Math.random() * 60) * 24 * 60 * 60 * 1000
                ),
          adaptiveRecommendations: [
            {
              type: "resource",
              description: `Ressource recommandée sur ${
                goal.modules[
                  Math.min(pathwayData.currentModule, goal.modules.length - 1)
                ].skills[0]?.name || "les concepts clés"
              }`,
              priority: "high",
              status: "pending",
            },
            {
              type: "practice",
              description: `Exercice pratique pour renforcer ${
                goal.modules[
                  Math.min(pathwayData.currentModule, goal.modules.length - 1)
                ].skills[1]?.name || "les compétences fondamentales"
              }`,
              priority: "medium",
              status: "pending",
            },
          ],
        });

        const savedPathway = await pathway.save();
        logger.info(
          `Created pathway for user with sequence: ${pathwayData.status} - ${goal.title}`
        );

        // Stockez l'ID pour les références
        sequence[i].pathwayId = savedPathway._id;
      }

      // Deuxième passe pour établir les références entre parcours
      for (let i = 1; i < sequence.length; i++) {
        const currentPathway = await Pathway.findById(sequence[i].pathwayId);
        currentPathway.prerequisitePathway = sequence[i - 1].pathwayId;
        await currentPathway.save();
        logger.info(
          `Updated pathway ${currentPathway._id} with prerequisite ${
            sequence[i - 1].pathwayId
          }`
        );
      }
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

// Execute the script
populateDatabase().catch(error => {
  logger.error("Fatal error during database population:", error);
  process.exit(1);
});
