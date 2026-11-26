
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

function ProtectedRoute({ allowedRoles = [] }) {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  // Vérifier la connexion
  const token = localStorage.getItem("token");

  if (!token || !isAuthenticated || !user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // Vérifier les informations utilisateur
  if (
    typeof user !== "object" ||
    Array.isArray(user) ||
    !user.role
  ) {
    return <Navigate to="/login" replace />;
  }

  // Normaliser le rôle
  const userRole = String(user.role)
    .replace(/^ROLE_/, "")
    .toUpperCase();

  const normalizedRoles = allowedRoles.map((role) =>
    String(role)
      .replace(/^ROLE_/, "")
      .toUpperCase()
  );

  // Vérifier les autorisations
  if (
    normalizedRoles.length > 0 &&
    !normalizedRoles.includes(userRole)
  ) {
    return <Navigate to="/" replace />;
  }

  // Accès autorisé
  return <Outlet />;
}

export default ProtectedRoute;
