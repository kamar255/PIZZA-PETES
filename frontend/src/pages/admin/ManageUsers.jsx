
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Users,
  Trash2,
  RefreshCw,
  Search,
  UserRound,
  ShieldCheck,
  Mail,
  Phone,
  
} from "lucide-react";

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

function getRole(user) {
  return String(user?.role || "CLIENT")
    .replace(/^ROLE_/, "")
    .toUpperCase();
}

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [userToDelete, setUserToDelete] = useState(null);

  const fetchUsers = useCallback(async () => {
    const data = await userService.getAllUsers();

    if (!Array.isArray(data)) {
      throw new Error(
        "Le serveur a retourné un format d'utilisateurs invalide."
      );
    }

    setUsers(data);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initializeUsers = async () => {
      try {
        const data = await userService.getAllUsers();

        if (!Array.isArray(data)) {
          throw new Error(
            "Le serveur a retourné un format d'utilisateurs invalide."
          );
        }

        if (isMounted) {
          setUsers(data);
          setError("");
        }
      } catch (err) {
        console.error("Erreur de chargement des utilisateurs :", err);

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

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError("");
      setSuccess("");

      await fetchUsers();
      setSuccess("Liste des utilisateurs actualisée.");
    } catch (err) {
      console.error("Erreur d'actualisation :", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Impossible d'actualiser les utilisateurs."
      );
    } finally {
      setRefreshing(false);
    }
  };

  const handleDelete = async () => {
    if (!userToDelete?.id) return;

    if (getRole(userToDelete) === "ADMIN") {
      setError(
        "La suppression d'un compte administrateur est désactivée."
      );
      setUserToDelete(null);
      return;
    }

    try {
      setDeletingId(userToDelete.id);
      setError("");
      setSuccess("");

      await userService.deleteUser(userToDelete.id);

      setUsers((currentUsers) =>
        currentUsers.filter(
          (currentUser) => currentUser.id !== userToDelete.id
        )
      );

      setSuccess("Utilisateur supprimé avec succès.");
      setUserToDelete(null);
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

  const filteredUsers = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) return users;

    return users.filter((user) => {
      const name = getUserName(user).toLowerCase();
      const email = (user.email || "").toLowerCase();
      const phone = (user.phone || "").toLowerCase();

      return (
        name.includes(search) ||
        email.includes(search) ||
        phone.includes(search)
      );
    });
  }, [users, searchTerm]);

  const adminCount = users.filter(
    (user) => getRole(user) === "ADMIN"
  ).length;

  const clientCount = users.length - adminCount;

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
          <style>{`
            .users-page {
              color: #302923;
            }

            .users-page-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 18px;
              margin-bottom: 27px;
            }

            .users-page-header h1 {
              margin: 7px 0;
              color: #302923;
              font-size: 26px;
              font-family: var(--font-primary);
            }

            .users-page-header p {
              margin: 0;
              color: #918579;
              font-size: 11px;
            }

            .users-eyebrow {
              color: #ad8248;
              font-size: 9px;
              font-weight: 700;
              letter-spacing: 2px;
            }

            .users-refresh-button {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              gap: 9px;
              padding: 11px 16px;
              border: 1px solid #d8c9b4;
              border-radius: 4px;
              background: transparent;
              color: #80643e;
              font-size: 10px;
              font-weight: 700;
              cursor: pointer;
              transition: .2s;
            }

            .users-refresh-button:hover {
              border-color: #ad8248;
              background: #eee7db;
            }

            .users-refresh-button:disabled {
              opacity: .6;
              cursor: not-allowed;
            }

            .users-summary {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              padding: 18px 0;
              margin-bottom: 25px;
              border-top: 1px solid #e5dacb;
              border-bottom: 1px solid #e5dacb;
            }

            .users-summary-item {
              display: flex;
              align-items: center;
              gap: 13px;
              padding: 3px 22px;
              border-right: 1px solid #e5dacb;
            }

            .users-summary-item:first-child {
              padding-left: 5px;
            }

            .users-summary-item:last-child {
              border-right: none;
            }

            .users-summary-icon {
              color: #ad8248;
            }

            .users-summary-item span {
              display: block;
              margin-bottom: 5px;
              color: #968a7d;
              font-size: 10px;
            }

            .users-summary-item strong {
              color: #302923;
              font-size: 21px;
            }

            .users-alert {
              margin-bottom: 16px;
              padding: 12px 15px;
              border-left: 3px solid;
              font-size: 11px;
            }

            .users-alert.error {
              border-color: #bd5148;
              background: #f8e9e6;
              color: #a53f38;
            }

            .users-alert.success {
              border-color: #64865a;
              background: #e9f0e5;
              color: #527b4d;
            }

            .users-toolbar {
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 15px;
              padding: 17px 4px;
              border-top: 1px solid #e5dacb;
            }

            .users-toolbar h2 {
              margin: 0 0 5px;
              color: #302923;
              font-family: var(--font-primary);
              font-size: 17px;
            }

            .users-toolbar p {
              margin: 0;
              color: #968a7d;
              font-size: 10px;
            }

            .users-search-box {
              display: flex;
              align-items: center;
              gap: 9px;
              width: 260px;
              max-width: 100%;
              padding: 10px 12px;
              border: 1px solid #e0d5c5;
              border-radius: 4px;
              background: #fffdf9;
              color: #a18f7b;
            }

            .users-search-box input {
              width: 100%;
              min-width: 0;
              border: none;
              outline: none;
              background: transparent;
              color: #40372e;
              font-size: 10px;
            }

            .users-search-box input::placeholder {
              color: #a99d90;
            }

            .users-table-container {
              overflow-x: auto;
              border-top: 1px solid #e5dacb;
              border-bottom: 1px solid #e5dacb;
            }

            .users-table {
              width: 100%;
              min-width: 760px;
              border-collapse: collapse;
              text-align: left;
            }

            .users-table thead {
              background: #eee7db;
            }

            .users-table th {
              padding: 14px 15px;
              color: #827466;
              font-size: 9px;
              font-weight: 700;
              letter-spacing: 1px;
              text-transform: uppercase;
            }

            .users-table td {
              padding: 14px 15px;
              border-bottom: 1px solid #eae2d7;
              color: #665c51;
              font-size: 11px;
            }

            .users-table tbody tr {
              background: rgba(255,255,255,.15);
              transition: background .2s;
            }

            .users-table tbody tr:nth-child(even) {
              background: rgba(237,230,219,.35);
            }

            .users-table tbody tr:hover {
              background: #eee6d9;
            }

            .users-id {
              color: #a58c6b;
              font-size: 10px;
            }

            .users-name-cell {
              display: flex;
              align-items: center;
              gap: 10px;
              min-width: 170px;
            }

            .users-avatar {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 34px;
              height: 34px;
              flex-shrink: 0;
              border: 1px solid #e5d8c5;
              border-radius: 50%;
              background: #f3ece1;
              color: #ad8248;
            }

            .users-name-cell strong {
              color: #40372e;
              font-size: 11px;
            }

            .users-contact {
              display: inline-flex;
              align-items: center;
              gap: 7px;
              color: #82776a;
              white-space: nowrap;
            }

            .users-contact svg {
              color: #ad8248;
            }

            .users-role {
              display: inline-flex;
              align-items: center;
              gap: 6px;
              padding: 6px 9px;
              border-radius: 4px;
              font-size: 9px;
              font-weight: 700;
            }

            .users-role.admin {
              background: #f5ead8;
              color: #98703b;
            }

            .users-role.client {
              background: #e8eee5;
              color: #597b53;
            }

            .users-delete-button {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              gap: 7px;
              padding: 8px 10px;
              border: 1px solid #dfc8c2;
              border-radius: 4px;
              background: transparent;
              color: #ae5148;
              font-size: 9px;
              font-weight: 700;
              cursor: pointer;
              transition: .2s;
            }

            .users-delete-button:hover:not(:disabled) {
              border-color: #bd5148;
              background: #f8e9e6;
            }

            .users-delete-button:disabled {
              opacity: .45;
              cursor: not-allowed;
            }

            .users-empty {
              padding: 50px 20px;
              color: #968a7d;
              text-align: center;
            }

            .users-empty svg {
              margin-bottom: 10px;
              color: #ad8248;
            }

            .users-empty h2 {
              margin: 0 0 7px;
              color: #51463b;
              font-size: 14px;
            }

            .users-empty p {
              margin: 0;
              font-size: 10px;
            }

            .users-confirm-overlay {
              position: fixed;
              inset: 0;
              z-index: 300;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 20px;
              background: rgba(37,31,25,.55);
              backdrop-filter: blur(4px);
            }

            .users-confirm-modal {
              width: 100%;
              max-width: 400px;
              padding: 27px;
              border: 1px solid #e6dac8;
              background: #f8f5ef;
              box-shadow: 0 20px 60px rgba(30,24,18,.2);
            }

            .users-confirm-icon {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 43px;
              height: 43px;
              margin-bottom: 17px;
              border-radius: 50%;
              background: #f8e9e6;
              color: #bd5148;
            }

            .users-confirm-modal h2 {
              margin: 0 0 9px;
              color: #302923;
              font-family: var(--font-primary);
              font-size: 19px;
            }

            .users-confirm-modal p {
              margin: 0;
              color: #817568;
              font-size: 11px;
              line-height: 1.7;
            }

            .users-confirm-actions {
              display: flex;
              justify-content: flex-end;
              gap: 9px;
              margin-top: 23px;
            }

            .users-confirm-actions button {
              padding: 10px 15px;
              border: 1px solid #dfd4c4;
              background: transparent;
              color: #675a4c;
              font-size: 10px;
              cursor: pointer;
            }

            .users-confirm-actions .danger {
              border-color: #b94c42;
              background: #b94c42;
              color: #fff;
              font-weight: 700;
            }

            .users-confirm-actions button:disabled {
              opacity: .6;
              cursor: not-allowed;
            }

            @media (max-width: 700px) {
              .users-page-header {
                align-items: flex-start;
                flex-direction: column;
              }

              .users-summary {
                grid-template-columns: 1fr;
                gap: 15px;
              }

              .users-summary-item {
                padding: 4px 5px;
                border-right: none;
              }

              .users-toolbar {
                align-items: flex-start;
                flex-direction: column;
              }

              .users-search-box {
                width: 100%;
                box-sizing: border-box;
              }
            }
          `}</style>

          <div className="users-page">
            <div className="users-page-header">
              <div>
                <span className="users-eyebrow">
                  ADMINISTRATION
                </span>

                <h1>Gestion des utilisateurs</h1>

                <p>
                  Consultez et gérez les comptes de vos clients.
                </p>
              </div>

              <button
                type="button"
                className="users-refresh-button"
                onClick={handleRefresh}
                disabled={refreshing || deletingId !== null}
              >
                <RefreshCw
                  size={16}
                  className={refreshing ? "animate-spin" : ""}
                />

                {refreshing ? "Actualisation..." : "Actualiser"}
              </button>
            </div>

            {error && (
              <div className="users-alert error" role="alert">
                {error}
              </div>
            )}

            {success && (
              <div className="users-alert success" role="status">
                {success}
              </div>
            )}

            <section className="users-summary">
              <div className="users-summary-item">
                <Users
                  className="users-summary-icon"
                  size={24}
                />
                <div>
                  <span>Total des utilisateurs</span>
                  <strong>{users.length}</strong>
                </div>
              </div>

              <div className="users-summary-item">
                <UserRound
                  className="users-summary-icon"
                  size={24}
                />
                <div>
                  <span>Clients</span>
                  <strong>{clientCount}</strong>
                </div>
              </div>

              <div className="users-summary-item">
                <ShieldCheck
                  className="users-summary-icon"
                  size={24}
                />
                <div>
                  <span>Administrateurs</span>
                  <strong>{adminCount}</strong>
                </div>
              </div>
            </section>

            <section>
              <div className="users-toolbar">
                <div>
                  <h2>Liste des utilisateurs</h2>
                  <p>
                    Consultez les informations et les rôles des comptes.
                  </p>
                </div>

                <div className="users-search-box">
                  <Search size={16} />
                  <input
                    type="search"
                    placeholder="Rechercher un utilisateur..."
                    value={searchTerm}
                    onChange={(event) =>
                      setSearchTerm(event.target.value)
                    }
                    aria-label="Rechercher un utilisateur"
                  />
                </div>
              </div>

              {filteredUsers.length === 0 ? (
                <div className="users-empty">
                  <Users size={38} />

                  <h2>
                    {users.length === 0
                      ? "Aucun utilisateur"
                      : "Aucun résultat"}
                  </h2>

                  <p>
                    {users.length === 0
                      ? "Aucun compte utilisateur n'a été trouvé."
                      : "Aucun utilisateur ne correspond à votre recherche."}
                  </p>
                </div>
              ) : (
                <div className="users-table-container">
                  <table className="users-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Utilisateur</th>
                        <th>E-mail</th>
                        <th>Téléphone</th>
                        <th>Rôle</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredUsers.map((user) => {
                        const role = getRole(user);
                        const isAdmin = role === "ADMIN";

                        return (
                          <tr key={user.id}>
                            <td>
                              <span className="users-id">
                                #{user.id}
                              </span>
                            </td>

                            <td>
                              <div className="users-name-cell">
                                <div className="users-avatar">
                                  <UserRound size={17} />
                                </div>
                                <strong>{getUserName(user)}</strong>
                              </div>
                            </td>

                            <td>
                              <span className="users-contact">
                                <Mail size={13} />
                                {user.email || "Non renseigné"}
                              </span>
                            </td>

                            <td>
                              <span className="users-contact">
                                <Phone size={13} />
                                {user.phone || "Non renseigné"}
                              </span>
                            </td>

                            <td>
                              <span
                                className={`users-role ${
                                  isAdmin ? "admin" : "client"
                                }`}
                              >
                                {isAdmin ? (
                                  <ShieldCheck size={12} />
                                ) : (
                                  <UserRound size={12} />
                                )}
                                {role}
                              </span>
                            </td>

                            <td>
                              <button
                                type="button"
                                className="users-delete-button"
                                onClick={() => {
                                  setError("");
                                  setSuccess("");
                                  setUserToDelete(user);
                                }}
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
                                <Trash2 size={14} />
                                {deletingId === user.id
                                  ? "Suppression..."
                                  : isAdmin
                                    ? "Protégé"
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
            </section>
          </div>
        </main>
      </div>

      {userToDelete && (
        <div
          className="users-confirm-overlay"
          onClick={() => {
            if (!deletingId) setUserToDelete(null);
          }}
        >
          <div
            className="users-confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="users-confirm-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="users-confirm-icon">
              <Trash2 size={21} />
            </div>

            <h2 id="users-confirm-title">
              Supprimer cet utilisateur ?
            </h2>

            <p>
              Voulez-vous vraiment supprimer le compte de{" "}
              <strong>{getUserName(userToDelete)}</strong> ?
              Cette action est définitive.
            </p>

            <div className="users-confirm-actions">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                disabled={deletingId !== null}
              >
                Annuler
              </button>

              <button
                type="button"
                className="danger"
                onClick={handleDelete}
                disabled={deletingId !== null}
              >
                {deletingId !== null
                  ? "Suppression..."
                  : "Confirmer la suppression"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageUsers;
