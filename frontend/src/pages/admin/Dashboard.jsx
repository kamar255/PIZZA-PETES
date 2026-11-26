
import { useEffect, useState } from "react";

import {
  Pizza,
  ShoppingBag,
  Users,
  DollarSign,
  
  ArrowRight,  
 
} from "lucide-react";

import { Link } from "react-router-dom";

import pizzaService from "../../services/pizzaService";
import orderService from "../../services/orderService";
import userService from "../../services/userService";

import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminNavbar from "../../components/admin/AdminNavbar";
import Loader from "../../components/common/Loader";

const STATUS_LABELS = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  PREPARING: "En préparation",
  READY: "Prête",
  OUT_FOR_DELIVERY: "En livraison",
  DELIVERED: "Livrée",
  COMPLETED: "Terminée",
  CANCELLED: "Annulée",
};

const STATUS_COLORS = {
  PENDING: { background: "#f8ecd4", color: "#a87524" },
  CONFIRMED: { background: "#e5edf8", color: "#416c9f" },
  PREPARING: { background: "#fbe8df", color: "#c45132" },
  READY: { background: "#eee8f7", color: "#7956a5" },
  OUT_FOR_DELIVERY: { background: "#e2eeee", color: "#347979" },
  DELIVERED: { background: "#e4eee3", color: "#527b4d" },
  COMPLETED: { background: "#e4eee3", color: "#527b4d" },
  CANCELLED: { background: "#f7e4e2", color: "#b84c45" },
};

