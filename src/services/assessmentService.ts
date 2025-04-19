import apiClient from "./api";
import { api } from "../config/api";
import { Question } from "../types";

export const assessmentService = {
  // Récupérer les questions d'évaluation par domaine
  getAssessmentQuestions: async (domain?: string) => {
    const response = await apiClient.get(
      `${api.assessments}/questions${domain ? `?domain=${domain}` : ""}`
    );
    return response.data as Question[];
  },

  // Soumettre les résultats d'une évaluation
  submitAssessment: async (assessmentData: {
    category: string;
    score: number;
    responses: any[];
    recommendations: any[];
  }) => {
    const response = await apiClient.post(
      `${api.assessments}/submit`,
      assessmentData
    );
    return response.data;
  },

  // Récupérer l'historique des évaluations
  getAssessmentHistory: async () => {
    const response = await apiClient.get(`${api.assessments}/history`);
    return response.data;
  },

  // Récupérer les résultats d'une évaluation spécifique
  getAssessmentResults: async (id: string) => {
    const response = await apiClient.get(`${api.assessments}/${id}`);
    return response.data;
  },

  // Récupérer l'évaluation d'un concept
  getConceptAssessment: async (conceptId: string) => {
    const response = await apiClient.get(
      `${api.concepts}/${conceptId}/assessment`
    );
    return response.data;
  },

  // Soumettre les résultats d'une évaluation de concept
  submitConceptAssessment: async (
    conceptId: string,
    assessmentData: {
      score: number;
      responses: any[];
    }
  ) => {
    const response = await apiClient.post(
      `${api.concepts}/${conceptId}/assessment/submit`,
      assessmentData
    );
    return response.data;
  },
};
