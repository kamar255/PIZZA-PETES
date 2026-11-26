
import { Menu, Bell, UserCircle } from "lucide-react";

import { useAuth } from "../../hooks/useAuth";

function AdminNavbar({
  title = "Tableau de bord",
  onMenuClick,
}) {
  const { user } = useAuth();

  const fullName = [
    user?.firstName,
    user?.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  const adminName =
    fullName ||
    user?.name ||
    user?.fullName ||
    user?.email ||
    "Administrateur";

  return (
    <header className="admin-navbar">

      <div className="admin-navbar-left">

        <button
          type="button"
          className="admin-menu-toggle"
          onClick={onMenuClick}
          aria-label="Ouvrir le menu"
          disabled={!onMenuClick}
        >
          <Menu size={23} />
        </button>

        <div className="admin-navbar-title">

          <h2>{title}</h2>

          <span>
            Bienvenue dans votre espace de gestion
          </span>

        </div>

      </div>

      <div className="admin-navbar-right">

        <button
          type="button"
          className="admin-notification-button"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell size={20} />
        </button>

        <div className="admin-profile">

          <div className="admin-profile-avatar">
            <UserCircle size={25} />
          </div>

          <div className="admin-profile-info">

            <strong>{adminName}</strong>

            <span>Administrateur</span>

          </div>

        </div>

      </div>

    </header>
  );
}

export default AdminNavbar;
