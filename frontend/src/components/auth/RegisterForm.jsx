
import { Link } from "react-router-dom";
import { UserPlus } from "lucide-react";

import Input from "../common/Input";
import Button from "../common/Button";

function RegisterForm({
  formData,
  handleChange,
  handleSubmit,
  error,
  loading,
}) {
  return (
    <div className="auth-card">
      <div className="auth-heading">
        <div className="auth-icon">
          <UserPlus size={30} />
        </div>

        <span className="auth-eyebrow">
          BIENVENUE CHEZ PIZZA PETE'S
        </span>

        <h1>Créer votre compte</h1>

        <p>
          Rejoignez notre univers gourmand et découvrez
          nos pizzas artisanales.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="auth-register-grid">
          <Input
            label="Prénom"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="Votre prénom"
            required
            disabled={loading}
          />

          <Input
            label="Nom"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Votre nom"
            required
            disabled={loading}
          />
        </div>

        <Input
          label="Adresse e-mail"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="exemple@email.com"
          required
          disabled={loading}
        />

        <Input
          label="Numéro de téléphone"
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Votre numéro de téléphone"
          required
          disabled={loading}
        />

        <Input
          label="Mot de passe"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Minimum 6 caractères"
          required
          disabled={loading}
        />

        <Input
          label="Confirmer le mot de passe"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Répétez votre mot de passe"
          required
          disabled={loading}
        />

        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}

        <Button
          type="submit"
          variant="primary"
          loading={loading}
          disabled={loading}
        >
          Créer mon compte
        </Button>
      </form>

      <p className="auth-footer">
        Vous avez déjà un compte ?{" "}
        <Link to="/login">Se connecter</Link>
      </p>

      <Link to="/" className="auth-back">
        ← Retour à l'accueil
      </Link>
    </div>
  );
}

export default RegisterForm;
