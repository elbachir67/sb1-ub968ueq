import axios from "axios";
import { api } from "../config/api";

// Créer une instance axios avec la configuration de base
const apiClient = axios.create({
  baseURL: api.API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercepteur pour ajouter le token d'authentification
apiClient.interceptors.request.use(
  config => {
    const user = localStorage.getItem("user");
    if (user) {
      const { token } = JSON.parse(user);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

export default apiClient;
