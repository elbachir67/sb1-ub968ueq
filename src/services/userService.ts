import apiClient from "./api";
import { api } from "../config/api";

export const userService = {
  // Récupérer tous les utilisateurs (admin seulement)
  getUsers: async () => {
    const response = await apiClient.get(`${api.users}`);
    return response.data;
  },

  // Récupérer un utilisateur par ID
  getUserById: async (id: string) => {
    const response = await apiClient.get(`${api.users}/${id}`);
    return response.data;
  },

  // Récupérer le profil de l'utilisateur connecté
  getUserProfile: async () => {
    const response = await apiClient.get(`${api.profiles}`);
    return response.data;
  },

  // Mettre à jour le profil utilisateur
  updateUserProfile: async (profileData: any) => {
    const response = await apiClient.put(`${api.profiles}`, profileData);
    return response.data;
  },

  // Ajouter un objectif d'apprentissage au profil
  addLearningGoal: async (goalData: any) => {
    const response = await apiClient.post(`${api.profiles}/goals`, goalData);
    return response.data;
  },

  // Ajouter un certificat au profil
  addCertificate: async (certificateData: any) => {
    const response = await apiClient.post(
      `${api.profiles}/certificates`,
      certificateData
    );
    return response.data;
  },

  // Mettre à jour une compétence
  updateSkill: async (skillName: string, level: number) => {
    const response = await apiClient.put(
      `${api.profiles}/skills/${skillName}`,
      { level }
    );
    return response.data;
  },
};
