
import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Wheat,
  CheckCircle,
  XCircle,
} from "lucide-react";

import doughService from "../../services/doughService";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminNavbar from "../../components/admin/AdminNavbar";
import Loader from "../../components/common/Loader";

const INITIAL_FORM = {
  name: "",
  description: "",
  extraPrice: "0",
  available: true,
};

function ManageDoughs() {
  const [doughs, setDoughs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDough, setEditingDough] = useState(null);
  const [formData, setFormData] = useState({ ...INITIAL_FORM });
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchDoughs = useCallback(async () => {
    try {
      setError("");

      const response = await doughService.getAllDoughs();
      const data = Array.isArray(response)
        ? response
        : response?.data || [];

      setDoughs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erreur chargement pâtes :", err);

      setError(
        err.response?.data?.message ||
          "Impossible de charger les pâtes."
      );
    } finally {
      setLoading(false);
    }
  }, []);

 useEffect(() => {
  let isMounted = true;

  const loadDoughs = async () => {
    try {
      setError("");

      const response = await doughService.getAllDoughs();
      const data = Array.isArray(response)
        ? response
        : response?.data || [];

      if (isMounted) {
        setDoughs(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Erreur chargement pâtes :", err);

      if (isMounted) {
        setError(
          err.response?.data?.message ||
          "Impossible de charger les pâtes."
        );
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  };

  loadDoughs();

  return () => {
    isMounted = false;
  };
}, []);

  const openAddModal = () => {
    setEditingDough(null);
    setFormData({ ...INITIAL_FORM });
    setError("");
    setSuccess("");
    setIsModalOpen(true);
  };

  const openEditModal = (dough) => {
    setEditingDough(dough);

    setFormData({
      name: dough.name || "",
      description: dough.description || "",
      extraPrice: String(dough.extraPrice ?? dough.price ?? 0),
      available: dough.available ?? true,
    });

    setError("");
    setSuccess("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (submitting) return;

    setIsModalOpen(false);
    setEditingDough(null);
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
      setError("Le nom de la pâte est obligatoire.");
      return;
    }

    if (formData.extraPrice === "") {
      setError("Veuillez saisir un supplément valide.");
      return;
    }

    const extraPrice = Number(formData.extraPrice);

    if (!Number.isFinite(extraPrice) || extraPrice < 0) {
      setError("Veuillez saisir un supplément valide.");
      return;
    }

    const doughData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      extraPrice,
      available: formData.available,
    };

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      if (editingDough) {
        await doughService.updateDough(
          editingDough.id,
          doughData
        );

        setSuccess("Pâte modifiée avec succès.");
      } else {
        await doughService.createDough(doughData);

        setSuccess("Pâte ajoutée avec succès.");
      }

      setIsModalOpen(false);
      setEditingDough(null);
      setFormData({ ...INITIAL_FORM });

      await fetchDoughs();
    } catch (err) {
      console.error("Erreur sauvegarde pâte :", err);

      setError(
        err.response?.data?.message ||
          "Une erreur est survenue lors de l'enregistrement."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (dough) => {
    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer la pâte "${dough.name}" ?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(dough.id);
      setError("");
      setSuccess("");

      await doughService.deleteDough(dough.id);

      setSuccess("Pâte supprimée avec succès.");
      await fetchDoughs();
    } catch (err) {
      console.error("Erreur suppression pâte :", err);

      setError(
        err.response?.data?.message ||
          "Impossible de supprimer cette pâte."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const availableCount = doughs.filter(
    (dough) => dough.available
  ).length;

  const unavailableCount = doughs.length - availableCount;

  if (loading) {
    return <Loader message="Chargement des pâtes..." fullScreen />;
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <div className="admin-main">
        <AdminNavbar title="Gestion des pâtes" />

        <main className="admin-content">
          <style>{`
            .doughs-page {
              color: #302923;
            }

            .doughs-heading {
              display: flex;
              justify-content: space-between;
              align-items: center;
              gap: 18px;
              margin-bottom: 28px;
            }

            .doughs-heading h1 {
              margin: 0 0 7px;
              color: #302923;
              font-family: var(--font-primary);
              font-size: 26px;
            }

            .doughs-heading p {
              margin: 0;
              color: #918579;
              font-size: 11px;
            }

            .doughs-add-button {
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

            .doughs-add-button:hover {
              border-color: #956c37;
              background: #956c37;
            }

            .doughs-summary {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              margin-bottom: 28px;
              padding: 18px 0;
              border-top: 1px solid #e5dacb;
              border-bottom: 1px solid #e5dacb;
            }

            .doughs-summary-item {
              display: flex;
              align-items: center;
              gap: 13px;
              padding: 3px 22px;
              border-right: 1px solid #e5dacb;
            }

            .doughs-summary-item:first-child {
              padding-left: 5px;
            }

            .doughs-summary-item:last-child {
              border-right: none;
            }

            .doughs-summary-icon {
              color: #ad8248;
            }

            .doughs-summary-item span {
              display: block;
              margin-bottom: 5px;
              color: #968a7d;
              font-size: 10px;
            }

            .doughs-summary-item strong {
              color: #302923;
              font-size: 21px;
            }

            .doughs-alert {
              margin-bottom: 18px;
              padding: 12px 15px;
              border-left: 3px solid;
              font-size: 11px;
            }

            .doughs-alert.error {
              border-color: #bd5148;
              background: #f8e9e6;
              color: #a53f38;
            }

            .doughs-alert.success {
              border-color: #64865a;
              background: #e9f0e5;
              color: #527b4d;
            }

            .doughs-list-heading {
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 15px;
              padding: 18px 4px;
              border-top: 1px solid #e5dacb;
            }

            .doughs-list-heading h2 {
              margin: 0 0 5px;
              color: #302923;
              font-family: var(--font-primary);
              font-size: 17px;
            }

            .doughs-list-heading p {
              margin: 0;
              color: #968a7d;
              font-size: 10px;
            }

            .doughs-count {
              color: #a47b42;
              font-size: 10px;
              font-weight: 700;
            }

            .doughs-table-wrap {
              overflow-x: auto;
              border-top: 1px solid #e5dacb;
              border-bottom: 1px solid #e5dacb;
            }

            .doughs-table {
              width: 100%;
              min-width: 650px;
              border-collapse: collapse;
              text-align: left;
            }

            .doughs-table thead {
              background: #eee7db;
            }

            .doughs-table th {
              padding: 14px 15px;
              color: #827466;
              font-size: 9px;
              font-weight: 700;
              letter-spacing: 1px;
              text-transform: uppercase;
            }

            .doughs-table td {
              padding: 15px;
              border-bottom: 1px solid #eae2d7;
              color: #665c51;
              font-size: 11px;
            }

            .doughs-table tbody tr {
              background: rgba(255,255,255,.15);
              transition: background .2s;
            }

            .doughs-table tbody tr:nth-child(even) {
              background: rgba(237,230,219,.35);
            }

            .doughs-table tbody tr:hover {
              background: #eee6d9;
            }

            .dough-name-cell {
              display: flex;
              align-items: center;
              gap: 11px;
            }

            .dough-icon {
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

            .dough-name-cell strong {
              color: #40372e;
              font-size: 11px;
            }

            .dough-description {
              max-width: 260px;
              color: #918579;
              line-height: 1.5;
            }

            .dough-price {
              color: #a47b42;
              font-size: 12px;
              font-weight: 700;
              white-space: nowrap;
            }

            .dough-availability {
              display: inline-flex;
              align-items: center;
              gap: 6px;
              padding: 6px 9px;
              border-radius: 4px;
              font-size: 9px;
              font-weight: 700;
              white-space: nowrap;
            }

            .dough-availability.available {
              background: #e4eee3;
              color: #527b4d;
            }

            .dough-availability.unavailable {
              background: #f7e4e2;
              color: #b84c45;
            }

            .doughs-actions {
              display: flex;
              align-items: center;
              gap: 7px;
            }

            .doughs-action {
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

            .doughs-action.edit:hover {
              border-color: #bd9250;
              background: #f5eee3;
              color: #a47b42;
            }

            .doughs-action.delete:hover {
              border-color: #d8aaa3;
              background: #f8e9e6;
              color: #bd5148;
            }

            .doughs-action:disabled {
              opacity: .5;
              cursor: not-allowed;
            }

            .doughs-empty {
              padding: 50px 20px;
              color: #968a7d;
              text-align: center;
            }

            .doughs-empty svg {
              margin-bottom: 10px;
              color: #ad8248;
            }

            .doughs-empty h3 {
              margin: 0 0 7px;
              color: #51463b;
              font-size: 13px;
            }

            .doughs-empty p {
              margin: 0;
              font-size: 10px;
            }

            .doughs-modal-overlay {
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

            .doughs-modal {
              width: 100%;
              max-width: 490px;
              padding: 27px;
              border: 1px solid #e6dac8;
              background: #f8f5ef;
              box-shadow: 0 20px 60px rgba(30,24,18,.2);
            }

            .doughs-modal-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 15px;
              padding-bottom: 18px;
              margin-bottom: 20px;
              border-bottom: 1px solid #e3d8c8;
            }

            .doughs-modal-header small {
              color: #ae854b;
              font-size: 9px;
              font-weight: 700;
              letter-spacing: 2px;
            }

            .doughs-modal-header h2 {
              margin: 6px 0 0;
              color: #302923;
              font-family: var(--font-primary);
              font-size: 20px;
            }

            .doughs-close {
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

            .doughs-close:hover {
              border-color: #c64a37;
              color: #c64a37;
            }

            .doughs-form {
              display: flex;
              flex-direction: column;
              gap: 16px;
            }

            .doughs-field {
              display: flex;
              flex-direction: column;
              gap: 7px;
            }

            .doughs-field label {
              color: #675a4c;
              font-size: 10px;
              font-weight: 700;
            }

            .doughs-field input,
            .doughs-field textarea {
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

            .doughs-field input:focus,
            .doughs-field textarea:focus {
              border-color: #b38a50;
            }

            .doughs-field textarea {
              min-height: 85px;
              resize: vertical;
            }

            .doughs-availability-control {
              display: flex;
              align-items: center;
              gap: 10px;
              padding: 12px 0;
              border-top: 1px solid #e3d8c8;
              border-bottom: 1px solid #e3d8c8;
              color: #675a4c;
              font-size: 10px;
            }

            .doughs-availability-control input {
              width: 16px;
              height: 16px;
              accent-color: #ad8248;
              cursor: pointer;
            }

            .doughs-modal-actions {
              display: flex;
              justify-content: flex-end;
              gap: 9px;
              padding-top: 5px;
            }

            .doughs-modal-button {
              padding: 10px 19px;
              border: 1px solid #dfd4c4;
              background: transparent;
              color: #675a4c;
              font-size: 10px;
              cursor: pointer;
            }

            .doughs-modal-button.primary {
              border-color: #ad8248;
              background: #ad8248;
              color: white;
              font-weight: 700;
            }

            .doughs-modal-button.primary:hover {
              border-color: #956c37;
              background: #956c37;
            }

            .doughs-modal-button:disabled {
              opacity: .6;
              cursor: not-allowed;
            }

            @media (max-width: 700px) {
              .doughs-heading {
                align-items: flex-start;
                flex-direction: column;
              }

              .doughs-summary {
                grid-template-columns: 1fr;
                gap: 15px;
              }

              .doughs-summary-item {
                padding: 4px 5px;
                border-right: none;
              }

              .doughs-modal {
                padding: 20px;
              }
            }
          `}</style>

          <div className="doughs-page">
            <div className="doughs-heading">
              <div>
                <h1>Gestion des pâtes</h1>
                <p>
                  Gérez les différents types de pâtes de vos pizzas.
                </p>
              </div>

              <button
                type="button"
                className="doughs-add-button"
                onClick={openAddModal}
              >
                <Plus size={17} />
                Ajouter une pâte
              </button>
            </div>

            {error && (
              <div className="doughs-alert error" role="alert">
                {error}
              </div>
            )}

            {success && (
              <div className="doughs-alert success" role="status">
                {success}
              </div>
            )}

            <section className="doughs-summary">
              <div className="doughs-summary-item">
                <Wheat className="doughs-summary-icon" size={23} />
                <div>
                  <span>Total des pâtes</span>
                  <strong>{doughs.length}</strong>
                </div>
              </div>

              <div className="doughs-summary-item">
                <CheckCircle
                  className="doughs-summary-icon"
                  size={23}
                />
                <div>
                  <span>Pâtes disponibles</span>
                  <strong>{availableCount}</strong>
                </div>
              </div>

              <div className="doughs-summary-item">
                <XCircle
                  className="doughs-summary-icon"
                  size={23}
                />
                <div>
                  <span>Pâtes indisponibles</span>
                  <strong>{unavailableCount}</strong>
                </div>
              </div>
            </section>

            <section>
              <div className="doughs-list-heading">
                <div>
                  <h2>Liste des pâtes</h2>
                  <p>
                    Consultez et gérez les types de pâtes proposés.
                  </p>
                </div>

                <span className="doughs-count">
                  {doughs.length} élément(s)
                </span>
              </div>

              {doughs.length === 0 ? (
                <div className="doughs-empty">
                  <Wheat size={35} />
                  <h3>Aucune pâte disponible</h3>
                  <p>
                    Ajoutez votre premier type de pâte pour commencer.
                  </p>
                </div>
              ) : (
                <div className="doughs-table-wrap">
                  <table className="doughs-table">
                    <thead>
                      <tr>
                        <th>Nom</th>
                        <th>Description</th>
                        <th>Supplément</th>
                        <th>Disponibilité</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {doughs.map((dough) => (
                        <tr key={dough.id}>
                          <td>
                            <div className="dough-name-cell">
                              <div className="dough-icon">
                                <Wheat size={17} />
                              </div>
                              <strong>{dough.name}</strong>
                            </div>
                          </td>

                          <td>
                            <span className="dough-description">
                              {dough.description || "Aucune description"}
                            </span>
                          </td>

                          <td>
                            <span className="dough-price">
                              {Number(
                                dough.extraPrice ?? dough.price ?? 0
                              ).toFixed(2)} DT
                            </span>
                          </td>

                          <td>
                            <span
                              className={`dough-availability ${
                                dough.available
                                  ? "available"
                                  : "unavailable"
                              }`}
                            >
                              {dough.available ? (
                                <CheckCircle size={12} />
                              ) : (
                                <XCircle size={12} />
                              )}

                              {dough.available
                                ? "Disponible"
                                : "Indisponible"}
                            </span>
                          </td>

                          <td>
                            <div className="doughs-actions">
                              <button
                                type="button"
                                className="doughs-action edit"
                                onClick={() => openEditModal(dough)}
                                title="Modifier"
                                aria-label={`Modifier ${dough.name}`}
                              >
                                <Pencil size={15} />
                              </button>

                              <button
                                type="button"
                                className="doughs-action delete"
                                onClick={() => handleDelete(dough)}
                                disabled={deletingId === dough.id}
                                title="Supprimer"
                                aria-label={`Supprimer ${dough.name}`}
                              >
                                <Trash2 size={15} />
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
          className="doughs-modal-overlay"
          onClick={closeModal}
        >
          <div
            className="doughs-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="doughs-modal-title"
          >
            <div className="doughs-modal-header">
              <div>
                <small>PIZZA PETE'S ADMINISTRATION</small>
                <h2 id="doughs-modal-title">
                  {editingDough
                    ? "Modifier la pâte"
                    : "Nouvelle pâte"}
                </h2>
              </div>

              <button
                type="button"
                className="doughs-close"
                onClick={closeModal}
                disabled={submitting}
                aria-label="Fermer"
              >
                <X size={18} />
              </button>
            </div>

            <form className="doughs-form" onSubmit={handleSubmit}>
              <div className="doughs-field">
                <label htmlFor="dough-name">
                  Nom de la pâte
                </label>
                <input
                  id="dough-name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ex : Fine, Épaisse, Sans gluten"
                  required
                />
              </div>

              <div className="doughs-field">
                <label htmlFor="dough-description">
                  Description
                </label>
                <textarea
                  id="dough-description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Description de la pâte..."
                />
              </div>

              <div className="doughs-field">
                <label htmlFor="dough-extra-price">
                  Supplément de prix (DT)
                </label>
                <input
                  id="dough-extra-price"
                  name="extraPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.extraPrice}
                  onChange={handleChange}
                  placeholder="Ex : 2.00"
                  required
                />
              </div>

              <label className="doughs-availability-control">
                <input
                  type="checkbox"
                  name="available"
                  checked={formData.available}
                  onChange={handleChange}
                />
                Pâte disponible pour les clients
              </label>

              {error && (
                <div className="doughs-alert error" role="alert">
                  {error}
                </div>
              )}

              <div className="doughs-modal-actions">
                <button
                  type="button"
                  className="doughs-modal-button"
                  onClick={closeModal}
                  disabled={submitting}
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className="doughs-modal-button primary"
                  disabled={submitting}
                >
                  {submitting
                    ? "Enregistrement..."
                    : editingDough
                      ? "Enregistrer les modifications"
                      : "Ajouter la pâte"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageDoughs;
