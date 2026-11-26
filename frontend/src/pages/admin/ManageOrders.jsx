
import { useCallback, useEffect, useState } from "react";
import {
  Eye,
  RefreshCw,
  Trash2,
  X,
  ShoppingBag,
  Clock,
  ChefHat,
  CheckCircle,
  MapPin,
  User,
  CalendarDays,
  CreditCard,
} from "lucide-react";

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

const STATUS_COLORS = {
  PENDING: { background: "#f8ecd4", color: "#a87524" },
  CONFIRMED: { background: "#e5edf8", color: "#416c9f" },
  PREPARING: { background: "#fbe8df", color: "#c45132" },
  READY: { background: "#eee8f7", color: "#7956a5" },
  OUT_FOR_DELIVERY: { background: "#e2eeee", color: "#347979" },
  DELIVERED: { background: "#e4eee3", color: "#527b4d" },
  CANCELLED: { background: "#f7e4e2", color: "#b84c45" },
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

  return Number.isFinite(amount)
    ? `${amount.toFixed(2)} DT`
    : "0,00 DT";
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
  return err.response?.data?.message || err.message || fallback;
}

function getOrderTypeLabel(type) {
  if (!type) return "Non précisé";

  const normalized = String(type).toUpperCase();

  if (normalized.includes("DELIVERY")) return "Livraison";
  if (
    normalized.includes("PICKUP") ||
    normalized.includes("RETRAIT")
  ) {
    return "À emporter";
  }

  return type;
}

