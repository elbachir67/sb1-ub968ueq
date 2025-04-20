export interface User {
  id: string;
  email: string;
  role: "user" | "admin";
  isActive: boolean;
  lastLogin?: Date;
}

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
  requiredConcepts?: string[];
  recommendedFor?: Recommendation[];
  isRecommended?: boolean;
  matchScore?: number;
}

export type GoalCategory =
  | "ml"
  | "dl"
  | "data_science"
  | "mlops"
  | "computer_vision"
  | "nlp"
  | "robotics"
  | "quantum_ml";

export type GoalDifficulty = "beginner" | "intermediate" | "advanced";

export interface Prerequisite {
  category: string;
  skills: Skill[];
}

export interface Skill {
  name: string;
  level: GoalDifficulty;
}

export interface Module {
  _id: string;
  title: string;
  description: string;
  duration: number;
  skills: Skill[];
  resources: Resource[];
  validationCriteria: string[];
}

export interface Resource {
  title: string;
  type: ResourceType;
  url: string;
  duration: number;
}

export type ResourceType = "article" | "video" | "course" | "book" | "use_case";

export interface CareerOpportunity {
  title: string;
  description: string;
  averageSalary: string;
  companies: string[];
}

export interface Certification {
  available: boolean;
  name?: string;
  provider?: string;
  url?: string;
}

export interface Recommendation {
  type: "resource" | "practice" | "review";
  description: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "completed" | "skipped";
}

export interface Question {
  id: string;
  text: string;
  category: string;
  difficulty: GoalDifficulty;
  options: Option[];
  explanation: string;
}

export interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  options?: string[];
  component?: React.ReactNode;
}

export interface UserProfile {
  userId: string;
  learningStyle: "visual" | "auditory" | "reading" | "kinesthetic";
  preferences: {
    mathLevel: GoalDifficulty;
    programmingLevel: GoalDifficulty;
    preferredDomain: GoalCategory;
  };
  assessments: Assessment[];
  goal?: string;
}

export interface Assessment {
  category: string;
  score: number;
  responses: AssessmentResponse[];
  recommendations: AssessmentRecommendation[];
  completedAt: Date;
}

export interface AssessmentResponse {
  questionId: string;
  selectedOption: string;
  timeSpent: number;
  category: string;
  difficulty: string;
}

export interface AssessmentRecommendation {
  category: string;
  score: number;
  recommendations: string[];
}

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
  adaptiveRecommendations: Recommendation[];
  nextGoals?: string[];
}

export interface ModuleProgress {
  _id: string;
  moduleIndex: number;
  completed: boolean;
  locked: boolean;
  resources: PathwayResource[];
  quiz: QuizProgress;
}

export interface PathwayResource {
  resourceId: string;
  completed: boolean;
  completedAt?: Date;
  type?: ResourceType;
}

export interface QuizProgress {
  completed: boolean;
  score?: number;
  completedAt?: Date;
}

export interface LearnerDashboard {
  learningStats: {
    totalHoursSpent: number;
    completedResources: number;
    averageQuizScore: number;
    streakDays: number;
  };
  activePathways: Pathway[];
  completedPathways: Pathway[];
  nextMilestones: Milestone[];
}

export interface Milestone {
  goalTitle: string;
  moduleName: string;
  dueDate: Date;
}

export interface ModuleQuiz {
  id: string;
  title: string;
  description: string;
  timeLimit: number;
  questions: Question[];
  passingScore: number;
}

export interface QuizResult {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  answers: QuizAnswer[];
  categoryScores?: CategoryScore[];
  recommendations?: string[];
}

export interface QuizAnswer {
  questionId: string;
  selectedOption: string;
  isCorrect: boolean;
  timeSpent: number;
}

export interface CategoryScore {
  category: string;
  score: number;
  confidence: number;
  timeEfficiency: number;
  weakPoints: string[];
  strongPoints: string[];
}

export interface AnalyticsData {
  totalLearningTime: number;
  completionRate: number;
  averageScore: number;
  activeDays: number;
  progressData: ProgressDataPoint[];
  categoryPerformance: CategoryPerformance[];
}

export interface ProgressDataPoint {
  date: string;
  progress: number;
  quizScore?: number;
  timeSpent?: number;
}

export interface CategoryPerformance {
  category: string;
  score: number;
  improvement: number;
}
