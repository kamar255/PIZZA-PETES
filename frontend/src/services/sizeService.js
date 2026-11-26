
import api from "./api";

const sizeService = {
  // Récupérer toutes les tailles (administration)
  getAllSizes: async () => {
    const response = await api.get("/sizes");
    return response.data;
  },

  // Récupérer uniquement les tailles disponibles (client)
  getAvailableSizes: async () => {
    const response = await api.get("/sizes/available");
    return response.data;
  },

  // Récupérer une taille par son ID
  getSizeById: async (id) => {
    const response = await api.get(`/sizes/${id}`);
    return response.data;
  },

  // Ajouter une taille
  createSize: async (sizeData) => {
    const response = await api.post("/sizes", sizeData);
    return response.data;
  },

  // Modifier une taille
  updateSize: async (id, sizeData) => {
    const response = await api.put(`/sizes/${id}`, sizeData);
    return response.data;
  },

  // Supprimer une taille
  deleteSize: async (id) => {
    const response = await api.delete(`/sizes/${id}`);
    return response.data;
  },
};

export default sizeService;