function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [deletingOrderId, setDeletingOrderId] = useState(null);

  const fetchOrders = useCallback(async () => {
    const response = await orderService.getAllOrders();

    if (!Array.isArray(response)) {
      throw new Error("Format de commandes invalide.");
    }

    setOrders(response);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initializeOrders = async () => {
      try {
        const response = await orderService.getAllOrders();

        if (isMounted) {
          if (!Array.isArray(response)) {
            throw new Error("Format de commandes invalide.");
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
        if (isMounted) setLoading(false);
      }
    };

    initializeOrders();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError("");
      await fetchOrders();
    } catch (err) {
      setError(
        getErrorMessage(err, "Impossible d'actualiser les commandes.")
      );
    } finally {
      setRefreshing(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingOrderId(orderId);
      setError("");

      const updatedOrder = await orderService.updateOrderStatus(
        orderId,
        newStatus
      );

      setOrders((previous) =>
        previous.map((order) =>
          order.id === orderId
            ? {
                ...order,
                ...(updatedOrder || {}),
                status: updatedOrder?.status || newStatus,
              }
            : order
        )
      );

      if (selectedOrder?.id === orderId) {
        setSelectedOrder((previous) => ({
          ...previous,
          ...(updatedOrder || {}),
          status: updatedOrder?.status || newStatus,
        }));
      }
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Impossible de modifier le statut."
        )
      );
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleDelete = async (orderId) => {
    if (
      !window.confirm(
        "Voulez-vous vraiment supprimer cette commande ?"
      )
    ) {
      return;
    }

    try {
      setDeletingOrderId(orderId);
      setError("");

      await orderService.deleteOrder(orderId);

      setOrders((previous) =>
        previous.filter((order) => order.id !== orderId)
      );

      if (selectedOrder?.id === orderId) {
        setSelectedOrder(null);
      }
    } catch (err) {
      setError(
        getErrorMessage(err, "Impossible de supprimer la commande.")
      );
    } finally {
      setDeletingOrderId(null);
    }
  };

  const pendingCount = orders.filter(
    (order) => order.status === "PENDING"
  ).length;

  const preparingCount = orders.filter(
    (order) => order.status === "PREPARING"
  ).length;

  const deliveredCount = orders.filter(
    (order) => order.status === "DELIVERED"
  ).length;

  if (loading) {
    return (
      <Loader message="Chargement des commandes..." fullScreen />
    );
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <div className="admin-main">
        <AdminNavbar title="Gestion des commandes" />

        <main className="admin-content">

          <style>{`
            .orders-page {
              color: #302923;
            }

            .orders-heading {
              display: flex;
              justify-content: space-between;
              align-items: center;
              gap: 20px;
              margin-bottom: 30px;
            }

            .orders-heading h1 {
              margin: 0 0 7px;
              font-family: var(--font-primary);
              font-size: 27px;
              color: #302923;
            }

            .orders-heading p {
              margin: 0;
              color: #918579;
              font-size: 12px;
            }

            .orders-refresh {
              display: flex;
              align-items: center;
              gap: 8px;
              padding: 10px 16px;
              border: 1px solid #e7dccb;
              border-radius: 8px;
              background: transparent;
              color: #665747;
              font-size: 11px;
              cursor: pointer;
              transition: .2s;
            }

            .orders-refresh:hover {
              border-color: #c49a55;
              color: #a77c39;
              background: #f4eee4;
            }

            .orders-stats {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 0;
              margin-bottom: 30px;
              padding: 19px 0;
              border-top: 1px solid #e8dfd2;
              border-bottom: 1px solid #e8dfd2;
            }

            .orders-stat {
              display: flex;
              align-items: center;
              gap: 13px;
              padding: 3px 22px;
              border-right: 1px solid #e8dfd2;
            }

            .orders-stat:first-child {
              padding-left: 5px;
            }

            .orders-stat:last-child {
              border-right: none;
            }

            .orders-stat-icon {
              color: #bd9250;
            }

            .orders-stat span {
              display: block;
              margin-bottom: 5px;
              color: #968a7d;
              font-size: 10px;
            }

            .orders-stat strong {
              color: #302923;
              font-size: 21px;
              font-weight: 700;
            }

            .orders-table-section {
              border-top: 1px solid #e5dacb;
            }

            .orders-table-heading {
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 15px;
              padding: 20px 4px;
            }

            .orders-table-heading h2 {
              margin: 0 0 5px;
              color: #302923;
              font-family: var(--font-primary);
              font-size: 17px;
            }

            .orders-table-heading p {
              margin: 0;
              color: #968a7d;
              font-size: 10px;
            }

            .orders-count {
              color: #a47b42;
              font-size: 11px;
              font-weight: 700;
            }

            .orders-table-scroll {
              overflow-x: auto;
              border-top: 1px solid #e5dacb;
              border-bottom: 1px solid #e5dacb;
            }

            .orders-table {
              width: 100%;
              min-width: 850px;
              border-collapse: collapse;
              text-align: left;
            }

            .orders-table thead {
              background: #eee7db;
            }

            .orders-table th {
              padding: 14px 15px;
              color: #827466;
              font-size: 9px;
              font-weight: 700;
              letter-spacing: 1px;
              text-transform: uppercase;
            }

            .orders-table td {
              padding: 16px 15px;
              border-bottom: 1px solid #eae2d7;
              color: #665c51;
              font-size: 11px;
            }

            .orders-table tbody tr {
              background: rgba(255,255,255,.18);
              transition: background .2s;
            }

            .orders-table tbody tr:nth-child(even) {
              background: rgba(237,230,219,.35);
            }

            .orders-table tbody tr:hover {
              background: #eee6d9;
            }

            .orders-number {
              color: #b27e39;
              font-weight: 700;
            }

            .orders-customer strong {
              display: block;
              margin-bottom: 5px;
              color: #302923;
              font-size: 11px;
            }

            .orders-customer span {
              color: #9b8f82;
              font-size: 9px;
            }

            .orders-status {
              display: inline-block;
              padding: 6px 10px;
              border-radius: 4px;
              font-size: 9px;
              font-weight: 700;
            }

            .orders-status-select {
              display: block;
              max-width: 145px;
              margin-top: 7px;
              padding: 6px 8px;
              border: 1px solid #dfd4c4;
              border-radius: 5px;
              background: #f8f4ed;
              color: #665747;
              font-size: 9px;
              outline: none;
            }

            .orders-status-select:focus {
              border-color: #bd9250;
            }

            .orders-actions {
              display: flex;
              align-items: center;
              gap: 7px;
            }

            .orders-action {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 30px;
              height: 30px;
              border: 1px solid #dfd4c4;
              border-radius: 6px;
              background: transparent;
              color: #827466;
              cursor: pointer;
              transition: .2s;
            }

            .orders-action:hover {
              border-color: #bd9250;
              color: #a47b42;
              background: #f5eee3;
            }

            .orders-action.delete:hover {
              border-color: #d8aaa3;
              color: #bd5148;
              background: #f8e9e6;
            }

            .orders-empty {
              padding: 55px 20px;
              text-align: center;
              color: #928678;
            }

            .orders-empty svg {
              margin-bottom: 12px;
              color: #bd9250;
            }

            .orders-empty h3 {
              margin: 0 0 7px;
              color: #51463b;
              font-size: 14px;
            }

            .orders-empty p {
              margin: 0;
              font-size: 11px;
            }

            .orders-error {
              margin-bottom: 20px;
              padding: 12px 15px;
              border-left: 3px solid #bd5148;
              background: #f8e9e6;
              color: #a53f38;
              font-size: 11px;
            }

            .order-details-overlay {
              position: fixed;
              inset: 0;
              z-index: 300;
              display: flex;
              justify-content: center;
              align-items: center;
              padding: 20px;
              overflow-y: auto;
              background: rgba(37,31,25,.55);
              backdrop-filter: blur(4px);
            }

            .order-details {
              width: 100%;
              max-width: 620px;
              max-height: 90vh;
              overflow-y: auto;
              padding: 27px;
              border: 1px solid #e6dac8;
              background: #f8f5ef;
              color: #302923;
              box-shadow: 0 20px 60px rgba(30,24,18,.2);
            }

            .order-details-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              gap: 15px;
              padding-bottom: 18px;
              border-bottom: 1px solid #e3d8c8;
            }

            .order-details-header small {
              color: #ae854b;
              font-size: 9px;
              font-weight: 700;
              letter-spacing: 2px;
            }

            .order-details-header h2 {
              margin: 6px 0 0;
              font-family: var(--font-primary);
              font-size: 21px;
            }

            .order-details-close {
              display: flex;
              justify-content: center;
              align-items: center;
              width: 33px;
              height: 33px;
              border: 1px solid #dfd4c4;
              background: transparent;
              color: #665747;
              cursor: pointer;
            }

            .order-details-close:hover {
              color: #c64a37;
              border-color: #c64a37;
            }

            .order-details-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 17px;
              padding: 20px 0;
              border-bottom: 1px solid #e3d8c8;
            }

            .order-detail-item {
              display: flex;
              align-items: flex-start;
              gap: 10px;
            }

            .order-detail-item svg {
              flex-shrink: 0;
              color: #ae854b;
            }

            .order-detail-item span {
              display: block;
              margin-bottom: 5px;
              color: #998b7c;
              font-size: 9px;
            }

            .order-detail-item strong {
              color: #40372e;
              font-size: 10px;
              overflow-wrap: anywhere;
            }

            .order-detail-section {
              padding: 17px 0;
              border-bottom: 1px solid #e3d8c8;
            }

            .order-detail-section h3 {
              margin: 0 0 12px;
              color: #51463b;
              font-family: var(--font-primary);
              font-size: 13px;
            }

            .order-detail-section p {
              margin: 5px 0;
              color: #786c5f;
              font-size: 10px;
              line-height: 1.6;
            }

            .order-detail-product {
              display: flex;
              gap: 13px;
              padding: 12px 0;
              border-bottom: 1px dashed #ded2c1;
            }

            .order-detail-product:last-child {
              border-bottom: none;
            }

            .order-detail-product img,
            .order-product-placeholder {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 62px;
              height: 62px;
              flex-shrink: 0;
              object-fit: cover;
              background: #eee5d8;
              color: #ae854b;
            }

            .order-product-info {
              flex: 1;
              min-width: 0;
            }

            .order-product-info strong {
              color: #40372e;
              font-size: 11px;
            }

            .order-product-info p {
              margin: 4px 0;
              color: #827466;
              font-size: 9px;
            }

            .order-product-bottom {
              display: flex;
              justify-content: space-between;
              gap: 10px;
              margin-top: 7px;
            }

            .order-product-bottom strong {
              color: #a47b42;
              font-size: 10px;
            }

            .order-details-footer {
              display: flex;
              justify-content: flex-end;
              padding-top: 20px;
            }

            .order-details-footer button {
              padding: 10px 23px;
              border: 1px solid #b38a50;
              background: #b38a50;
              color: white;
              font-size: 10px;
              cursor: pointer;
              transition: .2s;
            }

            .order-details-footer button:hover {
              background: #96703e;
            }

            @media (max-width: 900px) {
              .orders-stats {
                grid-template-columns: repeat(2, 1fr);
                row-gap: 18px;
              }

              .orders-stat:nth-child(2) {
                border-right: none;
              }
            }

            @media (max-width: 600px) {
              .orders-heading {
                align-items: flex-start;
                flex-direction: column;
              }

              .orders-stats {
                grid-template-columns: repeat(2, 1fr);
              }

              .orders-stat {
                padding: 5px 10px;
              }

              .orders-stat strong {
                font-size: 18px;
              }

              .orders-table-heading {
                align-items: flex-start;
              }

              .order-details {
                padding: 19px;
              }

              .order-details-grid {
                grid-template-columns: 1fr;
              }
            }
          `}</style>

          <div className="orders-page">

            <div className="orders-heading">
              <div>
                <h1>Gestion des commandes</h1>
                <p>
                  Suivez les commandes et leur progression.
                </p>
              </div>

              <button
                type="button"
                className="orders-refresh"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw
                  size={15}
                  className={refreshing ? "animate-spin" : ""}
                />
                {refreshing ? "Actualisation..." : "Actualiser"}
              </button>
            </div>

            {error && (
              <div className="orders-error" role="alert">
                {error}
              </div>
            )}

            {/* Statistiques sans grandes cartes */}
            <div className="orders-stats">

              <div className="orders-stat">
                <ShoppingBag className="orders-stat-icon" size={23} />
                <div>
                  <span>Total commandes</span>
                  <strong>{orders.length}</strong>
                </div>
              </div>

              <div className="orders-stat">
                <Clock
                  className="orders-stat-icon"
                  size={23}
                />
                <div>
                  <span>En attente</span>
                  <strong>{pendingCount}</strong>
                </div>
              </div>

              <div className="orders-stat">
                <ChefHat
                  className="orders-stat-icon"
                  size={23}
                />
                <div>
                  <span>En préparation</span>
                  <strong>{preparingCount}</strong>
                </div>
              </div>

              <div className="orders-stat">
                <CheckCircle
                  className="orders-stat-icon"
                  size={23}
                />
                <div>
                  <span>Livrées</span>
                  <strong>{deliveredCount}</strong>
                </div>
              </div>

            </div>

            {/* Tableau */}
            <section className="orders-table-section">

              <div className="orders-table-heading">
                <div>
                  <h2>Liste des commandes</h2>
                  <p>Consultez les détails et gérez les statuts.</p>
                </div>

                <span className="orders-count">
                  {orders.length} commande(s)
                </span>
              </div>

              {orders.length === 0 ? (
                <div className="orders-empty">
                  <ShoppingBag size={36} />
                  <h3>Aucune commande disponible</h3>
                  <p>Les nouvelles commandes apparaîtront ici.</p>
                </div>
              ) : (
                <div className="orders-table-scroll">
                  <table className="orders-table">
                    <thead>
                      <tr>
                        <th>N°</th>
                        <th>Client</th>
                        <th>Date</th>
                        <th>Total</th>
                        <th>Type</th>
                        <th>Statut</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {orders.map((order) => {
                        const status = order.status || "PENDING";
                        const colors =
                          STATUS_COLORS[status] ||
                          STATUS_COLORS.PENDING;

                        return (
                          <tr key={order.id}>
                            <td>
                              <span className="orders-number">
                                #{order.id}
                              </span>
                            </td>

                            <td className="orders-customer">
                              <strong>
                                {getCustomerName(order.user)}
                              </strong>
                              <span>
                                {order.user?.email || "Email inconnu"}
                              </span>
                            </td>

                            <td>{formatDate(order.orderDate)}</td>

                            <td>
                              <strong style={{ color: "#40372e" }}>
                                {formatPrice(order.totalPrice)}
                              </strong>
                            </td>

                            <td>
                              {getOrderTypeLabel(order.orderType)}
                            </td>

                            <td>
                              <span
                                className="orders-status"
                                style={{
                                  background: colors.background,
                                  color: colors.color,
                                }}
                              >
                                {STATUS_LABELS[status] || status}
                              </span>

                              <select
                                className="orders-status-select"
                                value={status}
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
                                aria-label={`Modifier le statut de la commande ${order.id}`}
                              >
                                {ORDER_STATUSES.map((itemStatus) => (
                                  <option
                                    key={itemStatus}
                                    value={itemStatus}
                                  >
                                    {STATUS_LABELS[itemStatus]}
                                  </option>
                                ))}
                              </select>
                            </td>

                            <td>
                              <div className="orders-actions">
                                <button
                                  type="button"
                                  className="orders-action"
                                  onClick={() =>
                                    setSelectedOrder(order)
                                  }
                                  title="Voir les détails"
                                  aria-label={`Voir la commande ${order.id}`}
                                >
                                  <Eye size={15} />
                                </button>

                                <button
                                  type="button"
                                  className="orders-action delete"
                                  onClick={() => handleDelete(order.id)}
                                  disabled={
                                    deletingOrderId === order.id ||
                                    updatingOrderId === order.id
                                  }
                                  title="Supprimer"
                                  aria-label={`Supprimer la commande ${order.id}`}
                                >
                                  {deletingOrderId === order.id ? (
                                    <RefreshCw
                                      size={14}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <Trash2 size={15} />
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>

      {/* Fenêtre de détails */}
      {selectedOrder && (
        <div
          className="order-details-overlay"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="order-details"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-details-title"
          >
            <div className="order-details-header">
              <div>
                <small>DÉTAILS DE LA COMMANDE</small>
                <h2 id="order-details-title">
                  Commande #{selectedOrder.id}
                </h2>
              </div>

              <button
                type="button"
                className="order-details-close"
                onClick={() => setSelectedOrder(null)}
                aria-label="Fermer"
              >
                <X size={17} />
              </button>
            </div>

            <div className="order-details-grid">
              <div className="order-detail-item">
                <User size={16} />
                <div>
                  <span>Client</span>
                  <strong>
                    {getCustomerName(selectedOrder.user)}
                  </strong>
                </div>
              </div>

              <div className="order-detail-item">
                <CalendarDays size={16} />
                <div>
                  <span>Date</span>
                  <strong>{formatDate(selectedOrder.orderDate)}</strong>
                </div>
              </div>

              <div className="order-detail-item">
                <ShoppingBag size={16} />
                <div>
                  <span>Type de commande</span>
                  <strong>
                    {getOrderTypeLabel(selectedOrder.orderType)}
                  </strong>
                </div>
              </div>

              <div className="order-detail-item">
                <CreditCard size={16} />
                <div>
                  <span>Montant total</span>
                  <strong style={{ color: "#a47b42" }}>
                    {formatPrice(selectedOrder.totalPrice)}
                  </strong>
                </div>
              </div>
            </div>

            <section className="order-detail-section">
              <h3>Coordonnées du client</h3>

              <p>
                Email :{" "}
                {selectedOrder.user?.email || "Non renseigné"}
              </p>

              <p>
                Téléphone :{" "}
                {selectedOrder.user?.phone || "Non renseigné"}
              </p>
            </section>

            <section className="order-detail-section">
              <h3>
                <MapPin
                  size={14}
                  style={{
                    marginRight: 7,
                    verticalAlign: "middle",
                    color: "#ae854b",
                  }}
                />
                Livraison / Retrait
              </h3>

              <p>
                {selectedOrder.deliveryAddress ||
                  "Aucune adresse renseignée"}
              </p>
            </section>

            <section className="order-detail-section">
              <h3>Articles commandés</h3>

              {Array.isArray(selectedOrder.items) &&
              selectedOrder.items.length > 0 ? (
                selectedOrder.items.map((item, index) => (
                  <div
                    className="order-detail-product"
                    key={
                      item.id ||
                      `${item.pizzaId || item.pizzaName}-${index}`
                    }
                  >
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.pizzaName || "Pizza"}
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="order-product-placeholder">
                        <ShoppingBag size={22} />
                      </div>
                    )}

                    <div className="order-product-info">
                      <strong>{item.pizzaName || "Pizza"}</strong>

                      <p>
                        Taille : {item.sizeName || "Non précisée"}
                      </p>

                      <p>
                        Pâte : {item.doughName || "Non précisée"}
                      </p>

                      {Array.isArray(item.toppings) &&
                        item.toppings.length > 0 && (
                          <p>
                            Garnitures :{" "}
                            {item.toppings
                              .map((topping) => topping.name)
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                        )}

                      <div className="order-product-bottom">
                        <span>
                          Quantité : {item.quantity || 1}
                        </span>

                        <strong>{formatPrice(item.subtotal)}</strong>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p>Aucun détail d'article disponible.</p>
              )}
            </section>

            <section className="order-detail-section">
              <h3>Statut actuel</h3>

              {(() => {
                const status = selectedOrder.status || "PENDING";
                const colors =
                  STATUS_COLORS[status] || STATUS_COLORS.PENDING;

                return (
                  <span
                    className="orders-status"
                    style={{
                      background: colors.background,
                      color: colors.color,
                    }}
                  >
                    {STATUS_LABELS[status] || status}
                  </span>
                );
              })()}
            </section>

            <div className="order-details-footer">
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
