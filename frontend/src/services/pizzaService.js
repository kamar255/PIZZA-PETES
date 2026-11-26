
import api from "./api";

const pizzaService = {
  // Récupérer toutes les pizzas
  getAllPizzas: async () => {
    const response = await api.get("/pizzas");
    return response.data;
  },

  // Récupérer les pizzas disponibles
  getAvailablePizzas: async () => {
    const response = await api.get("/pizzas/available");
    return response.data;
  },

  // Récupérer une pizza par son ID
  getPizzaById: async (id) => {
    const response = await api.get(`/pizzas/${id}`);
    return response.data;
  },

  // Ajouter une pizza
  createPizza: async (pizzaData) => {
    const response = await api.post("/pizzas", pizzaData);
    return response.data;
  },

  // Modifier une pizza
  updatePizza: async (id, pizzaData) => {
    const response = await api.put(`/pizzas/${id}`, pizzaData);
    return response.data;
  },

  // Supprimer une pizza
  deletePizza: async (id) => {
    const response = await api.delete(`/pizzas/${id}`);
    return response.data;
  },
};

export default pizzaService;
