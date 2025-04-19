import apiClient from "./api";
import { api } from "../config/api";
import { AnalyticsData } from "../types";

export const analyticsService = {
  // Récupérer les données analytiques pour l'utilisateur
  getUserAnalytics: async () => {
    const response = await apiClient.get(`${api.analytics}/user`);
    return response.data as AnalyticsData;
  },

  // Récupérer les données analytiques pour l'admin
  getAdminAnalytics: async () => {
    const response = await apiClient.get(`${api.analytics}/admin`);
    return response.data;
  },

  // Exporter les données analytiques
  exportAnalytics: async (format: "csv" | "excel") => {
    const response = await apiClient.get(
      `${api.analytics}/export?format=${format}`,
      {
        responseType: "blob",
      }
    );
    return response.data;
  },
};
