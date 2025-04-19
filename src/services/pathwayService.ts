import apiClient from "./api";
import { api } from "../config/api";
import { Pathway, LearnerDashboard } from "../types";

export const pathwayService = {
  // Récupérer les données du tableau de bord
  getDashboard: async () => {
    const response = await apiClient.get(`${api.pathways}/user/dashboard`);
    return response.data as LearnerDashboard;
  },

  // Générer un nouveau parcours
  generatePathway: async (goalId: string) => {
    const response = await apiClient.post(`${api.pathways}/generate`, {
      goalId,
    });
    return response.data as Pathway;
  },

  // Récupérer un parcours spécifique
  getPathway: async (pathwayId: string) => {
    const response = await apiClient.get(`${api.pathways}/${pathwayId}`);
    return response.data as Pathway;
  },

  // Mettre à jour la progression d'un module
  updateModuleProgress: async (
    pathwayId: string,
    moduleIndex: number,
    data: {
      resourceId?: string;
      completed?: boolean;
    }
  ) => {
    try {
      const response = await apiClient.put(
        `${api.pathways}/${pathwayId}/modules/${moduleIndex}`,
        data
      );
      return response.data as Pathway;
    } catch (error) {
      console.error("Error updating module progress:", error);
      throw error;
    }
  },

  // Mettre à jour une recommandation
  updateRecommendation: async (
    pathwayId: string,
    recommendationIndex: number,
    action: "start" | "skip" | "complete"
  ) => {
    try {
      const response = await apiClient.put(
        `${api.pathways}/${pathwayId}/recommendations/${recommendationIndex}`,
        { action }
      );
      return response.data as Pathway;
    } catch (error) {
      console.error("Error updating recommendation:", error);
      throw error;
    }
  },

  // Récupérer les données de progression pour le graphique
  getProgressData: async (pathwayId: string) => {
    try {
      const response = await apiClient.get(
        `${api.pathways}/${pathwayId}/progress`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching progress data:", error);
      throw error;
    }
  },
};
