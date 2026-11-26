
import { Link } from "react-router-dom";
import { LogIn } from "lucide-react";

import Input from "../common/Input";
import Button from "../common/Button";

function LoginForm({
  formData,
  handleChange,
  handleSubmit,
  error,
  loading,
}) {
  return (
    <div className="auth-card">
      <div className="auth-heading">
        <LogIn size={35} />

        <h1>Bienvenue chez Pizza Pete's</h1>

        <p>
          Connectez-vous pour commander vos pizzas préférées.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
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
          label="Mot de passe"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Votre mot de passe"
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
          Se connecter
        </Button>
      </form>

      <p className="auth-footer">
        Vous n'avez pas de compte ?{" "}
        <Link to="/register">Créer un compte</Link>
      </p>

      <Link to="/" className="auth-back">
        Retour à l'accueil
      </Link>
    </div>
  );
}

export default LoginForm;
