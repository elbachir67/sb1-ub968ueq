import apiClient from "./api";
import { api } from "../config/api";

interface ContentGenerationParams {
  topic: string;
  userLevel: string;
  learningStyle: string;
  previousPerformance: number;
  contentType: "explanation" | "exercise" | "summary";
}

export const contentGenerationService = {
  generateContent: async (params: ContentGenerationParams) => {
    const response = await apiClient.post(api.generateContent, params);
    return response.data;
  },

  getGeneratedContent: async (filters?: {
    topic?: string;
    userLevel?: string;
    contentType?: string;
  }) => {
    const response = await apiClient.get(api.getGeneratedContent, {
      params: filters,
    });
    return response.data;
  },
};