function Dashboard() {
  const [stats, setStats] = useState({
    pizzas: 0,
    orders: 0,
    users: 0,
    revenue: 0,
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      try {
        const [pizzas, orders, users] = await Promise.all([
          pizzaService.getAllPizzas(),
          orderService.getAllOrders(),
          userService.getAllUsers(),
        ]);

        const pizzaList = Array.isArray(pizzas) ? pizzas : [];
        const orderList = Array.isArray(orders) ? orders : [];
        const userList = Array.isArray(users) ? users : [];

        const revenue = orderList
          .filter((order) =>
            ["DELIVERED", "COMPLETED"].includes(
              String(order.status || "").toUpperCase()
            )
          )
          .reduce(
            (total, order) => total + Number(order.totalPrice || 0),
            0
          );

        const sortedOrders = [...orderList].sort(
          (a, b) =>
            new Date(b.orderDate || 0) -
            new Date(a.orderDate || 0)
        );

        if (isMounted) {
          setStats({
            pizzas: pizzaList.length,
            orders: orderList.length,
            users: userList.length,
            revenue,
          });

          setRecentOrders(sortedOrders.slice(0, 5));
          setError("");
        }
      } catch (err) {
        console.error("Erreur de chargement du dashboard :", err);

        if (isMounted) {
          setError(
            "Impossible de charger les statistiques. Vérifie les API."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const cards = [
    {
      title: "Total des pizzas",
      value: stats.pizzas,
      icon: Pizza,
      description: "Pizzas enregistrées",
    },
    {
      title: "Total des commandes",
      value: stats.orders,
      icon: ShoppingBag,
      description: "Commandes reçues",
    },
    {
      title: "Total des clients",
      value: stats.users,
      icon: Users,
      description: "Comptes clients",
    },
    {
      title: "Chiffre d'affaires",
      value: `${stats.revenue.toFixed(2)} DT`,
      icon: DollarSign,
      description: "Commandes terminées",
    },
  ];

  const getCustomerName = (order) => {
    const firstName = order.user?.firstName || "";
    const lastName = order.user?.lastName || "";

    return (
      `${firstName} ${lastName}`.trim() ||
      order.user?.email ||
      "Client"
    );
  };

  const formatDate = (date) => {
    if (!date) return "Date inconnue";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date inconnue";
    }

    return parsedDate.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <Loader
        message="Chargement du tableau de bord..."
        fullScreen
      />
    );
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <div className="admin-main">
        <AdminNavbar title="Tableau de bord" />

        <main className="admin-content">
          <style>{`
            .lux-dashboard {
              color: #302923;
            }

            .lux-welcome {
              position: relative;
              display: flex;
              align-items: center;
              min-height: 215px;
              margin-bottom: 32px;
              padding: 35px;
              overflow: hidden;
              border: 1px solid #e4d8c7;
              background: #eee5d7;
            }

            .lux-welcome-image {
              position: absolute;
              inset: 0 0 0 auto;
              width: 53%;
              height: 100%;
              object-fit: cover;
              object-position: center;
              opacity: .8;
            }

            .lux-welcome-overlay {
              position: absolute;
              inset: 0;
              background: linear-gradient(
                90deg,
                #eee5d7 0%,
                rgba(238,229,215,.98) 38%,
                rgba(238,229,215,.72) 65%,
                rgba(238,229,215,.08) 100%
              );
            }

            .lux-welcome-content {
              position: relative;
              z-index: 1;
              max-width: 520px;
            }

            .lux-welcome-label {
              display: block;
              margin-bottom: 13px;
              color: #a77c42;
              font-size: 10px;
              font-weight: 800;
              letter-spacing: 2.5px;
              text-transform: uppercase;
            }

            .lux-welcome h1 {
              margin: 0 0 12px;
              color: #302923;
              font-family: var(--font-primary);
              font-size: clamp(25px, 4vw, 35px);
              font-weight: 700;
              line-height: 1.2;
            }

            .lux-welcome p {
              max-width: 420px;
              margin: 0;
              color: #766858;
              font-size: 12px;
              line-height: 1.8;
            }

            .lux-dashboard-heading {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 19px;
            }

            .lux-dashboard-heading h2 {
              margin: 0 0 6px;
              color: #302923;
              font-family: var(--font-primary);
              font-size: 20px;
            }

            .lux-dashboard-heading p {
              margin: 0;
              color: #968a7d;
              font-size: 11px;
            }

            .lux-stats {
              display: grid;
              grid-template-columns: repeat(4, minmax(0, 1fr));
              margin-bottom: 35px;
              padding: 20px 0;
              border-top: 1px solid #e5dacb;
              border-bottom: 1px solid #e5dacb;
            }

            .lux-stat {
              display: flex;
              align-items: center;
              gap: 14px;
              min-width: 0;
              padding: 4px 20px;
              border-right: 1px solid #e5dacb;
            }

            .lux-stat:first-child {
              padding-left: 5px;
            }

            .lux-stat:last-child {
              border-right: none;
            }

            .lux-stat-icon {
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
              width: 39px;
              height: 39px;
              border: 1px solid #e6d6be;
              border-radius: 50%;
              background: #f3ece1;
              color: #ad8248;
            }

            .lux-stat-info {
              min-width: 0;
            }

            .lux-stat-info span {
              display: block;
              margin-bottom: 6px;
              color: #938577;
              font-size: 10px;
            }

            .lux-stat-info strong {
              display: block;
              overflow-wrap: anywhere;
              color: #302923;
              font-size: 20px;
              font-weight: 700;
            }

            .lux-stat-info small {
              display: block;
              margin-top: 4px;
              color: #aa9c8d;
              font-size: 9px;
            }

            .lux-orders {
              border-top: 1px solid #e5dacb;
            }

            .lux-orders-heading {
              display: flex;
              justify-content: space-between;
              align-items: center;
              gap: 15px;
              padding: 20px 4px;
            }

            .lux-orders-heading h2 {
              margin: 0 0 5px;
              color: #302923;
              font-family: var(--font-primary);
              font-size: 18px;
            }

            .lux-orders-heading p {
              margin: 0;
              color: #968a7d;
              font-size: 10px;
            }

            .lux-view-all {
              display: inline-flex;
              align-items: center;
              gap: 8px;
              color: #a47b42;
              font-size: 10px;
              font-weight: 700;
              text-decoration: none;
              transition: .2s;
            }

            .lux-view-all:hover {
              color: #c54b36;
              gap: 12px;
            }

            .lux-orders-table-wrap {
              overflow-x: auto;
              border-top: 1px solid #e5dacb;
              border-bottom: 1px solid #e5dacb;
            }

            .lux-orders-table {
              width: 100%;
              min-width: 650px;
              border-collapse: collapse;
              text-align: left;
            }

            .lux-orders-table thead {
              background: #eee7db;
            }

            .lux-orders-table th {
              padding: 14px 15px;
              color: #827466;
              font-size: 9px;
              font-weight: 700;
              letter-spacing: 1px;
              text-transform: uppercase;
            }

            .lux-orders-table td {
              padding: 15px;
              border-bottom: 1px solid #eae2d7;
              color: #665c51;
              font-size: 10px;
            }

            .lux-orders-table tbody tr {
              background: rgba(255,255,255,.15);
              transition: background .2s;
            }

            .lux-orders-table tbody tr:nth-child(even) {
              background: rgba(237,230,219,.35);
            }

            .lux-orders-table tbody tr:hover {
              background: #eee6d9;
            }

            .lux-order-id {
              color: #a47b42;
              font-weight: 800;
            }

            .lux-order-customer {
              color: #40372e;
              font-weight: 600;
            }

            .lux-order-status {
              display: inline-block;
              padding: 6px 10px;
              border-radius: 4px;
              font-size: 9px;
              font-weight: 700;
            }

            .lux-empty {
              padding: 45px 20px;
              color: #968a7d;
              text-align: center;
              font-size: 11px;
            }

            .lux-empty svg {
              margin-bottom: 10px;
              color: #ad8248;
            }

            .lux-error {
              margin-bottom: 20px;
              padding: 12px 15px;
              border-left: 3px solid #bd5148;
              background: #f8e9e6;
              color: #a53f38;
              font-size: 11px;
            }

            @media (max-width: 1050px) {
              .lux-stats {
                grid-template-columns: repeat(2, minmax(0, 1fr));
                row-gap: 20px;
              }

              .lux-stat:nth-child(2) {
                border-right: none;
              }
            }

            @media (max-width: 600px) {
              .lux-welcome {
                min-height: 210px;
                padding: 24px;
              }

              .lux-welcome-image {
                width: 100%;
              }

              .lux-welcome-overlay {
                background: linear-gradient(
                  90deg,
                  rgba(238,229,215,.98),
                  rgba(238,229,215,.8)
                );
              }

              .lux-stats {
                grid-template-columns: repeat(2, minmax(0, 1fr));
                gap: 17px 0;
              }

              .lux-stat {
                gap: 9px;
                padding: 4px 10px;
              }

              .lux-stat-icon {
                width: 32px;
                height: 32px;
              }

              .lux-stat-icon svg {
                width: 17px;
                height: 17px;
              }

              .lux-stat-info strong {
                font-size: 17px;
              }

              .lux-orders-heading {
                align-items: flex-start;
              }
            }
          `}</style>

          <div className="lux-dashboard">

            {/* Accueil */}
            <section className="lux-welcome">
              <img
                className="lux-welcome-image"
                src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&auto=format&fit=crop&q=85"
                alt="Pizza fraîchement préparée"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />

              <div className="lux-welcome-overlay" />

              <div className="lux-welcome-content">
                <span className="lux-welcome-label">
                  Pizza Pete's Administration
                </span>

                <h1>
                  Bienvenue dans votre espace !
                </h1>

                <p>
                  Gérez vos pizzas, vos commandes et votre activité
                  depuis votre tableau de bord.
                </p>
              </div>
            </section>

            {/* Titre */}
            <div className="lux-dashboard-heading">
              <div>
                <h2>Vue d'ensemble</h2>
                <p>
                  Voici un aperçu de l'activité de votre restaurant.
                </p>
              </div>
            </div>

            {error && (
              <div className="lux-error" role="alert">
                {error}
              </div>
            )}

            {/* Statistiques */}
            <section className="lux-stats">
              {cards.map((card) => {
                const Icon = card.icon;

                return (
                  <article className="lux-stat" key={card.title}>
                    <div className="lux-stat-icon">
                      <Icon size={21} />
                    </div>

                    <div className="lux-stat-info">
                      <span>{card.title}</span>
                      <strong>{card.value}</strong>
                      <small>{card.description}</small>
                    </div>
                  </article>
                );
              })}
            </section>

            {/* Dernières commandes */}
            <section className="lux-orders">
              <div className="lux-orders-heading">
                <div>
                  <h2>Dernières commandes</h2>
                  <p>
                    Les cinq commandes les plus récentes.
                  </p>
                </div>

                <Link className="lux-view-all" to="/admin/orders">
                  Voir tout
                  <ArrowRight size={16} />
                </Link>
              </div>

              {recentOrders.length === 0 ? (
                <div className="lux-empty">
                  <ShoppingBag size={34} />
                  <p>Aucune commande disponible.</p>
                </div>
              ) : (
                <div className="lux-orders-table-wrap">
                  <table className="lux-orders-table">
                    <thead>
                      <tr>
                        <th>Commande</th>
                        <th>Client</th>
                        <th>Date</th>
                        <th>Montant</th>
                        <th>Statut</th>
                      </tr>
                    </thead>

                    <tbody>
                      {recentOrders.map((order) => {
                        const status = String(
                          order.status || ""
                        ).toUpperCase();

                        const colors =
                          STATUS_COLORS[status] ||
                          STATUS_COLORS.PENDING;

                        return (
                          <tr key={order.id}>
                            <td>
                              <span className="lux-order-id">
                                #{order.id}
                              </span>
                            </td>

                            <td>
                              <span className="lux-order-customer">
                                {getCustomerName(order)}
                              </span>
                            </td>

                            <td>{formatDate(order.orderDate)}</td>

                            <td>
                              {Number(
                                order.totalPrice || 0
                              ).toFixed(2)}{" "}
                              DT
                            </td>

                            <td>
                              <span
                                className="lux-order-status"
                                style={{
                                  background: colors.background,
                                  color: colors.color,
                                }}
                              >
                                {STATUS_LABELS[status] ||
                                  order.status ||
                                  "Inconnue"}
                              </span>
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
    </div>
  );
}

export default Dashboard;
