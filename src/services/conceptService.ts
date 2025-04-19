import apiClient from "./api";
import { api } from "../config/api";

export const conceptService = {
  // Récupérer tous les concepts avec filtres optionnels
  getConcepts: async (filters?: {
    category?: string;
    level?: string;
    search?: string;
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
      `${api.concepts}?${queryParams.toString()}`
    );
    return response.data;
  },

  // Récupérer un concept par ID
  getConceptById: async (id: string) => {
    const response = await apiClient.get(`${api.concepts}/${id}`);
    return response.data;
  },

  // Créer un nouveau concept (admin seulement)
  createConcept: async (conceptData: any) => {
    const response = await apiClient.post(`${api.concepts}`, conceptData);
    return response.data;
  },

  // Mettre à jour un concept (admin seulement)
  updateConcept: async (id: string, conceptData: any) => {
    const response = await apiClient.put(`${api.concepts}/${id}`, conceptData);
    return response.data;
  },
};
