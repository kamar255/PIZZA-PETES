
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import LoginForm from "../../components/auth/LoginForm";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await login(formData);
      const user = response?.user;

      if (!user) {
        throw new Error(
          "Les informations utilisateur n'ont pas été reçues."
        );
      }

      if (user.role?.toUpperCase() === "ADMIN") {
        navigate("/admin/dashboard");
      } else {
        navigate(location.state?.from?.pathname || "/");
      }
    } catch (error) {
      console.error("Erreur de connexion :", error);

      setError(
        error.response?.data?.message ||
        error.message ||
        "Adresse e-mail ou mot de passe incorrect."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <LoginForm
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        error={error}
        loading={loading}
      />
    </main>
  );
}

export default Login;
