
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import authService from "../../services/authService";
import RegisterForm from "../../components/auth/RegisterForm";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
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

    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setLoading(true);

    try {
      const userData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
      };

      await authService.register(userData);

      navigate("/login", {
        state: {
          message: "Votre compte a été créé. Connectez-vous.",
        },
      });
    } catch (error) {
      console.error("Erreur d'inscription :", error);

      setError(
        error.response?.data?.message ||
        error.response?.data ||
        "Impossible de créer le compte. Vérifiez vos informations."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <RegisterForm
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        error={error}
        loading={loading}
      />
    </main>
  );
}

export default Register;
