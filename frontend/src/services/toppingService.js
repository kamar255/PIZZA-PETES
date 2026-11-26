
import api from "./api";

const toppingService = {
  // Récupérer toutes les garnitures (administration)
  getAllToppings: async () => {
    const response = await api.get("/toppings");
    return response.data;
  },

  // Récupérer uniquement les garnitures disponibles (client)
  getAvailableToppings: async () => {
    const response = await api.get("/toppings/available");
    return response.data;
  },

  // Récupérer une garniture par son ID
  getToppingById: async (id) => {
    const response = await api.get(`/toppings/${id}`);
    return response.data;
  },

  // Ajouter une garniture
  createTopping: async (toppingData) => {
    const response = await api.post("/toppings", toppingData);
    return response.data;
  },

  // Modifier une garniture
  updateTopping: async (id, toppingData) => {
    const response = await api.put(`/toppings/${id}`, toppingData);
    return response.data;
  },

  // Supprimer une garniture
  deleteTopping: async (id) => {
    const response = await api.delete(`/toppings/${id}`);
    return response.data;
  },
};

export default toppingService;
