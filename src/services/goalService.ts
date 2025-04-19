import apiClient from "./api";
import { api } from "../config/api";
import { Goal } from "../types";

export const goalService = {
  // Récupérer tous les objectifs avec filtres optionnels
  getGoals: async (filters?: {
    category?: string;
    difficulty?: string;
    userId?: string;
    mathLevel?: string;
    programmingLevel?: string;
    preferredDomain?: string;
  }) => {
    const queryParams = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, value);
        }
      });
    }

    const response = await apiClient.get(
      `${api.goals}?${queryParams.toString()}`
    );
    return response.data as Goal[];
  },

  // Récupérer un objectif par ID
  getGoalById: async (id: string) => {
    const response = await apiClient.get(`${api.goals}/${id}`);
    return response.data as Goal;
  },

  // Créer un nouvel objectif (admin seulement)
  createGoal: async (goalData: Partial<Goal>) => {
    const response = await apiClient.post(`${api.goals}`, goalData);
    return response.data;
  },

  // Mettre à jour un objectif (admin seulement)
  updateGoal: async (id: string, goalData: Partial<Goal>) => {
    const response = await apiClient.put(`${api.goals}/${id}`, goalData);
    return response.data;
  },

  // Supprimer un objectif (admin seulement)
  deleteGoal: async (id: string) => {
    const response = await apiClient.delete(`${api.goals}/${id}`);
    return response.data;
  },
};
