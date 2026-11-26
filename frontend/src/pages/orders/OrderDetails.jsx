
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  ShoppingBag,
} from "lucide-react";

import orderService from "../../services/orderService";

import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import Loader from "../../components/common/Loader";

function OrderDetails() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadOrder = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await orderService.getOrderById(id);

        if (isMounted) {
          setOrder(data);
        }
      } catch (err) {
        console.error(
          "Erreur de chargement de la commande :",
          err
        );

        if (isMounted) {
          setError(
            "Impossible de récupérer les détails de cette commande."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadOrder();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case "DELIVERED":
      case "COMPLETED":
        return <CheckCircle size={20} />;

      case "CANCELLED":
        return <XCircle size={20} />;

      default:
        return <Clock size={20} />;
    }
  };

  const getStatusLabel = (status) => {
    const statuses = {
      PENDING: "En attente",
      CONFIRMED: "Confirmée",
      PREPARING: "En préparation",
      READY: "Prête",
      OUT_FOR_DELIVERY: "En livraison",
      DELIVERED: "Livrée",
      COMPLETED: "Terminée",
      CANCELLED: "Annulée",
    };

    return (
      statuses[status?.toUpperCase()] ||
      status ||
      "Inconnue"
    );
  };

  const formatDate = (date) => {
    if (!date) return "Date indisponible";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date indisponible";
    }

    return parsedDate.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const items = Array.isArray(order?.items)
    ? order.items
    : Array.isArray(order?.orderItems)
      ? order.orderItems
      : [];

  const getItemName = (item) => {
    return (
      item.pizza?.name ||
      item.pizzaName ||
      item.name ||
      "Pizza"
    );
  };

  const getItemQuantity = (item) => {
    return Number(item.quantity) || 1;
  };

  const getItemPrice = (item) => {
    return Number(
      item.unitPrice ??
      item.price ??
      item.pizza?.price ??
      0
    );
  };

  if (loading) {
    return (
      <Loader
        message="Chargement de la commande..."
        fullScreen
      />
    );
  }

  if (error || !order) {
    return (
      <div className="app">
        <Navbar
          cartCount={0}
          onOpenCart={() => {}}
        />

        <main className="order-details-page">
          <p className="auth-error" role="alert">
            {error || "Commande introuvable."}
          </p>

          <Link
            to="/orders"
            className="primary-button"
          >
            <ArrowLeft size={18} />
            Retour aux commandes
          </Link>
        </main>

        <Footer />
      </div>
    );
  }

  const total = Number(
    order.totalAmount ??
    order.totalPrice ??
    order.total ??
    0
  );

  return (
    <div className="app">
      <Navbar
        cartCount={0}
        onOpenCart={() => {}}
      />

      <main className="order-details-page">
        <Link
          to="/orders"
          className="back-link"
        >
          <ArrowLeft size={18} />
          Retour à mes commandes
        </Link>

        <section className="order-details-heading">
          <span className="section-label">
            <span></span>
            SUIVI DE COMMANDE
          </span>

          <h1>
            Commande <span>#{order.id}</span>
          </h1>

          <p>
            Passée le{" "}
            {formatDate(
              order.createdAt || order.orderDate
            )}
          </p>
        </section>

        <section className="order-status-card">
          {getStatusIcon(order.status)}

          <div>
            <span>Statut actuel</span>
            <strong>
              {getStatusLabel(order.status)}
            </strong>
          </div>
        </section>

        <section className="order-items-card">
          <h2>
            <ShoppingBag size={21} />
            Articles commandés
          </h2>

          {items.length === 0 ? (
            <p>
              Aucun article disponible pour cette commande.
            </p>
          ) : (
            <div className="order-items-list">
              {items.map((item, index) => (
                <div
                  className="order-item"
                  key={item.id || index}
                >
                  <div>
                    <strong>{getItemName(item)}</strong>

                    <span>
                      Quantité : {getItemQuantity(item)}
                    </span>
                  </div>

                  <strong>
                    {(
                      getItemPrice(item) *
                      getItemQuantity(item)
                    ).toFixed(2)}{" "}
                    DT
                  </strong>
                </div>
              ))}
            </div>
          )}

          <div className="order-total">
            <span>Total de la commande</span>

            <strong>
              {total.toFixed(2)} DT
            </strong>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default OrderDetails;
