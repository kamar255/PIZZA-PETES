
import api from "./api";

const toppingService = {
  // Récupérer tous les suppléments
  getAllToppings: async () => {
    const response = await api.get("/toppings");
    return response.data;
  },

  // Récupérer un supplément par son ID
  getToppingById: async (id) => {
    const response = await api.get(`/toppings/${id}`);
    return response.data;
  },

  // Ajouter un supplément
  createTopping: async (toppingData) => {
    const response = await api.post("/toppings", toppingData);
    return response.data;
  },

  // Modifier un supplément
  updateTopping: async (id, toppingData) => {
    const response = await api.put(`/toppings/${id}`, toppingData);
    return response.data;
  },

  // Supprimer un supplément
  deleteTopping: async (id) => {
    const response = await api.delete(`/toppings/${id}`);
    return response.data;
  },
};

export default toppingService;
