
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import Loader from "../../components/common/Loader";
import orderService from "../../services/orderService";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const initializeOrders = async () => {
      try {
        const data = await orderService.getMyOrders();

        if (isMounted) {
          setOrders(Array.isArray(data) ? data : []);
          setError("");
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.data?.message ||
            "Impossible de récupérer vos commandes."
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

  const formatDate = (date) => {
    if (!date) return "Date indisponible";

    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price) => {
    return `${Number(price || 0).toFixed(2)} DT`;
  };

  const getStatusLabel = (status) => {
    const statuses = {
      PENDING: "En attente",
      CONFIRMED: "Confirmée",
      PREPARING: "En préparation",
      READY: "Prête",
      OUT_FOR_DELIVERY: "En livraison",
      DELIVERED: "Livrée",
      CANCELLED: "Annulée",
    };

    return statuses[status] || status || "Inconnu";
  };

  const getStatusClass = (status) => {
    const classes = {
      PENDING: "pending",
      CONFIRMED: "confirmed",
      PREPARING: "preparing",
      READY: "ready",
      OUT_FOR_DELIVERY: "delivery",
      DELIVERED: "delivered",
      CANCELLED: "cancelled",
    };

    return classes[status] || "default";
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="orders-page">
          <Loader />
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="orders-page">
        <div className="orders-container">

          <div className="orders-header">
            <h1>Mes commandes</h1>
            <p>Retrouvez l'historique de vos commandes Pizza Pete's.</p>
          </div>

          {error && (
            <div className="orders-error" role="alert">
              {error}
            </div>
          )}

          {!error && orders.length === 0 && (
            <div className="orders-empty">
              <h2>Aucune commande pour le moment</h2>
              <p>
                Vous n'avez pas encore passé de commande.
              </p>

              <Link to="/menu" className="orders-menu-link">
                Découvrir notre menu
              </Link>
            </div>
          )}

          {orders.length > 0 && (
            <div className="orders-list">
              {orders.map((order) => (
                <article
                  className="order-card"
                  key={order.id}
                >
                  <div className="order-card-header">
                    <div>
                      <h2>Commande #{order.id}</h2>
                      <p>{formatDate(order.orderDate)}</p>
                    </div>

                    <span
                      className={`order-status ${getStatusClass(order.status)}`}
                    >
                      {getStatusLabel(order.status)}
                    </span>
                  </div>

                  <div className="order-card-details">
                    <div>
                      <span>Montant total</span>
                      <strong>
                        {formatPrice(order.totalPrice)}
                      </strong>
                    </div>

                    <div>
                      <span>Type de commande</span>
                      <strong>
                        {order.orderType || "Non précisé"}
                      </strong>
                    </div>

                    <div>
                      <span>Adresse de livraison</span>
                      <strong>
                        {order.deliveryAddress || "Non précisée"}
                      </strong>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="orders-back">
            <Link to="/menu">
              Retour au menu
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}

export default Orders;
