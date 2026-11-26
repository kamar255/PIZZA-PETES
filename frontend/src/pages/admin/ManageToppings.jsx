
import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Leaf,
  RefreshCw,
  CheckCircle,
  XCircle,
} from "lucide-react";

import toppingService from "../../services/toppingService";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminNavbar from "../../components/admin/AdminNavbar";
import Loader from "../../components/common/Loader";

const INITIAL_FORM = {
  name: "",
  description: "",
  price: "0",
  available: true,
};

function ManageToppings() {
  const [toppings, setToppings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTopping, setEditingTopping] = useState(null);
  const [formData, setFormData] = useState({ ...INITIAL_FORM });
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchToppings = useCallback(async () => {
    try {
      setError("");

      const response = await toppingService.getAllToppings();
      const data = Array.isArray(response)
        ? response
        : response?.data || [];

      setToppings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erreur chargement garnitures :", err);

      setError(
        err.response?.data?.message ||
          "Impossible de charger les garnitures."
      );
    } finally {
      setLoading(false);
    }
  }, []);

 useEffect(() => {
  let isMounted = true;

  const loadToppings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await toppingService.getAllToppings();

      const data = Array.isArray(response)
        ? response
        : response?.data || [];

      if (isMounted) {
        setToppings(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Erreur chargement garnitures :", err);

      if (isMounted) {
        setError(
          err.response?.data?.message ||
          "Impossible de charger les garnitures."
        );
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  };

  loadToppings();

  return () => {
    isMounted = false;
  };
}, []);

  const openAddModal = () => {
    setEditingTopping(null);
    setFormData({ ...INITIAL_FORM });
    setError("");
    setSuccess("");
    setIsModalOpen(true);
  };

  const openEditModal = (topping) => {
    setEditingTopping(topping);

    setFormData({
      name: topping.name || "",
      description: topping.description || "",
      price: String(topping.price ?? 0),
      available: topping.available ?? true,
    });

    setError("");
    setSuccess("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (submitting) return;

    setIsModalOpen(false);
    setEditingTopping(null);
    setFormData({ ...INITIAL_FORM });
    setError("");
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      setError("Le nom de la garniture est obligatoire.");
      return;
    }

    if (formData.price === "") {
      setError("Veuillez saisir un prix valide.");
      return;
    }

    const price = Number(formData.price);

    if (!Number.isFinite(price) || price < 0) {
      setError("Veuillez saisir un prix valide.");
      return;
    }

    const toppingData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price,
      available: formData.available,
    };

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      if (editingTopping) {
        await toppingService.updateTopping(
          editingTopping.id,
          toppingData
        );

        setSuccess("Garniture modifiée avec succès.");
      } else {
        await toppingService.createTopping(toppingData);

        setSuccess("Garniture ajoutée avec succès.");
      }

      setIsModalOpen(false);
      setEditingTopping(null);
      setFormData({ ...INITIAL_FORM });

      await fetchToppings();
    } catch (err) {
      console.error("Erreur sauvegarde garniture :", err);

      setError(
        err.response?.data?.message ||
          "Une erreur est survenue lors de l'enregistrement."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (topping) => {
    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer la garniture "${topping.name}" ?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(topping.id);
      setError("");
      setSuccess("");

      await toppingService.deleteTopping(topping.id);

      setSuccess("Garniture supprimée avec succès.");
      await fetchToppings();
    } catch (err) {
      console.error("Erreur suppression garniture :", err);

      setError(
        err.response?.data?.message ||
          "Impossible de supprimer cette garniture."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const availableCount = toppings.filter(
    (topping) => topping.available
  ).length;

  const unavailableCount = toppings.length - availableCount;

  if (loading) {
    return <Loader message="Chargement des garnitures..." fullScreen />;
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <div className="admin-main">
        <AdminNavbar title="Gestion des garnitures" />

        <main className="admin-content">
          <style>{`
            .toppings-page {
              color: #302923;
            }

            .toppings-heading {
              display: flex;
              justify-content: space-between;
              align-items: center;
              gap: 18px;
              margin-bottom: 28px;
            }

            .toppings-heading h1 {
              margin: 0 0 7px;
              color: #302923;
              font-family: var(--font-primary);
              font-size: 26px;
            }

            .toppings-heading p {
              margin: 0;
              color: #918579;
              font-size: 11px;
            }

            .toppings-add-button {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              gap: 9px;
              padding: 11px 17px;
              border: 1px solid #ad8248;
              border-radius: 5px;
              background: #ad8248;
              color: #fff;
              font-size: 10px;
              font-weight: 700;
              cursor: pointer;
              transition: .2s;
            }

            .toppings-add-button:hover {
              border-color: #956c37;
              background: #956c37;
            }

            .toppings-summary {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              margin-bottom: 28px;
              padding: 18px 0;
              border-top: 1px solid #e5dacb;
              border-bottom: 1px solid #e5dacb;
            }

            .toppings-summary-item {
              display: flex;
              align-items: center;
              gap: 13px;
              padding: 3px 22px;
              border-right: 1px solid #e5dacb;
            }

            .toppings-summary-item:first-child {
              padding-left: 5px;
            }

            .toppings-summary-item:last-child {
              border-right: none;
            }

            .toppings-summary-icon {
              color: #ad8248;
            }

            .toppings-summary-item span {
              display: block;
              margin-bottom: 5px;
              color: #968a7d;
              font-size: 10px;
            }

            .toppings-summary-item strong {
              color: #302923;
              font-size: 21px;
            }

            .toppings-alert {
              margin-bottom: 18px;
              padding: 12px 15px;
              border-left: 3px solid;
              font-size: 11px;
            }

            .toppings-alert.error {
              border-color: #bd5148;
              background: #f8e9e6;
              color: #a53f38;
            }

            .toppings-alert.success {
              border-color: #64865a;
              background: #e9f0e5;
              color: #527b4d;
            }

            .toppings-list-heading {
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 15px;
              padding: 18px 4px;
              border-top: 1px solid #e5dacb;
            }

            .toppings-list-heading h2 {
              margin: 0 0 5px;
              color: #302923;
              font-family: var(--font-primary);
              font-size: 17px;
            }

            .toppings-list-heading p {
              margin: 0;
              color: #968a7d;
              font-size: 10px;
            }

            .toppings-count {
              color: #a47b42;
              font-size: 10px;
              font-weight: 700;
            }

            .toppings-table-wrap {
              overflow-x: auto;
              border-top: 1px solid #e5dacb;
              border-bottom: 1px solid #e5dacb;
            }

            .toppings-table {
              width: 100%;
              min-width: 650px;
              border-collapse: collapse;
              text-align: left;
            }

            .toppings-table thead {
              background: #eee7db;
            }

            .toppings-table th {
              padding: 14px 15px;
              color: #827466;
              font-size: 9px;
              font-weight: 700;
              letter-spacing: 1px;
              text-transform: uppercase;
            }

            .toppings-table td {
              padding: 15px;
              border-bottom: 1px solid #eae2d7;
              color: #665c51;
              font-size: 11px;
            }

            .toppings-table tbody tr {
              background: rgba(255,255,255,.15);
              transition: background .2s;
            }

            .toppings-table tbody tr:nth-child(even) {
              background: rgba(237,230,219,.35);
            }

            .toppings-table tbody tr:hover {
              background: #eee6d9;
            }

            .topping-name-cell {
              display: flex;
              align-items: center;
              gap: 11px;
            }

            .topping-icon {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 35px;
              height: 35px;
              flex-shrink: 0;
              border: 1px solid #e5d8c5;
              border-radius: 50%;
              background: #f3ece1;
              color: #ad8248;
            }

            .topping-name-cell strong {
              color: #40372e;
              font-size: 11px;
            }

            .topping-description {
              max-width: 260px;
              color: #918579;
              line-height: 1.5;
            }

            .topping-price {
              color: #a47b42;
              font-size: 12px;
              font-weight: 700;
              white-space: nowrap;
            }

            .topping-availability {
              display: inline-flex;
              align-items: center;
              gap: 6px;
              padding: 6px 9px;
              border-radius: 4px;
              font-size: 9px;
              font-weight: 700;
              white-space: nowrap;
            }

            .topping-availability.available {
              background: #e4eee3;
              color: #527b4d;
            }

            .topping-availability.unavailable {
              background: #f7e4e2;
              color: #b84c45;
            }

            .toppings-actions {
              display: flex;
              align-items: center;
              gap: 7px;
            }

            .toppings-action {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 31px;
              height: 31px;
              border: 1px solid #dfd4c4;
              border-radius: 5px;
              background: transparent;
              color: #827466;
              cursor: pointer;
              transition: .2s;
            }

            .toppings-action.edit:hover {
              border-color: #bd9250;
              background: #f5eee3;
              color: #a47b42;
            }

            .toppings-action.delete:hover {
              border-color: #d8aaa3;
              background: #f8e9e6;
              color: #bd5148;
            }

            .toppings-action:disabled {
              opacity: .5;
              cursor: not-allowed;
            }

            .toppings-empty {
              padding: 50px 20px;
              color: #968a7d;
              text-align: center;
            }

            .toppings-empty svg {
              margin-bottom: 10px;
              color: #ad8248;
            }

            .toppings-empty h3 {
              margin: 0 0 7px;
              color: #51463b;
              font-size: 13px;
            }

            .toppings-empty p {
              margin: 0;
              font-size: 10px;
            }

            .toppings-modal-overlay {
              position: fixed;
              inset: 0;
              z-index: 300;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 20px;
              overflow-y: auto;
              background: rgba(37,31,25,.55);
              backdrop-filter: blur(4px);
            }

            .toppings-modal {
              width: 100%;
              max-width: 490px;
              padding: 27px;
              border: 1px solid #e6dac8;
              background: #f8f5ef;
              box-shadow: 0 20px 60px rgba(30,24,18,.2);
            }

            .toppings-modal-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 15px;
              padding-bottom: 18px;
              margin-bottom: 20px;
              border-bottom: 1px solid #e3d8c8;
            }

            .toppings-modal-header small {
              color: #ae854b;
              font-size: 9px;
              font-weight: 700;
              letter-spacing: 2px;
            }

            .toppings-modal-header h2 {
              margin: 6px 0 0;
              color: #302923;
              font-family: var(--font-primary);
              font-size: 20px;
            }

            .toppings-close {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 33px;
              height: 33px;
              border: 1px solid #dfd4c4;
              background: transparent;
              color: #665747;
              cursor: pointer;
            }

            .toppings-close:hover {
              border-color: #c64a37;
              color: #c64a37;
            }

            .toppings-form {
              display: flex;
              flex-direction: column;
              gap: 16px;
            }

            .toppings-field {
              display: flex;
              flex-direction: column;
              gap: 7px;
            }

            .toppings-field label {
              color: #675a4c;
              font-size: 10px;
              font-weight: 700;
            }

            .toppings-field input,
            .toppings-field textarea {
              width: 100%;
              box-sizing: border-box;
              padding: 11px 12px;
              border: 1px solid #e0d5c5;
              border-radius: 4px;
              outline: none;
              background: #fffdf9;
              color: #40372e;
              font-family: inherit;
              font-size: 11px;
              transition: border-color .2s;
            }

            .toppings-field input:focus,
            .toppings-field textarea:focus {
              border-color: #b38a50;
            }

            .toppings-field textarea {
              min-height: 85px;
              resize: vertical;
            }

            .toppings-availability-control {
              display: flex;
              align-items: center;
              gap: 10px;
              padding: 12px 0;
              border-top: 1px solid #e3d8c8;
              border-bottom: 1px solid #e3d8c8;
              color: #675a4c;
              font-size: 10px;
            }

            .toppings-availability-control input {
              width: 16px;
              height: 16px;
              accent-color: #ad8248;
              cursor: pointer;
            }

            .toppings-modal-actions {
              display: flex;
              justify-content: flex-end;
              gap: 9px;
              padding-top: 5px;
            }

            .toppings-modal-button {
              padding: 10px 19px;
              border: 1px solid #dfd4c4;
              background: transparent;
              color: #675a4c;
              font-size: 10px;
              cursor: pointer;
            }

            .toppings-modal-button.primary {
              border-color: #ad8248;
              background: #ad8248;
              color: white;
              font-weight: 700;
            }

            .toppings-modal-button.primary:hover {
              border-color: #956c37;
              background: #956c37;
            }

            .toppings-modal-button:disabled {
              opacity: .6;
              cursor: not-allowed;
            }

            @media (max-width: 700px) {
              .toppings-heading {
                align-items: flex-start;
                flex-direction: column;
              }

              .toppings-summary {
                grid-template-columns: 1fr;
                gap: 15px;
              }

              .toppings-summary-item {
                padding: 4px 5px;
                border-right: none;
              }

              .toppings-modal {
                padding: 20px;
              }
            }
          `}</style>

          <div className="toppings-page">
            <div className="toppings-heading">
              <div>
                <h1>Gestion des garnitures</h1>
                <p>
                  Gérez les ingrédients supplémentaires de vos pizzas.
                </p>
              </div>

              <button
                type="button"
                className="toppings-add-button"
                onClick={openAddModal}
              >
                <Plus size={17} />
                Ajouter une garniture
              </button>
            </div>

            {error && (
              <div className="toppings-alert error" role="alert">
                {error}
              </div>
            )}

            {success && (
              <div className="toppings-alert success" role="status">
                {success}
              </div>
            )}

            <section className="toppings-summary">
              <div className="toppings-summary-item">
                <Leaf className="toppings-summary-icon" size={23} />
                <div>
                  <span>Total des garnitures</span>
                  <strong>{toppings.length}</strong>
                </div>
              </div>

              <div className="toppings-summary-item">
                <CheckCircle
                  className="toppings-summary-icon"
                  size={23}
                />
                <div>
                  <span>Garnitures disponibles</span>
                  <strong>{availableCount}</strong>
                </div>
              </div>

              <div className="toppings-summary-item">
                <XCircle
                  className="toppings-summary-icon"
                  size={23}
                />
                <div>
                  <span>Garnitures indisponibles</span>
                  <strong>{unavailableCount}</strong>
                </div>
              </div>
            </section>

            <section>
              <div className="toppings-list-heading">
                <div>
                  <h2>Liste des garnitures</h2>
                  <p>
                    Consultez et gérez les ingrédients supplémentaires.
                  </p>
                </div>

                <span className="toppings-count">
                  {toppings.length} élément(s)
                </span>
              </div>

              {toppings.length === 0 ? (
                <div className="toppings-empty">
                  <Leaf size={35} />
                  <h3>Aucune garniture disponible</h3>
                  <p>
                    Ajoutez votre première garniture pour commencer.
                  </p>
                </div>
              ) : (
                <div className="toppings-table-wrap">
                  <table className="toppings-table">
                    <thead>
                      <tr>
                        <th>Garniture</th>
                        <th>Description</th>
                        <th>Prix</th>
                        <th>Disponibilité</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {toppings.map((topping) => (
                        <tr key={topping.id}>
                          <td>
                            <div className="topping-name-cell">
                              <div className="topping-icon">
                                <Leaf size={17} />
                              </div>
                              <strong>{topping.name}</strong>
                            </div>
                          </td>

                          <td>
                            <span className="topping-description">
                              {topping.description || "Aucune description"}
                            </span>
                          </td>

                          <td>
                            <span className="topping-price">
                              {Number(topping.price ?? 0).toFixed(2)} DT
                            </span>
                          </td>

                          <td>
                            <span
                              className={`topping-availability ${
                                topping.available
                                  ? "available"
                                  : "unavailable"
                              }`}
                            >
                              {topping.available ? (
                                <CheckCircle size={12} />
                              ) : (
                                <XCircle size={12} />
                              )}

                              {topping.available
                                ? "Disponible"
                                : "Indisponible"}
                            </span>
                          </td>

                          <td>
                            <div className="toppings-actions">
                              <button
                                type="button"
                                className="toppings-action edit"
                                onClick={() => openEditModal(topping)}
                                title="Modifier"
                                aria-label={`Modifier ${topping.name}`}
                              >
                                <Pencil size={15} />
                              </button>

                              <button
                                type="button"
                                className="toppings-action delete"
                                onClick={() => handleDelete(topping)}
                                disabled={deletingId === topping.id}
                                title="Supprimer"
                                aria-label={`Supprimer ${topping.name}`}
                              >
                                {deletingId === topping.id ? (
                                  <RefreshCw size={14} />
                                ) : (
                                  <Trash2 size={15} />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>

      {isModalOpen && (
        <div
          className="toppings-modal-overlay"
          onClick={closeModal}
        >
          <div
            className="toppings-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="toppings-modal-title"
          >
            <div className="toppings-modal-header">
              <div>
                <small>PIZZA PETE'S ADMINISTRATION</small>
                <h2 id="toppings-modal-title">
                  {editingTopping
                    ? "Modifier la garniture"
                    : "Nouvelle garniture"}
                </h2>
              </div>

              <button
                type="button"
                className="toppings-close"
                onClick={closeModal}
                disabled={submitting}
                aria-label="Fermer"
              >
                <X size={18} />
              </button>
            </div>

            <form className="toppings-form" onSubmit={handleSubmit}>
              <div className="toppings-field">
                <label htmlFor="topping-name">
                  Nom de la garniture
                </label>
                <input
                  id="topping-name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ex : Mozzarella, Olives, Champignons"
                  required
                />
              </div>

              <div className="toppings-field">
                <label htmlFor="topping-description">
                  Description
                </label>
                <textarea
                  id="topping-description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Description de la garniture..."
                />
              </div>

              <div className="toppings-field">
                <label htmlFor="topping-price">
                  Prix supplémentaire (DT)
                </label>
                <input
                  id="topping-price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="Ex : 2.00"
                  required
                />
              </div>

              <label className="toppings-availability-control">
                <input
                  type="checkbox"
                  name="available"
                  checked={formData.available}
                  onChange={handleChange}
                />
                Garniture disponible pour les clients
              </label>

              {error && (
                <div className="toppings-alert error" role="alert">
                  {error}
                </div>
              )}

              <div className="toppings-modal-actions">
                <button
                  type="button"
                  className="toppings-modal-button"
                  onClick={closeModal}
                  disabled={submitting}
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className="toppings-modal-button primary"
                  disabled={submitting}
                >
                  {submitting
                    ? "Enregistrement..."
                    : editingTopping
                      ? "Enregistrer les modifications"
                      : "Ajouter la garniture"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageToppings;
