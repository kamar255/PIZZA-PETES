
import api from "./api";

const orderService = {

  // Récupérer toutes les commandes (administrateur)
  getAllOrders: async () => {
    const response = await api.get("/orders");
    return response.data;
  },

  // Récupérer les commandes du client connecté
  getMyOrders: async () => {
    const response = await api.get("/orders/my-orders");
    return response.data;
  },

  // Récupérer une commande par son ID (administrateur)
  getOrderById: async (id) => {
    if (!id) {
      throw new Error("L'identifiant de la commande est obligatoire.");
    }

    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // Créer une commande pour le client connecté
  createOrder: async (orderData) => {
    if (!orderData) {
      throw new Error("Les informations de la commande sont obligatoires.");
    }

    const response = await api.post("/orders", orderData);
    return response.data;
  },

  // Modifier le statut d'une commande (administrateur)
  updateOrderStatus: async (id, status) => {
    if (!id || !status) {
      throw new Error("L'identifiant et le statut sont obligatoires.");
    }

    const response = await api.patch(
      `/orders/${id}/status`,
      null,
      {
        params: { status },
      }
    );

    return response.data;
  },

  // Supprimer une commande (administrateur)
  deleteOrder: async (id) => {
    if (!id) {
      throw new Error("L'identifiant de la commande est obligatoire.");
    }

    const response = await api.delete(`/orders/${id}`);
    return response.data;
  },
};

export default orderService;
