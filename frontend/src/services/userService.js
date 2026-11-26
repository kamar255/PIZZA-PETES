
import api from "./api";

const userService = {

  // Récupérer tous les utilisateurs (administrateur)
  getAllUsers: async () => {
    const response = await api.get("/users");
    return response.data;
  },

  // Récupérer un utilisateur par son ID (administrateur)
  getUserById: async (id) => {
    if (!id) {
      throw new Error("L'identifiant de l'utilisateur est obligatoire.");
    }

    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Récupérer le profil de l'utilisateur connecté
  getProfile: async () => {
    const response = await api.get("/users/profile");
    return response.data;
  },

  // Modifier le profil de l'utilisateur connecté
  updateProfile: async (userData) => {
    if (!userData) {
      throw new Error("Les informations du profil sont obligatoires.");
    }

    const response = await api.put("/users/profile", userData);
    return response.data;
  },

  // Supprimer un utilisateur (administrateur)
  deleteUser: async (id) => {
    if (!id) {
      throw new Error("L'identifiant de l'utilisateur est obligatoire.");
    }

    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

};

export default userService;
