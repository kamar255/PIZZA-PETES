
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Pizza,
  ShoppingBag,
  Users,
  LogOut,
  Store,
  X,
  Ruler,
  Wheat,
  Cherry,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";

function AdminSidebar({ isOpen = true, onClose }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const menuItems = [
    {
      label: "Tableau de bord",
      path: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Gestion des pizzas",
      path: "/admin/pizzas",
      icon: Pizza,
    },
    {
      label: "Gestion des tailles",
      path: "/admin/sizes",
      icon: Ruler,
    },
    {
      label: "Gestion des pâtes",
      path: "/admin/doughs",
      icon: Wheat,
    },
    {
      label: "Gestion des garnitures",
      path: "/admin/toppings",
      icon: Cherry,
    },
    {
      label: "Gestion des commandes",
      path: "/admin/orders",
      icon: ShoppingBag,
    },
    {
      label: "Gestion des utilisateurs",
      path: "/admin/users",
      icon: Users,
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside className={`admin-sidebar ${isOpen ? "open" : "closed"}`}>
      <div className="admin-sidebar-header">
        <NavLink
          to="/admin/dashboard"
          className="admin-brand"
          onClick={onClose}
        >
          <Store size={27} />

          <span>
            PIZZA PETE'S
            <small>ADMINISTRATION</small>
          </span>
        </NavLink>

        <button
          type="button"
          className="admin-sidebar-close"
          onClick={onClose}
          aria-label="Fermer le menu"
        >
          <X size={21} />
        </button>
      </div>

      <div className="admin-sidebar-section">
        <span className="admin-sidebar-label">
          MENU PRINCIPAL
        </span>

        <nav className="admin-sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end
                onClick={onClose}
                className={({ isActive }) =>
                  isActive
                    ? "admin-nav-link active"
                    : "admin-nav-link"
                }
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="admin-sidebar-bottom">
        <button
          type="button"
          className="admin-logout-button"
          onClick={handleLogout}
        >
          <LogOut size={19} />
          <span>Se déconnecter</span>
        </button>

        <div className="admin-sidebar-footer">
          <span>Pizza Pete's</span>
          <small>Administration © 2026</small>
        </div>
      </div>
    </aside>
  );
}

export default AdminSidebar;
