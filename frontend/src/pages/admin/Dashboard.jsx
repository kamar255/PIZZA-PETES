
import { useEffect, useState } from "react";

import {
  Pizza,
  ShoppingBag,
  Users,
  DollarSign,
  Clock,
  ArrowRight,
} from "lucide-react";

import { Link } from "react-router-dom";

import pizzaService from "../../services/pizzaService";
import orderService from "../../services/orderService";
import userService from "../../services/userService";

import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminNavbar from "../../components/admin/AdminNavbar";
import Loader from "../../components/common/Loader";

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
            (total, order) =>
              total + Number(order.totalPrice || 0),
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
      icon: <Pizza size={25} />,
    },
    {
      title: "Total des commandes",
      value: stats.orders,
      icon: <ShoppingBag size={25} />,
    },
    {
      title: "Total des clients",
      value: stats.users,
      icon: <Users size={25} />,
    },
    {
      title: "Chiffre d'affaires",
      value: `${stats.revenue.toFixed(2)} DT`,
      icon: <DollarSign size={25} />,
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
    if (!date) {
      return "Date inconnue";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date inconnue";
    }

    return parsedDate.toLocaleDateString("fr-FR");
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

          <div className="admin-page-heading">
            <div>
              <h1>Tableau de bord</h1>
              <p>
                Bienvenue dans l'espace administration de Pizza Pete's.
              </p>
            </div>
          </div>

          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}

          {/* Statistiques */}
          <section className="dashboard-stats">

            {cards.map((card) => (
              <article
                className="dashboard-stat-card"
                key={card.title}
              >
                <div className="dashboard-stat-icon">
                  {card.icon}
                </div>

                <div>
                  <span>{card.title}</span>
                  <strong>{card.value}</strong>
                </div>
              </article>
            ))}

          </section>

          {/* Dernières commandes */}
          <section className="dashboard-orders">

            <div className="dashboard-section-heading">

              <div>
                <h2>Dernières commandes</h2>
                <p>
                  Les cinq commandes les plus récentes.
                </p>
              </div>

              <Link to="/admin/orders">
                Voir tout
                <ArrowRight size={17} />
              </Link>

            </div>

            {recentOrders.length === 0 ? (
              <p>Aucune commande disponible.</p>
            ) : (
              <div className="admin-table-wrapper">

                <table className="admin-table">

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

                    {recentOrders.map((order) => (
                      <tr key={order.id}>

                        <td>#{order.id}</td>

                        <td>
                          {getCustomerName(order)}
                        </td>

                        <td>
                          {formatDate(order.orderDate)}
                        </td>

                        <td>
                          {Number(order.totalPrice || 0).toFixed(2)} DT
                        </td>

                        <td>
                          <span className="admin-status">
                            <Clock size={14} />
                            {order.status || "Inconnue"}
                          </span>
                        </td>

                      </tr>
                    ))}

                  </tbody>

                </table>

              </div>
            )}

          </section>

        </main>

      </div>

    </div>
  );
}

export default Dashboard;
