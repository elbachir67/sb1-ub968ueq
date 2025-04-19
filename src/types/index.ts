// Types for the resources
export type ResourceType = "article" | "video" | "course" | "book" | "use_case";

// Types for the niveaux de difficulté
export type GoalDifficulty = "beginner" | "intermediate" | "advanced";

// Types for the catégories de buts
export type GoalCategory =
  | "ml"
  | "dl"
  | "data_science"
  | "mlops"
  | "computer_vision"
  | "nlp"
  | "robotics"
  | "quantum_ml";

// Interface for les messages du chat
export interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  options?: string[];
  component?: React.ReactNode;
}

// Interface for les compétences
export interface Skill {
  name: string;
  level: string;
}

// Interface for les ressources
export interface Resource {
  title: string;
  type: ResourceType;
  url: string;
  duration: number;
}

// Interface for les opportunités de carrière
export interface CareerOpportunity {
  title: string;
  description: string;
  averageSalary: string;
  companies: string[];
}

// Interface for la certification
export interface Certification {
  available: boolean;
  name: string;
  provider: string;
  url: string;
}

// Interface for les modules
export interface Module {
  title: string;
  description: string;
  duration: number;
  skills: Skill[];
  resources: Resource[];
  validationCriteria: string[];
}

// Interface for les prérequis
export interface Prerequisite {
  category: string;
  skills: Skill[];
}

// Interface for les buts
export interface Goal {
  _id: string;
  title: string;
  description: string;
  category: GoalCategory;
  level: GoalDifficulty;
  estimatedDuration: number;
  prerequisites: Prerequisite[];
  modules: Module[];
  careerOpportunities: CareerOpportunity[];
  certification?: Certification;
  isRecommended?: boolean;
}

// Types for les quiz
export interface Question {
  id: string;
  text: string;
  category: string;
  difficulty: "basic" | "intermediate" | "advanced";
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  explanation: string;
}

export interface QuizQuestion {
  id: string;
  text: string;
  category: string;
  difficulty: "basic" | "intermediate" | "advanced";
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  explanation: string;
}

export interface QuizResult {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  answers: {
    questionId: string;
    selectedOption: string;
    isCorrect: boolean;
    timeSpent: number;
  }[];
}

export interface ModuleQuiz {
  id: string;
  title: string;
  description: string;
  timeLimit: number;
  questions: QuizQuestion[];
  passingScore: number;
}

// Interface for le progrès des modules
export interface PathwayResource {
  resourceId: string;
  completed: boolean;
  completedAt?: Date;
  type?: ResourceType;
}

export interface ModuleProgress {
  moduleIndex: number;
  completed: boolean;
  resources: PathwayResource[];
  quiz: {
    completed: boolean;
    score?: number;
    completedAt?: Date;
  };
}

// Interface for le tableau de bord de l'apprenant
export interface LearningStats {
  totalHoursSpent: number;
  completedResources: number;
  averageQuizScore: number;
  streakDays: number;
}

export interface Milestone {
  goalTitle: string;
  moduleName: string;
  dueDate: Date;
}

export interface LearnerDashboard {
  learningStats: LearningStats;
  activePathways: Pathway[];
  completedPathways: Pathway[];
  nextMilestones: Milestone[];
}

// Interface for le parcours d'apprentissage
export interface Pathway {
  _id: string;
  userId: string;
  goalId: Goal;
  status: "active" | "completed" | "paused";
  progress: number;
  currentModule: number;
  moduleProgress: ModuleProgress[];
  startedAt: Date;
  lastAccessedAt: Date;
  estimatedCompletionDate: Date;
  adaptiveRecommendations: {
    type: "resource" | "practice" | "review";
    description: string;
    priority: "high" | "medium" | "low";
    status: "pending" | "completed" | "skipped";
  }[];
}

// Interface for le profil utilisateur
export interface UserProfile {
  mathLevel: string;
  programmingLevel: string;
  domain: string;
}

// Interface for les résultats d'évaluation
export interface AssessmentResult {
  category: string;
  level: string;
  score: number;
  recommendations: string[];
}

// Nouvelles interfaces pour P2 - Évaluation continue et Analytics

export interface ConceptAssessment {
  id: string;
  conceptId: string;
  questions: Question[];
  passingScore: number;
  timeLimit: number;
  difficulty: "basic" | "intermediate" | "advanced";
}

export interface ConceptAssessmentResult {
  score: number;
  responses: {
    questionId: string;
    selectedOption: string;
    isCorrect: boolean;
    timeSpent: number;
  }[];
  recommendations: string[];
  adaptations: {
    title: string;
    description: string;
    type: string;
  }[];
}

export interface AnalyticsData {
  totalLearningTime: number;
  completionRate: number;
  averageScore: number;
  activeDays: number;
  progressData: {
    date: string;
    progress: number;
    quizScore?: number;
    timeSpent?: number;
  }[];
  conceptMastery: {
    conceptId: string;
    conceptName: string;
    masteryLevel: number;
    confidence: number;
  }[];
  timeDistribution: {
    category: string;
    hours: number;
  }[];
  recommendations: {
    title: string;
    description: string;
  }[];
}
