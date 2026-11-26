
import { useCallback, useEffect, useState } from "react";
import { Eye, RefreshCw, Trash2, X } from "lucide-react";

import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminNavbar from "../../components/admin/AdminNavbar";
import Loader from "../../components/common/Loader";
import orderService from "../../services/orderService";

const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

const STATUS_LABELS = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  PREPARING: "En préparation",
  READY: "Prête",
  OUT_FOR_DELIVERY: "En livraison",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
};

function getCustomerName(user) {
  if (!user) return "Client inconnu";

  const name = [user.firstName, user.lastName]
    .filter(Boolean)
    .join(" ");

  return name || user.email || "Client inconnu";
}

function formatPrice(price) {
  const amount = Number(price);

  if (!Number.isFinite(amount)) return "0,00 DT";

  return `${amount.toFixed(2)} DT`;
}

function formatDate(date) {
  if (!date) return "Date inconnue";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date invalide";
  }

  return parsedDate.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getErrorMessage(err, fallback) {
  return (
    err.response?.data?.message ||
    err.message ||
    fallback
  );
}

function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [deletingOrderId, setDeletingOrderId] = useState(null);

  // Charger les commandes
  const fetchOrders = useCallback(async () => {
    const response = await orderService.getAllOrders();

    if (!Array.isArray(response)) {
      throw new Error(
        "Le serveur a retourné un format de commandes invalide."
      );
    }

    setOrders(response);
  }, []);

  // Chargement initial
  useEffect(() => {
    let isMounted = true;

    const initializeOrders = async () => {
      try {
        const response = await orderService.getAllOrders();

        if (isMounted) {
          if (!Array.isArray(response)) {
            throw new Error(
              "Le serveur a retourné un format de commandes invalide."
            );
          }

          setOrders(response);
          setError("");
        }
      } catch (err) {
        if (isMounted) {
          setError(
            getErrorMessage(
              err,
              "Impossible de charger les commandes."
            )
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeOrders();

    return () => {
      isMounted = false;
    };
  }, []);

  // Actualiser les commandes
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError("");

      await fetchOrders();
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Impossible d'actualiser les commandes."
        )
      );
    } finally {
      setRefreshing(false);
    }
  };

  // Modifier le statut d'une commande
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingOrderId(orderId);
      setError("");

      const updatedOrder = await orderService.updateOrderStatus(
        orderId,
        newStatus
      );

      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                ...updatedOrder,
                status: updatedOrder?.status || newStatus,
              }
            : order
        )
      );

      if (selectedOrder?.id === orderId) {
        setSelectedOrder((previousOrder) => ({
          ...previousOrder,
          ...updatedOrder,
          status: updatedOrder?.status || newStatus,
        }));
      }
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Impossible de modifier le statut de la commande."
        )
      );
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Supprimer une commande
  const handleDelete = async (orderId) => {
    const confirmed = window.confirm(
      "Voulez-vous vraiment supprimer cette commande ?"
    );

    if (!confirmed) return;

    try {
      setDeletingOrderId(orderId);
      setError("");

      await orderService.deleteOrder(orderId);

      setOrders((previousOrders) =>
        previousOrders.filter((order) => order.id !== orderId)
      );

      if (selectedOrder?.id === orderId) {
        setSelectedOrder(null);
      }
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Impossible de supprimer la commande."
        )
      );
    } finally {
      setDeletingOrderId(null);
    }
  };

  if (loading) {
    return <Loader message="Chargement des commandes..." fullScreen />;
  }

  return (
    <div className="admin-layout">

      <AdminSidebar />

      <div className="admin-main">

        <AdminNavbar title="Gestion des commandes" />

        <main className="admin-content">

          <div className="admin-page-header">

            <div>
              <h1>Gestion des commandes</h1>
              <p>
                Consultez et gérez les commandes des clients.
              </p>
            </div>

            <button
              type="button"
              className="admin-refresh-btn"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw
                size={18}
                className={refreshing ? "animate-spin" : ""}
              />
              {refreshing ? "Actualisation..." : "Actualiser"}
            </button>

          </div>

          {error && (
            <div className="admin-error-message" role="alert">
              {error}
            </div>
          )}

          {/* Statistiques */}
          <div className="admin-stats-grid">

            <div className="admin-stat-card">
              <span>Total des commandes</span>
              <strong>{orders.length}</strong>
            </div>

            <div className="admin-stat-card">
              <span>En attente</span>
              <strong>
                {
                  orders.filter(
                    (order) => order.status === "PENDING"
                  ).length
                }
              </strong>
            </div>

            <div className="admin-stat-card">
              <span>En préparation</span>
              <strong>
                {
                  orders.filter(
                    (order) => order.status === "PREPARING"
                  ).length
                }
              </strong>
            </div>

            <div className="admin-stat-card">
              <span>Livrées</span>
              <strong>
                {
                  orders.filter(
                    (order) => order.status === "DELIVERED"
                  ).length
                }
              </strong>
            </div>

          </div>

          {/* Tableau des commandes */}
          <div className="admin-table-container">

            <div className="admin-table-header">
              <h2>Liste des commandes</h2>
              <span>{orders.length} commande(s)</span>
            </div>

            {orders.length === 0 ? (
              <div className="admin-empty-state">
                <p>Aucune commande disponible.</p>
              </div>
            ) : (
              <div className="admin-table-scroll">

                <table className="admin-table">

                  <thead>
                    <tr>
                      <th>N° Commande</th>
                      <th>Client</th>
                      <th>Date</th>
                      <th>Total</th>
                      <th>Type</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>

                    {orders.map((order) => (
                      <tr key={order.id}>

                        <td>#{order.id}</td>

                        <td>
                          <div className="order-customer-info">
                            <strong>
                              {getCustomerName(order.user)}
                            </strong>

                            <span>
                              {order.user?.email || "Email inconnu"}
                            </span>
                          </div>
                        </td>

                        <td>{formatDate(order.orderDate)}</td>

                        <td>{formatPrice(order.totalPrice)}</td>

                        <td>
                          {order.orderType || "Non précisé"}
                        </td>

                        <td>

                          <select
                            value={order.status || "PENDING"}
                            onChange={(event) =>
                              handleStatusChange(
                                order.id,
                                event.target.value
                              )
                            }
                            disabled={
                              updatingOrderId === order.id ||
                              deletingOrderId === order.id
                            }
                            aria-label={`Statut de la commande ${order.id}`}
                          >

                            {ORDER_STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {STATUS_LABELS[status]}
                              </option>
                            ))}

                          </select>

                          {updatingOrderId === order.id && (
                            <span>Modification...</span>
                          )}

                        </td>

                        <td>
                          <div className="admin-table-actions">

                            <button
                              type="button"
                              onClick={() => setSelectedOrder(order)}
                              title="Voir les détails"
                              aria-label={`Voir la commande ${order.id}`}
                            >
                              <Eye size={18} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(order.id)}
                              disabled={
                                deletingOrderId === order.id ||
                                updatingOrderId === order.id
                              }
                              title="Supprimer"
                              aria-label={`Supprimer la commande ${order.id}`}
                            >
                              <Trash2 size={18} />
                            </button>

                          </div>
                        </td>

                      </tr>
                    ))}

                  </tbody>

                </table>

              </div>
            )}

          </div>

        </main>

      </div>

      {/* Détail de la commande */}
      {selectedOrder && (
        <div
          className="admin-modal-overlay"
          onClick={() => setSelectedOrder(null)}
        >

          <div
            className="admin-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-modal-title"
          >

            <div className="admin-modal-header">

              <h2 id="order-modal-title">
                Commande #{selectedOrder.id}
              </h2>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                aria-label="Fermer"
              >
                <X size={20} />
              </button>

            </div>

            <div className="admin-modal-body">

              <div>
                <strong>Client :</strong>
                <p>{getCustomerName(selectedOrder.user)}</p>
              </div>

              <div>
                <strong>Email :</strong>
                <p>
                  {selectedOrder.user?.email || "Non renseigné"}
                </p>
              </div>

              <div>
                <strong>Téléphone :</strong>
                <p>
                  {selectedOrder.user?.phone || "Non renseigné"}
                </p>
              </div>

              <div>
                <strong>Date :</strong>
                <p>{formatDate(selectedOrder.orderDate)}</p>
              </div>

              <div>
                <strong>Adresse de livraison :</strong>
                <p>
                  {selectedOrder.deliveryAddress || "Non renseignée"}
                </p>
              </div>

              <div>
                <strong>Type de commande :</strong>
                <p>
                  {selectedOrder.orderType || "Non précisé"}
                </p>
              </div>

              <div>
                <strong>Statut :</strong>
                <p>
                  {STATUS_LABELS[selectedOrder.status] ||
                    selectedOrder.status ||
                    "Non renseigné"}
                </p>
              </div>

              <div>
                <strong>Total :</strong>
                <p>{formatPrice(selectedOrder.totalPrice)}</p>
              </div>

              <p className="admin-order-note">
                Les détails des pizzas ne sont pas disponibles dans
                le modèle CustomerOrder actuel.
              </p>

            </div>

            <div className="admin-modal-footer">

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
              >
                Fermer
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default ManageOrders;
