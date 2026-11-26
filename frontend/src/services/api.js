
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Ajouter automatiquement le token JWT aux requêtes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn(
        "Session expirée ou utilisateur non authentifié."
      );
    }

    if (error.response?.status === 403) {
      console.warn(
        "Accès refusé : vous n'avez pas les autorisations nécessaires."
      );
    }

    return Promise.reject(error);
  }
);

export default api;
