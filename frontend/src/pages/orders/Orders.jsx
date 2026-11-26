
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, ArrowRight, Clock, CheckCircle, XCircle } from "lucide-react";

import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import Loader from "../../components/common/Loader";

import orderService from "../../services/orderService";

function Orders() {
 

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await orderService.getMyOrders();

        setOrders(Array.isArray(response) ? response : []);
      } catch (err) {
        console.error("Erreur lors du chargement des commandes :", err);
        setError("Impossible de charger vos commandes.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatus = (status) => {
    const statuses = {
      PENDING: { label: "En attente", icon: Clock },
      CONFIRMED: { label: "Confirmée", icon: CheckCircle },
      PREPARING: { label: "En préparation", icon: Clock },
      READY: { label: "Prête", icon: CheckCircle },
      DELIVERED: { label: "Livrée", icon: CheckCircle },
      CANCELLED: { label: "Annulée", icon: XCircle },
    };

    return statuses[status] || {
      label: status || "Inconnue",
      icon: Package,
    };
  };

  const formatDate = (date) => {
    if (!date) return "Date inconnue";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date inconnue";
    }

    return parsedDate.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <>
      <Navbar />

      <main className="orders-page">
        <div className="orders-container">
          <div className="orders-header">
            <div>
              <span className="section-label">MON ESPACE</span>
              <h1>Mes commandes</h1>
              <p>
                Retrouvez ici l'historique de vos commandes Pizza Pete's.
              </p>
            </div>
          </div>

          {loading ? (
            <Loader message="Chargement de vos commandes..." />
          ) : error ? (
            <div className="orders-message">
              <p>{error}</p>
              <button onClick={() => window.location.reload()}>
                Réessayer
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="orders-empty">
              <Package size={48} />
              <h2>Aucune commande pour le moment</h2>
              <p>
                Vous n'avez pas encore passé de commande.
              </p>
              <Link to="/menu" className="orders-menu-link">
                Découvrir notre menu
                <ArrowRight size={18} />
              </Link>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map((order) => {
                const status = getStatus(order.status);
                const StatusIcon = status.icon;

                return (
                  <article
                    className="order-card"
                    key={order.id}
                  >
                    <div className="order-card-header">
                      <div>
                        <span>Commande</span>
                        <h2>#{order.id}</h2>
                      </div>

                      <div className="order-status">
                        <StatusIcon size={17} />
                        <span>{status.label}</span>
                      </div>
                    </div>

                    <div className="order-card-info">
                      <p>
                        Date : {formatDate(
                          order.createdAt || order.orderDate
                        )}
                      </p>

                      <p>
                        Articles :{" "}
                        {(order.items || order.orderItems || []).length}
                      </p>

                      <p>
                        Total :{" "}
                        {Number(
                          order.totalAmount ?? order.total ?? 0
                        ).toFixed(2)}{" "}
                        DT
                      </p>
                    </div>

                    <Link
                      to={`/orders/${order.id}`}
                      className="order-details-link"
                    >
                      Voir les détails
                      <ArrowRight size={17} />
                    </Link>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

export default Orders;
