
import api from "./api";

const doughService = {
  // Récupérer toutes les pâtes (administration)
  getAllDoughs: async () => {
    const response = await api.get("/doughs");
    return response.data;
  },

  // Récupérer uniquement les pâtes disponibles (client)
  getAvailableDoughs: async () => {
    const response = await api.get("/doughs/available");
    return response.data;
  },

  // Récupérer une pâte par son ID
  getDoughById: async (id) => {
    const response = await api.get(`/doughs/${id}`);
    return response.data;
  },

  // Ajouter une pâte
  createDough: async (doughData) => {
    const response = await api.post("/doughs", doughData);
    return response.data;
  },

  // Modifier une pâte
  updateDough: async (id, doughData) => {
    const response = await api.put(`/doughs/${id}`, doughData);
    return response.data;
  },

  // Supprimer une pâte
  deleteDough: async (id) => {
    const response = await api.delete(`/doughs/${id}`);
    return response.data;
  },
};

export default doughService;
