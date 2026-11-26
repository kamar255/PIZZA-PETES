
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import userService from "../../services/userService";

import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";

function EditProfile() {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();

  const [formData, setFormData] = useState(() => ({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
  }));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await userService.updateProfile(formData);

      const updatedUser = response?.user || response;

      updateUser({
        ...user,
        ...updatedUser,
      });

      // Si l'adresse email a changé, l'ancien token JWT
      // ne correspond plus à l'adresse enregistrée.
      if (updatedUser.email !== user.email) {
        if (logout) {
          logout();
        }

        navigate("/login", {
          replace: true,
          state: {
            message: "Votre email a été modifié. Veuillez vous reconnecter.",
          },
        });

        return;
      }

      navigate("/profile");
    } catch (err) {
      console.error("Erreur de modification du profil :", err);

      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Impossible de modifier votre profil."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <main className="auth-page">
        <p>Vous devez être connecté pour modifier votre profil.</p>

        <Link to="/login">
          Se connecter
        </Link>
      </main>
    );
  }

  return (
    <div className="app">
      <Navbar cartCount={0} onOpenCart={() => {}} />

      <main className="edit-profile-page">
        <section className="edit-profile-card">

          <Link to="/profile" className="back-link">
            <ArrowLeft size={18} />
            Retour au profil
          </Link>

          <div className="section-label">
            <span></span>
            INFORMATIONS PERSONNELLES
          </div>

          <h1>
            Modifier mon <span>profil.</span>
          </h1>

          <p>
            Mettez à jour vos informations personnelles.
          </p>

          <form onSubmit={handleSubmit}>

            <Input
              label="Prénom"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Votre prénom"
              required
            />

            <Input
              label="Nom"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Votre nom"
              required
            />

            <Input
              label="Adresse e-mail"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="exemple@email.com"
              required
            />

            <Input
              label="Numéro de téléphone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Votre numéro de téléphone"
              required
            />

            {error && (
              <p className="auth-error" role="alert">
                {error}
              </p>
            )}

            <Button
              type="submit"
              loading={loading}
              disabled={loading}
            >
              <Save size={18} />
              Enregistrer les modifications
            </Button>

          </form>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default EditProfile;
