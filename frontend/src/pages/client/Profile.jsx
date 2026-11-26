
import { Link, useNavigate } from "react-router-dom";

import {
  User,
  Mail,
  Phone,
  ShoppingBag,
  Pencil,
  LogOut,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";

import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import Button from "../../components/common/Button";

function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  if (!user) {
    return (
      <main className="auth-page">
        <p>Impossible de récupérer votre profil.</p>

        <Link to="/login">
          Se connecter
        </Link>
      </main>
    );
  }

  const fullName = [
    user.firstName,
    user.lastName,
  ]
    .filter(Boolean)
    .join(" ") || "Client";

  const role = user.role || "CLIENT";

  return (
    <div className="app">
      <Navbar cartCount={0} onOpenCart={() => {}} />

      <main className="profile-page">

        <section className="profile-heading">
          <span className="section-label">
            <span></span>
            ESPACE CLIENT
          </span>

          <h1>
            Mon <span>profil.</span>
          </h1>

          <p>
            Gérez vos informations personnelles et vos commandes.
          </p>
        </section>

        <section className="profile-card">

          <div className="profile-avatar">
            <User size={42} />
          </div>

          <h2>{fullName}</h2>

          <p className="profile-role">
            {role === "ADMIN"
              ? "Administrateur Pizza Pete's"
              : "Client Pizza Pete's"}
          </p>

          <div className="profile-information">

            <div className="profile-info-item">
              <Mail size={20} />

              <div>
                <span>Adresse e-mail</span>
                <strong>
                  {user.email || "Non renseignée"}
                </strong>
              </div>
            </div>

            <div className="profile-info-item">
              <Phone size={20} />

              <div>
                <span>Téléphone</span>
                <strong>
                  {user.phone || "Non renseigné"}
                </strong>
              </div>
            </div>

          </div>

          <div className="profile-actions">

            <Link
              to="/profile/edit"
              className="primary-button"
            >
              <Pencil size={17} />
              Modifier mon profil
            </Link>

            <Link
              to="/orders"
              className="profile-orders-link"
            >
              <ShoppingBag size={18} />
              Mes commandes
            </Link>

            <Button
              type="button"
              variant="secondary"
              onClick={handleLogout}
            >
              <LogOut size={17} />
              Se déconnecter
            </Button>

          </div>

        </section>

      </main>

      <Footer />
    </div>
  );
}

export default Profile;
