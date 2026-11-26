
import { useCallback, useEffect, useState } from "react";
import { Users, Trash2, RefreshCw } from "lucide-react";

import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminNavbar from "../../components/admin/AdminNavbar";
import Loader from "../../components/common/Loader";
import userService from "../../services/userService";

function getUserName(user) {
  if (!user) return "Non renseigné";

  const fullName = [user.firstName, user.lastName]
    .filter(Boolean)
    .join(" ");

  return fullName || user.name || "Non renseigné";
}

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  // Charger les utilisateurs
  const fetchUsers = useCallback(async () => {
    const data = await userService.getAllUsers();

    if (!Array.isArray(data)) {
      throw new Error(
        "Le serveur a retourné un format d'utilisateurs invalide."
      );
    }

    setUsers(data);
  }, []);

  // Chargement initial
  useEffect(() => {
    let isMounted = true;

    const initializeUsers = async () => {
      try {
        const data = await userService.getAllUsers();

        if (isMounted) {
          if (!Array.isArray(data)) {
            throw new Error(
              "Le serveur a retourné un format d'utilisateurs invalide."
            );
          }

          setUsers(data);
          setError("");
        }
      } catch (err) {
        console.error(
          "Erreur de chargement des utilisateurs :",
          err
        );

        if (isMounted) {
          setError(
            err.response?.data?.message ||
            err.message ||
            "Impossible de charger les utilisateurs."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  // Actualiser la liste
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError("");
      setSuccess("");

      await fetchUsers();
    } catch (err) {
      console.error(
        "Erreur d'actualisation des utilisateurs :",
        err
      );

      setError(
        err.response?.data?.message ||
        err.message ||
        "Impossible d'actualiser les utilisateurs."
      );
    } finally {
      setRefreshing(false);
    }
  };

  // Supprimer un utilisateur
  const handleDelete = async (user) => {
    if (!user?.id) return;

    if (String(user.role).replace(/^ROLE_/, "").toUpperCase() === "ADMIN") {
      setError("La suppression d'un compte administrateur est désactivée depuis cette page.");
      return;
    }

    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer le compte de ${getUserName(user)} ?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(user.id);
      setError("");
      setSuccess("");

      await userService.deleteUser(user.id);

      setUsers((currentUsers) =>
        currentUsers.filter(
          (currentUser) => currentUser.id !== user.id
        )
      );

      setSuccess("Utilisateur supprimé avec succès.");
    } catch (err) {
      console.error("Erreur de suppression :", err);

      setError(
        err.response?.data?.message ||
        "Impossible de supprimer cet utilisateur."
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <Loader
        message="Chargement des utilisateurs..."
        fullScreen
      />
    );
  }

  return (
    <div className="admin-layout">

      <AdminSidebar />

      <div className="admin-main">

        <AdminNavbar title="Gestion des utilisateurs" />

        <main className="admin-content">

          <div className="manage-users-header">

            <div>
              <span className="section-label">
                ADMINISTRATION
              </span>

              <h1>Gestion des utilisateurs</h1>

              <p>
                Consultez et gérez les comptes de vos clients.
              </p>
            </div>

            <button
              type="button"
              className="refresh-users-button"
              onClick={handleRefresh}
              disabled={refreshing || deletingId !== null}
            >
              <RefreshCw
                size={18}
                className={refreshing ? "animate-spin" : ""}
              />

              {refreshing ? "Actualisation..." : "Actualiser"}
            </button>

          </div>

          {/* Résumé */}
          <div className="users-summary">

            <Users size={25} />

            <div>
              <strong>{users.length}</strong>
              <span>Utilisateurs inscrits</span>
            </div>

          </div>

          {/* Messages */}
          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}

          {success && (
            <p className="users-success" role="status">
              {success}
            </p>
          )}

          {/* Liste des utilisateurs */}
          {users.length === 0 ? (
            <div className="users-empty">

              <Users size={40} />

              <h2>Aucun utilisateur</h2>

              <p>
                Aucun compte utilisateur n'a été trouvé.
              </p>

            </div>
          ) : (
            <div className="users-table-container">

              <table className="users-table">

                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nom</th>
                    <th>E-mail</th>
                    <th>Téléphone</th>
                    <th>Rôle</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>

                  {users.map((user) => {
                    const isAdmin =
                      String(user.role)
                        .replace(/^ROLE_/, "")
                        .toUpperCase() === "ADMIN";

                    return (
                      <tr key={user.id}>

                        <td>#{user.id}</td>

                        <td>{getUserName(user)}</td>

                        <td>
                          {user.email || "Non renseigné"}
                        </td>

                        <td>
                          {user.phone || "Non renseigné"}
                        </td>

                        <td>
                          {user.role || "CLIENT"}
                        </td>

                        <td>

                          <button
                            type="button"
                            className="delete-user-button"
                            onClick={() => handleDelete(user)}
                            disabled={
                              isAdmin ||
                              deletingId === user.id
                            }
                            aria-label={`Supprimer ${getUserName(user)}`}
                            title={
                              isAdmin
                                ? "La suppression des administrateurs est désactivée"
                                : "Supprimer cet utilisateur"
                            }
                          >
                            <Trash2 size={17} />

                            {deletingId === user.id
                              ? "Suppression..."
                              : isAdmin
                                ? "Administrateur"
                                : "Supprimer"}
                          </button>

                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>
          )}

        </main>

      </div>

    </div>
  );
}

export default ManageUsers;
