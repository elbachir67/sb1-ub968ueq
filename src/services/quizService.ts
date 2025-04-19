import apiClient from "./api";
import { api } from "../config/api";
import { ModuleQuiz, QuizResult } from "../types";

export const quizService = {
  // Récupérer un quiz pour un module spécifique
  getQuiz: async (pathwayId: string, moduleId: string) => {
    const response = await apiClient.get(
      `${api.pathways}/${pathwayId}/modules/${moduleId}/quiz`
    );
    return response.data as ModuleQuiz;
  },

  // Soumettre les résultats d'un quiz
  submitQuiz: async (
    pathwayId: string,
    moduleId: string,
    quizData: {
      score: number;
      answers: any[];
      totalTimeSpent: number;
      categoryScores?: any[];
      recommendations?: any[];
    }
  ) => {
    const response = await apiClient.post(
      `${api.pathways}/${pathwayId}/modules/${moduleId}/quiz/submit`,
      quizData
    );
    return response.data;
  },

  // Réinitialiser un quiz
  resetQuiz: async (pathwayId: string, moduleId: string) => {
    const response = await apiClient.post(
      `${api.pathways}/${pathwayId}/modules/${moduleId}/quiz/reset`
    );
    return response.data;
  },

  // Récupérer l'historique des tentatives de quiz
  getQuizAttempts: async (pathwayId: string, moduleId: string) => {
    const response = await apiClient.get(
      `${api.pathways}/${pathwayId}/modules/${moduleId}/quiz/attempts`
    );
    return response.data;
  },
};
