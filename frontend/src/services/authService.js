
import api from "./api";

const authService = {
  // Inscription
  register: async (userData) => {
    const response = await api.post("/auth/register", userData);

    return response.data;
  },

  // Connexion
  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);

    const data = response.data;

    if (!data.token) {
      throw new Error(
        "Le serveur n'a pas retourné de token JWT."
      );
    }

    localStorage.setItem("token", data.token);

    if (data.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
    } else {
      localStorage.removeItem("user");
    }

    return data;
  },

  // Déconnexion
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  // Récupérer l'utilisateur connecté
  getCurrentUser: () => {
    const user = localStorage.getItem("user");

    try {
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error("Erreur de lecture utilisateur :", error);
      localStorage.removeItem("user");
      return null;
    }
  },

  // Vérifier si l'utilisateur est connecté
  isAuthenticated: () => {
    return Boolean(localStorage.getItem("token"));
  },
};

export default authService;
