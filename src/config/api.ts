import { API_URL } from "./constants";

export const api = {
  // Base URL
  API_URL,

  // Auth endpoints
  auth: {
    login: `${API_URL}/api/auth/login`,
    register: `${API_URL}/api/auth/register`,
    profile: `${API_URL}/api/auth/profile`,
  },

  // Base endpoints
  sections: `${API_URL}/api/sections`,
  steps: `${API_URL}/api/steps`,
  resources: `${API_URL}/api/resources`,
  goals: `${API_URL}/api/goals`,
  concepts: `${API_URL}/api/concepts`,
  assessments: `${API_URL}/api/assessments`,
  profiles: `${API_URL}/api/profiles`,
  pathways: `${API_URL}/api/pathways`,
  users: `${API_URL}/api/users`,
  analytics: `${API_URL}/api/analytics`,
  content: `${API_URL}/api/content`,

  // Helper pour obtenir les ressources d'une étape
  stepResources: (stepId: string) => `${API_URL}/api/resources/step/${stepId}`,

  // Helper pour obtenir les étapes d'une section
  sectionSteps: (sectionId: string) =>
    `${API_URL}/api/steps/section/${sectionId}`,

  // Helper pour les évaluations
  assessmentHistory: `${API_URL}/api/assessments/history`,
  assessmentResults: (id: string) => `${API_URL}/api/assessments/${id}`,
  assessmentQuestions: (domain: string) =>
    `${API_URL}/api/assessments/questions?domain=${domain}`,

  // Helper pour les profils utilisateurs
  userProfile: `${API_URL}/api/profiles`,
  userGoals: `${API_URL}/api/profiles/goals`,
  userCertificates: `${API_URL}/api/profiles/certificates`,
  userSkills: `${API_URL}/api/profiles/skills`,

  // Helper pour la génération de contenu
  generateContent: `${API_URL}/api/content/generate`,
  getGeneratedContent: `${API_URL}/api/content`,
};
